import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import {
  CREDIT_TRANSACTION_EXPORT_MAX_ROWS,
  CREDIT_TRANSACTION_TYPE_LABEL,
} from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { listCreditTransactionsRepository } from '#src/modules/credit-transactions/shared/repositories/index.js';
import { buildCreditTransactionFilterUtil } from '#src/modules/credit-transactions/shared/utils/index.js';

const CSV_HEADER = [
  'Date',
  'Type',
  'Feature',
  'Description',
  'Credits',
  'Balance after',
];

const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';

  let text = String(value);

  if (typeof value === 'string' && FORMULA_PREFIX.test(text)) {
    text = `'${text}`;
  }

  if (NEEDS_QUOTES.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function buildRow(transaction) {
  return [
    transaction.createdAt.toISOString(),
    CREDIT_TRANSACTION_TYPE_LABEL[transaction.type] ?? transaction.type,
    CAPABILITY_DETAILS[transaction.capability]?.label ?? '',
    transaction.reason ?? '',
    transaction.amount,
    transaction.balanceAfter,
  ];
}

export async function exportMyTransactionsService({ userId, query }) {
  const transactions = await listCreditTransactionsRepository({
    filter: buildCreditTransactionFilterUtil({
      userId,
      type: query.type,
      capability: query.capability,
    }),
    limit: CREDIT_TRANSACTION_EXPORT_MAX_ROWS,
  });

  return [CSV_HEADER, ...transactions.map(buildRow)]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
}
