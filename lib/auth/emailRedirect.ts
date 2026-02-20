export function getEmailRedirectUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const normalizedBase = appUrl?.trim().replace(/\/$/, '');

  if (normalizedBase) {
    return `${normalizedBase}/auth/callback`;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return '/auth/callback';
}
