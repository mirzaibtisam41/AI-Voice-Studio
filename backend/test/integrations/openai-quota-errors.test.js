import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RateLimitError } from 'openai';
import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  mapOpenAiErrorIntegration,
  mapRealtimeErrorIntegration,
} from '#src/integrations/index.js';
import { ProviderError } from '#src/utils/index.js';

describe('OpenAI quota errors', () => {
  it('maps an exhausted credit balance on the REST API to quota_exceeded', () => {
    const error = new RateLimitError(
      429,
      { code: 'credit_balance_exhausted', type: 'insufficient_quota' },
      'You have no credits remaining.',
      new Headers(),
    );

    assert.equal(
      mapOpenAiErrorIntegration({ error }),
      PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED,
    );
  });

  it('keeps a plain 429 as rate_limited', () => {
    const error = new RateLimitError(
      429,
      { code: 'rate_limit_exceeded', type: 'requests' },
      'Too many requests',
      new Headers(),
    );

    assert.equal(
      mapOpenAiErrorIntegration({ error }),
      PROVIDER_ERROR_CATEGORY.RATE_LIMITED,
    );
  });

  it('maps a realtime error event about credits to quota_exceeded', () => {
    assert.equal(
      mapRealtimeErrorIntegration({
        error: {
          error: {
            code: 'credit_balance_exhausted',
            type: 'insufficient_quota',
          },
        },
      }),
      PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED,
    );
  });

  it('reads the code and type from a realtime SDK error message', () => {
    const error = new Error(
      'You have no credits remaining. code=credit_balance_exhausted param=null type=insufficient_quota event_id=null',
    );

    assert.equal(
      mapRealtimeErrorIntegration({ error }),
      PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED,
    );
  });

  it('names the provider generically in the internal error message', () => {
    const error = new ProviderError({
      category: PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED,
    });

    assert.equal(error.message, 'AI provider request failed: quota_exceeded');
  });
});
