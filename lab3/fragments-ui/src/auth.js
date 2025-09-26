// src/auth.js
import { UserManager } from 'oidc-client-ts';

const HOSTED = process.env.AWS_COGNITO_HOSTED; // e.g. https://<your-prefix>.auth.us-east-1.amazoncognito.com
const ISSUER = `https://cognito-idp.us-east-1.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`;

// Hand the endpoints to the library so it won't fetch /.well-known/*
const metadata = {
  issuer: ISSUER,
  authorization_endpoint: `${HOSTED}/oauth2/authorize`,
  token_endpoint: `${HOSTED}/oauth2/token`,
  userinfo_endpoint: `${HOSTED}/oauth2/userInfo`,
  end_session_endpoint: `${HOSTED}/logout`,
  jwks_uri: `${ISSUER}/.well-known/jwks.json`,
};

export const userManager = new UserManager({
  authority: ISSUER,              // <-- issuer, NOT the hosted UI
  metadata,                       // <-- prevents discovery fetch (no CORS)
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: 'code',
  scope: 'openid email phone',
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false,
});


export async function signIn() {
  await userManager.signinRedirect();
}

export async function signOut() {
  const user = await userManager.getUser();
  await userManager.removeUser();
  await userManager.signoutRedirect({
    post_logout_redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
    id_token_hint: user?.id_token,
    extraQueryParams: {
      client_id: process.env.AWS_COGNITO_CLIENT_ID,
      logout_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
    },
  });
}

function formatUser(user) {
  return {
    username: user?.profile?.['cognito:username'],
    email: user?.profile?.email,
    idToken: user?.id_token,
    accessToken: user?.access_token,
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
