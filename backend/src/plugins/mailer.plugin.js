import fp from 'fastify-plugin';
import { ENVIRONMENT } from '#src/constants/index.js';
import { sendBrevoEmailIntegration } from '#src/integrations/index.js';

function buildMailer({ appConfig, log }) {
  return {
    async sendEmail({ to, subject, html, text }) {
      if (!appConfig.BREVO_API_KEY) {
        if (appConfig.NODE_ENV === ENVIRONMENT.PRODUCTION) {
          log.error({ subject }, 'Email not sent, BREVO_API_KEY is empty');
        } else {
          log.info(
            { to, subject, text },
            'Email not sent, BREVO_API_KEY is empty. Its text is here instead',
          );
        }

        return false;
      }

      try {
        await sendBrevoEmailIntegration({
          appConfig,
          to,
          subject,
          html,
          text,
        });

        return true;
      } catch (error) {
        log.error({ err: error, subject }, 'Email could not be sent');

        return false;
      }
    },
  };
}

async function registerMailer(fastify, { mailer }) {
  fastify.decorate(
    'mailer',
    mailer ?? buildMailer({ appConfig: fastify.config, log: fastify.log }),
  );
}

export const mailerPlugin = fp(registerMailer);
