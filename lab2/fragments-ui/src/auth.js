import { UserManager } from 'oidc-client-ts';

const cognitoDomain = `https://${process.env.AWS_COGNITO_POOL_ID}.auth.us-east-1.amazoncognito.com`.replace(
  /_.+?\.auth\./,
  '.auth.'
);
// If your domain is custom, hardcode it instead of the line above.

const userManager = new UserManager({
  authority: cognitoDomain,               // e.g., https://your-domain.auth.us-east-1.amazoncognito.com
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: 'code',
  scope: 'openid email phone',
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false
});

function formatUser(user) {
  return {
    username: user?.profile?.['cognito:username'],
    email: user?.profile?.email,
    idToken: user?.id_token,
    accessToken: user?.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`
    })
  };
}

export async function signIn() {
  await userManager.signinRedirect();
}

export async function getUser() {
  if (window.location.search.includes('code=')) {
    const user = await userManager.signinCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
