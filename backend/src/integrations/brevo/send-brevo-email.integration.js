export async function sendBrevoEmailIntegration({
  appConfig,
  to,
  subject,
  html,
  text,
}) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': appConfig.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: appConfig.MAIL_FROM_EMAIL,
        name: 'AI Voice Studio',
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Brevo answered with status ${response.status}`);
  }

  const { messageId } = await response.json();

  return { messageId };
}
