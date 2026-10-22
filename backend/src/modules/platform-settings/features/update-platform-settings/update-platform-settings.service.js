import { runInTransactionUtil } from '#src/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { updatePlatformSettingsRepository } from '#src/modules/platform-settings/shared/repositories/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

function normalize({ data }) {
  if (data.maintenanceMessage === undefined) return data;

  return { ...data, maintenanceMessage: data.maintenanceMessage.trim() };
}

export function updatePlatformSettingsService({ actor, data }) {
  const changes = normalize({ data });

  return runInTransactionUtil({
    work: async ({ session }) => {
      const existing = await getPlatformSettingsService({ session });
      const changedFields = Object.keys(changes).filter(
        (field) => existing[field] !== changes[field],
      );

      if (changedFields.length === 0) return existing;

      const after = Object.fromEntries(
        changedFields.map((field) => [field, changes[field]]),
      );
      const settings = await updatePlatformSettingsRepository({
        session,
        data: after,
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.SETTINGS_UPDATED,
        targetType: AUDIT_TARGET_TYPE.SETTINGS,
        targetId: settings._id,
        targetLabel: 'Platform settings',
        details: {
          before: Object.fromEntries(
            changedFields.map((field) => [field, existing[field]]),
          ),
          after,
        },
      });

      return settings;
    },
  });
}
