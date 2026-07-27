import { apiGet } from '../api.js';

const STATUS_LABEL = {
  pending: 'Pending review',
  fulfilled: 'Approved — checked out to you',
  denied: 'Denied',
};

export async function renderMyRequests() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading your requests…</div>`;

  let requests;
  try {
    requests = await apiGet('borrowRequests.listMine');
  } catch (err) {
    app.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }

  requests.sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date));

  app.innerHTML = `
    <h1>My Requests</h1>
    ${requests.length === 0 ? '<p class="empty-state">You haven\'t requested any items yet.</p>' : ''}
    <div class="request-list">
      ${requests.map((r) => `
        <div class="request-row status-${r.status}">
          <div class="request-title">${escape(r.item_title)}</div>
          <div class="request-status">${STATUS_LABEL[r.status] || r.status}</div>
          <div class="request-date">Requested ${new Date(r.requested_date).toLocaleDateString()}</div>
          ${r.admin_notes ? `<div class="request-notes">Note from admin: ${escape(r.admin_notes)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function escape(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
