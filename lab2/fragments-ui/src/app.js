import { signIn, getUser, signOut } from './auth.js';
import { getUserFragments } from './api.js';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const user = await getUser();
  if (user) {
    userSection.innerHTML = `
      <p>Welcome, ${user.username}!</p>
      <button id="logout">Logout</button>
    `;
    const logoutBtn = document.querySelector('#logout');
    logoutBtn.addEventListener('click', async () => {
      await signOut();
    });
    try {
      const fragments = await getUserFragments(user);
      console.log('User fragments:', fragments);
    } catch (error) {
      console.error('Failed to get fragments:', error);
    }
  } else {
    loginBtn.addEventListener('click', signIn);
  }
}

addEventListener('DOMContentLoaded', init);