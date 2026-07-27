import { apiGet, apiPost, getToken, setToken } from './api.js';
import { registerRoute, startRouter, navigate } from './router.js';
import { state, isAdmin, displayName } from './state.js';
import { renderLogin } from './views/login.js';
import { renderBrowse } from './views/browse.js';
import { renderItemDetail } from './views/itemDetail.js';
import { renderMyRequests } from './views/myRequests.js';
import { renderProfile } from './views/profile.js';
import { renderAdminItems } from './views/adminItems.js';
import { renderAdminCirculation } from './views/adminCirculation.js';
import { renderAdminRequests } from './views/adminRequests.js';
import { renderAdminStaff } from './views/adminStaff.js';

function requireRole(role, renderFn) {
  return async (params) => {
    if (!state.user) return renderLogin();
    if (role === 'admin' && !isAdmin()) {
      document.getElementById('app').innerHTML = '<p class="error-box">Admin access required.</p>';
      return;
    }
    renderNav();
    await renderFn(params);
  };
}

registerRoute('/', requireRole('any', () => navigate(isAdmin() ? '#/admin/items' : '#/items')));
registerRoute('/items', requireRole('any', renderBrowse));
registerRoute('/items/:id', requireRole('any', renderItemDetail));
registerRoute('/requests', requireRole('any', renderMyRequests));
registerRoute('/profile', requireRole('any', renderProfile));
registerRoute('/admin/items', requireRole('admin', renderAdminItems));
registerRoute('/admin/circulation', requireRole('admin', renderAdminCirculation));
registerRoute('/admin/requests', requireRole('admin', renderAdminRequests));
registerRoute('/admin/staff', requireRole('admin', renderAdminStaff));

function renderNav() {
  const nav = document.getElementById('nav');
  const admin = isAdmin();
  nav.className = admin ? 'nav nav-admin' : 'nav nav-teacher';
  nav.innerHTML = admin ? `
    <span class="nav-brand">HMALC Admin</span>
    <a href="#/admin/items">Items</a>
    <a href="#/admin/circulation">Circulation</a>
    <a href="#/admin/requests">Requests</a>
    <a href="#/admin/staff">Staff</a>
    <span class="nav-user">${displayName(state.user)}</span>
    <button class="nav-logout" onclick="window.__logout()">Log out</button>
  ` : `
    <span class="nav-brand">📚 HMALC Library</span>
    <a href="#/items">Browse</a>
    <a href="#/requests">My Requests</a>
    <a href="#/profile">Profile</a>
    <button class="nav-logout" onclick="window.__logout()">Log out</button>
  `;
}

window.__logout = async function () {
  try { await apiPost('auth.logout'); } catch (err) { /* ignore — logging out locally regardless */ }
  setToken('');
  state.user = null;
  state.items = null;
  window.location.hash = '';
  window.location.reload();
};

async function boot() {
  if (getToken()) {
    try {
      state.user = await apiGet('auth.me');
    } catch (err) {
      setToken('');
      state.user = null;
    }
  }

  if (!state.user) {
    document.getElementById('nav').innerHTML = '';
    renderLogin();
    return;
  }

  startRouter();
}

boot();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline shell just won't be available */ });
  });
}
