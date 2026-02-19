export async function sendBookingEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log({ to, subject, body });
    return;
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'BookEase <noreply@bookease.app>', to, subject, text: body })
  });
}
