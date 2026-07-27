import { apiPost, setToken } from '../api.js';
import { state } from '../state.js';
import { navigate } from '../router.js';

export function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <h1>HMALC Library</h1>
        <p class="auth-sub">Sign in with the account your admin created for you.</p>
        <div id="loginError" class="error-box" style="display:none"></div>
        <label>Email
          <input id="loginEmail" type="email" autocomplete="username" />
        </label>
        <label>Password
          <input id="loginPassword" type="password" autocomplete="current-password" />
        </label>
        <button class="btn btn-primary" onclick="window.__doLogin()">Sign In</button>
        <p class="auth-hint">Don't have an account? Ask an admin to create one for you.</p>
      </div>
    </div>
  `;
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') window.__doLogin();
  });
}

window.__doLogin = async function () {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorBox = document.getElementById('loginError');
  errorBox.style.display = 'none';

  try {
    const result = await apiPost('auth.login', { email, password });
    setToken(result.token);
    state.user = result.user;
    navigate(result.user.role === 'admin' ? '#/admin/items' : '#/items');
    window.location.reload(); // simplest way to re-init nav/role-gated shell after login
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
  }
};
