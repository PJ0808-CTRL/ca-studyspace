export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = configuredUrl ?? (vercelProductionHost ? `https://${vercelProductionHost}` : "http://localhost:3000");

  return url.replace(/\/$/, "");
}
