const baseStyles = `
  body { margin: 0; padding: 0; background-color: #F7F3EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .card { background-color: #ffffff; border-radius: 12px; padding: 32px; }
  .logo { font-size: 22px; font-weight: 700; color: #6F8F7B; margin-bottom: 24px; }
  h1 { font-size: 20px; color: #2F2F2F; margin: 0 0 16px; }
  p { font-size: 15px; color: #6E6A66; line-height: 1.6; margin: 0 0 16px; }
  .code { display: inline-block; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #2F2F2F; background-color: #F7F3EE; border-radius: 8px; padding: 12px 24px; margin: 8px 0 24px; }
  .btn { display: inline-block; background-color: #6F8F7B; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px; }
  .footer { margin-top: 32px; font-size: 13px; color: #B0A99F; text-align: center; }
`;

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles}</style></head>
<body><div class="container"><div class="card">
  <div class="logo">CoParent</div>
  ${content}
</div><div class="footer">This email was sent by CoParent. If you did not expect this, you can safely ignore it.</div></div></body>
</html>`;
}

export function inviteTemplate(inviterName: string, spaceTitle: string, inviteCode: string): string {
  return wrap(`
    <h1>You&rsquo;re invited to join a Space</h1>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${spaceTitle}</strong> on CoParent.</p>
    <p>Use the invite code below to get started:</p>
    <div style="text-align:center"><span class="code">${inviteCode}</span></div>
    <p>Open the CoParent app, go to <strong>Join a Space</strong>, and enter the code above.</p>
  `);
}

export function exportReadyTemplate(userName: string, exportType: string, attachmentUrl?: string): string {
  const downloadLink = attachmentUrl
    ? `<p style="margin-top:24px"><a class="btn" href="${attachmentUrl}">Download Export</a></p>`
    : '';

  return wrap(`
    <h1>Your export is ready</h1>
    <p>Hi ${userName},</p>
    <p>Your <strong>${exportType}</strong> export from CoParent is ready.</p>
    ${downloadLink}
    <p>If the button doesn&rsquo;t work, you can also find your export in the app under <strong>Settings &rarr; Exports</strong>.</p>
  `);
}

export function reminderTemplate(userName: string, reminderType: string, details: string): string {
  return wrap(`
    <h1>${reminderType}</h1>
    <p>Hi ${userName},</p>
    <p>${details}</p>
  `);
}
