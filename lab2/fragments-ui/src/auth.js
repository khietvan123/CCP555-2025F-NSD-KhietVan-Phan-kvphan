import { UserManager } from 'oidc-client-ts';

const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`,
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: 'code',
  scope: 'phone openid email',
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false,
};

const userManager = new UserManager({
  ...cognitoAuthConfig,
});

export { userManager };

export async function signIn() {
  await userManager.signinRedirect();
}

export async function signOut() {
  try {
    // Clear the user from the UserManager first
    await userManager.removeUser();
  } catch (error) {
    console.error('Error clearing local session:', error);
  }

  // For Cognito, construct the Hosted UI logout URL using env-configured domain
  const region = (process.env.AWS_COGNITO_POOL_ID || '').split('_')[0] || 'us-east-1';
  const domainPrefix = process.env.AWS_COGNITO_DOMAIN;
  if (!domainPrefix) {
    console.error('Missing AWS_COGNITO_DOMAIN for logout');
    return;
  }
  const logoutUrl = `https://${domainPrefix}.auth.${region}.amazoncognito.com/logout?client_id=${process.env.AWS_COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(process.env.OAUTH_SIGN_IN_REDIRECT_URL)}`;
  window.location.href = logoutUrl;
}

function formatUser(user) {
  console.log('User Authenticated', { user });
  return {
    username: user.profile.preferred_username || user.profile.email,
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
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