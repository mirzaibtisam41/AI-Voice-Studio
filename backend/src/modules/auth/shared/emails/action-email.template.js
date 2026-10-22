const APP_NAME = 'AI Voice Studio';

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildActionEmailTemplate({
  subject,
  name,
  intro,
  buttonLabel,
  link,
  outro,
}) {
  const greeting = `Hi ${name},`;

  const text = [
    greeting,
    '',
    intro,
    '',
    `${buttonLabel}: ${link}`,
    '',
    outro,
    '',
    APP_NAME,
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#1d1b2e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:14px;font-weight:bold;color:#5a48e0;">${APP_NAME}</p>
          <p style="margin:0 0 16px;font-size:15px;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.5;">${escapeHtml(intro)}</p>
          <p style="margin:0 0 24px;">
            <a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;background:#5a48e0;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">${escapeHtml(buttonLabel)}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#6f6d88;line-height:1.5;">${escapeHtml(outro)}</p>
          <p style="margin:0;font-size:12px;color:#8886a3;word-break:break-all;">${escapeHtml(link)}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
