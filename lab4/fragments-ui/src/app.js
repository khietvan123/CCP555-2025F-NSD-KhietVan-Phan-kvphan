// src/app.js
import { signIn, getUser, signOut } from './auth';
import { getUserFragments } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  // default (not signed in yet)
  userSection.hidden = true;
  if (loginBtn) {
    loginBtn.hidden = false;
    loginBtn.onclick = () => signIn();
  }

  const user = await getUser();
  if (!user) return; // still not signed in

  // signed in → show user area, hide login
  userSection.hidden = false;
  if (loginBtn) loginBtn.hidden = true;

  userSection.innerHTML = `
    <p>Welcome, ${user.username}!</p>
    <button id="logout">Logout</button>
  `;
  document.querySelector('#logout').onclick = async () => {
    await signOut();
  };

  try {
    const data = await getUserFragments(user);
    console.log('User fragments:', data);
  } catch (err) {
    console.error('Failed to get fragments:', err);
  }
}

addEventListener('DOMContentLoaded', init);
