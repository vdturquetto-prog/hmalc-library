import { apiGet, apiPost } from '../api.js';

export async function renderAdminStaff() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading staff…</div>`;

  let users;
  try {
    users = await apiGet('users.list');
  } catch (err) {
    app.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }

  app.innerHTML = `
    <h1>Manage Staff</h1>
    <button class="btn btn-primary" onclick="window.__openStaffForm()">+ Add Staff Account</button>
    <div id="staffForm"></div>
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${users.map((u) => `
          <tr>
            <td>${escape(u.first_name)} ${escape(u.last_name)}</td>
            <td>${escape(u.user_id)}</td>
            <td>${escape(u.role)}</td>
            <td>${u.active === false || u.active === 'FALSE' ? 'Deactivated' : 'Active'}</td>
            <td>
              <button class="btn-sm" onclick="window.__openResetForm('${u.user_id}')">Reset Password</button>
              <button class="btn-sm btn-danger" onclick="window.__deactivateStaff('${u.user_id}')">Deactivate</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function escape(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

window.__openStaffForm = function () {
  document.getElementById('staffForm').innerHTML = `
    <div class="form-card">
      <h2>Add Staff Account</h2>
      <label>Email <input id="sEmail" type="email" /></label>
      <label>First name <input id="sFirst" /></label>
      <label>Last name <input id="sLast" /></label>
      <label>Role
        <select id="sRole"><option value="teacher">Teacher</option><option value="admin">Admin</option></select>
      </label>
      <label>Temporary password <input id="sPassword" type="text" /></label>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="window.__createStaff()">Create Account</button>
        <button class="btn" onclick="document.getElementById('staffForm').innerHTML=''">Cancel</button>
      </div>
      <div id="staffFormMsg"></div>
    </div>
  `;
};

window.__createStaff = async function () {
  const msg = document.getElementById('staffFormMsg');
  msg.textContent = 'Creating…';
  try {
    await apiPost('users.create', {
      email: document.getElementById('sEmail').value,
      firstName: document.getElementById('sFirst').value,
      lastName: document.getElementById('sLast').value,
      role: document.getElementById('sRole').value,
      password: document.getElementById('sPassword').value,
    });
    await renderAdminStaff();
  } catch (err) {
    msg.textContent = err.message;
  }
};

window.__openResetForm = function (userId) {
  document.getElementById('staffForm').innerHTML = `
    <div class="form-card">
      <h2>Reset Password — ${escape(userId)}</h2>
      <label>New temporary password <input id="rNewPassword" type="text" /></label>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="window.__submitReset('${userId}')">Reset Password</button>
        <button class="btn" onclick="document.getElementById('staffForm').innerHTML=''">Cancel</button>
      </div>
      <div id="resetMsg"></div>
    </div>
  `;
};

window.__submitReset = async function (userId) {
  const msg = document.getElementById('resetMsg');
  msg.textContent = 'Resetting…';
  try {
    await apiPost('users.resetPassword', { userId, newPassword: document.getElementById('rNewPassword').value });
    msg.textContent = 'Password reset. Give the new temporary password to the staff member directly.';
  } catch (err) {
    msg.textContent = err.message;
  }
};

window.__deactivateStaff = async function (userId) {
  if (!confirm('Deactivate this account? They will no longer be able to log in.')) return;
  try {
    await apiPost('users.deactivate', { userId });
    await renderAdminStaff();
  } catch (err) {
    alert(err.message);
  }
};
