import { NotFoundError, runInTransactionUtil } from '#src/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import {
  findVoiceByIdRepository,
  updateVoiceRepository,
} from '#src/modules/voices/shared/repositories/index.js';

function normalizeTags({ tags }) {
  const seen = new Set();

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });
}

function buildChanges({ data }) {
  const changes = {};

  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.accent !== undefined) changes.accent = data.accent.trim();
  if (data.gender !== undefined) changes.gender = data.gender;
  if (data.tags !== undefined)
    changes.tags = normalizeTags({ tags: data.tags });
  if (data.description !== undefined) {
    changes.description = data.description?.trim() || null;
  }
  if (data.enabled !== undefined) changes.enabled = data.enabled;
  if (data.sortOrder !== undefined) changes.sortOrder = data.sortOrder;

  return changes;
}

function readValue({ voice, field }) {
  return field === 'tags' ? [...voice.tags] : voice[field];
}

export function updateVoiceService({ actor, id, data }) {
  const changes = buildChanges({ data });

  return runInTransactionUtil({
    work: async ({ session }) => {
      const existing = await findVoiceByIdRepository({ session, id });

      if (!existing) {
        throw new NotFoundError('Voice not found');
      }

      const changedFields = Object.keys(changes).filter(
        (field) =>
          JSON.stringify(readValue({ voice: existing, field })) !==
          JSON.stringify(changes[field]),
      );

      if (changedFields.length === 0) return existing;

      const after = Object.fromEntries(
        changedFields.map((field) => [field, changes[field]]),
      );
      const voice = await updateVoiceRepository({ session, id, data: after });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.VOICE_UPDATED,
        targetType: AUDIT_TARGET_TYPE.VOICE,
        targetId: voice._id,
        targetLabel: voice.name,
        details: {
          before: Object.fromEntries(
            changedFields.map((field) => [
              field,
              readValue({ voice: existing, field }),
            ]),
          ),
          after,
        },
      });

      return voice;
    },
  });
}
