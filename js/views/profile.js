import { apiPost } from '../api.js';
import { state } from '../state.js';

export function renderProfile() {
  const user = state.user;
  document.getElementById('app').innerHTML = `
    <h1>My Profile</h1>
    <div class="profile-card">
      <label>First name <input id="pFirst" value="${attr(user.first_name)}" /></label>
      <label>Last name <input id="pLast" value="${attr(user.last_name)}" /></label>
      <label>Photo URL <input id="pPhoto" value="${attr(user.photo_url)}" placeholder="https://…" /></label>
      <label>Bio <textarea id="pBio" rows="3">${escape(user.bio)}</textarea></label>
      <button class="btn btn-primary" onclick="window.__saveProfile()">Save Profile</button>
      <div id="profileMsg"></div>
    </div>

    <h2>Change Password</h2>
    <div class="profile-card">
      <label>Current password <input id="curPass" type="password" /></label>
      <label>New password <input id="newPass" type="password" /></label>
      <button class="btn" onclick="window.__changePassword()">Update Password</button>
      <div id="passwordMsg"></div>
    </div>
  `;
}

function attr(str) {
  return (str || '').replace(/"/g, '&quot;');
}
function escape(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

window.__saveProfile = async function () {
  const msg = document.getElementById('profileMsg');
  msg.textContent = 'Saving…';
  try {
    const updated = await apiPost('users.update', {
      firstName: document.getElementById('pFirst').value,
      lastName: document.getElementById('pLast').value,
      photoUrl: document.getElementById('pPhoto').value,
      bio: document.getElementById('pBio').value,
    });
    state.user = updated;
    msg.textContent = 'Saved.';
  } catch (err) {
    msg.textContent = err.message;
  }
};

window.__changePassword = async function () {
  const msg = document.getElementById('passwordMsg');
  msg.textContent = 'Updating…';
  try {
    await apiPost('auth.changePassword', {
      currentPassword: document.getElementById('curPass').value,
      newPassword: document.getElementById('newPass').value,
    });
    document.getElementById('curPass').value = '';
    document.getElementById('newPass').value = '';
    msg.textContent = 'Password updated.';
  } catch (err) {
    msg.textContent = err.message;
  }
};
