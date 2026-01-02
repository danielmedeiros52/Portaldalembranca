export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Portal da Lembrança";

export const APP_LOGO = "/brand/logo-icon.png";
export const APP_LOGO_HORIZONTAL = "/brand/logo-horizontal.png";
export const APP_LOGO_VERTICAL = "/brand/logo-vertical.png";
export const APP_LOGO_DARK = "/brand/logo-icon-dark.png";
export const APP_LOGO_HORIZONTAL_DARK = "/brand/logo-horizontal-dark.png";
export const APP_LOGO_VERTICAL_DARK = "/brand/logo-vertical-dark.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
