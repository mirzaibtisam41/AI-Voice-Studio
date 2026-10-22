import { NotFoundError } from '#src/utils/index.js';
import {
  AI_CAPABILITIES,
  AI_CAPABILITY,
  CAPABILITY_DETAILS,
} from '#src/constants/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  sumUserGenerationUsageRepository,
  sumUserRefundsRepository,
} from '#src/modules/usage/shared/repositories/index.js';
import {
  buildUsageWindowStartUtil,
  listLocalDaysUtil,
  resolveTimezoneUtil,
} from '#src/modules/usage/shared/utils/index.js';

const REALTIME_CAPABILITIES = [
  AI_CAPABILITY.REALTIME,
  AI_CAPABILITY.VOICE_AGENT,
];

function sumBy(rows, field) {
  return rows.reduce((total, row) => total + row[field], 0);
}

function buildCounts(completedRows) {
  const ofCapabilities = (capabilities) =>
    completedRows.filter((row) => capabilities.includes(row.capability));
  const realtimeSeconds = sumBy(ofCapabilities(REALTIME_CAPABILITIES), 'units');

  return {
    speechGenerated: sumBy(
      ofCapabilities([AI_CAPABILITY.TEXT_TO_SPEECH]),
      'runs',
    ),
    transcriptions: sumBy(
      ofCapabilities([AI_CAPABILITY.SPEECH_TO_TEXT]),
      'runs',
    ),
    realtimeMinutes: Math.round((realtimeSeconds / 60) * 10) / 10,
    agentMessages: sumBy(ofCapabilities([AI_CAPABILITY.AGENT_CHAT]), 'units'),
  };
}

export async function getMyUsageService({ userId, days, timezone }) {
  const zone = resolveTimezoneUtil({ timezone });
  const now = new Date();
  const dayList = listLocalDaysUtil({ days, timezone: zone, now });
  const since = buildUsageWindowStartUtil({ days, now });

  const [wallet, generationRows, refundRows] = await Promise.all([
    findCreditWalletByUserIdRepository({ userId }),
    sumUserGenerationUsageRepository({ userId, since, timezone: zone }),
    sumUserRefundsRepository({ userId, since, timezone: zone }),
  ]);

  if (!wallet) {
    throw new NotFoundError('Credit wallet not found');
  }

  const inRange = new Set(dayList);
  const rows = generationRows.filter((row) => inRange.has(row.day));
  const completedRows = rows.filter(
    (row) => row.status === GENERATION_STATUS.COMPLETED,
  );
  const failedRows = rows.filter(
    (row) => row.status === GENERATION_STATUS.FAILED,
  );

  const creditsByDay = new Map(dayList.map((day) => [day, 0]));

  for (const row of completedRows) {
    creditsByDay.set(row.day, creditsByDay.get(row.day) + row.credits);
  }

  return {
    days,
    timezone: zone,
    balance: wallet.balance,
    totals: {
      creditsUsed: sumBy(completedRows, 'credits'),
      creditsRefunded: sumBy(
        refundRows.filter((row) => inRange.has(row.day)),
        'credits',
      ),
      runs: sumBy(completedRows, 'runs'),
      failedRuns: sumBy(failedRows, 'runs'),
    },
    byCapability: AI_CAPABILITIES.map((capability) => {
      const capabilityRows = completedRows.filter(
        (row) => row.capability === capability,
      );

      return {
        capability,
        label: CAPABILITY_DETAILS[capability].label,
        credits: sumBy(capabilityRows, 'credits'),
        runs: sumBy(capabilityRows, 'runs'),
      };
    }),
    daily: dayList.map((date) => ({ date, credits: creditsByDay.get(date) })),
    counts: buildCounts(completedRows),
  };
}
