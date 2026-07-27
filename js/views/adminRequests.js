import { apiGet, apiPost } from '../api.js';

export async function renderAdminRequests() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading requests…</div>`;

  let requests;
  try {
    requests = await apiGet('borrowRequests.listAll');
  } catch (err) {
    app.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }

  const pending = requests.filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(a.requested_date) - new Date(b.requested_date));
  const handled = requests.filter((r) => r.status !== 'pending')
    .sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date))
    .slice(0, 20);

  app.innerHTML = `
    <h1>Borrow Request Queue</h1>
    <h2>Pending (${pending.length})</h2>
    ${pending.length === 0 ? '<p class="empty-state">No pending requests.</p>' : ''}
    <div class="request-list">
      ${pending.map((r) => `
        <div class="request-row status-pending">
          <div class="request-title">${escape(r.item_title)}</div>
          <div class="request-status">Requested by ${escape(r.user_name)} on ${new Date(r.requested_date).toLocaleDateString()}</div>
          <div class="form-actions">
            <input id="due-${r.request_id}" type="date" />
            <button class="btn-sm btn-primary" onclick="window.__approveRequest('${r.request_id}')">Approve &amp; Check Out</button>
            <button class="btn-sm btn-danger" onclick="window.__denyRequest('${r.request_id}')">Deny</button>
          </div>
        </div>
      `).join('')}
    </div>
    <h2>Recently Handled</h2>
    <div class="request-list">
      ${handled.map((r) => `
        <div class="request-row status-${r.status}">
          <div class="request-title">${escape(r.item_title)}</div>
          <div class="request-status">${escape(r.user_name)} — ${r.status}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function escape(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

window.__approveRequest = async function (requestId) {
  const dueInput = document.getElementById('due-' + requestId);
  try {
    await apiPost('borrowRequests.approve', { requestId, dueDate: dueInput ? dueInput.value : '' });
    await renderAdminRequests();
  } catch (err) {
    alert(err.message);
  }
};

window.__denyRequest = async function (requestId) {
  const note = prompt('Optional note for the teacher (why it was denied):', '') || '';
  try {
    await apiPost('borrowRequests.deny', { requestId, adminNotes: note });
    await renderAdminRequests();
  } catch (err) {
    alert(err.message);
  }
};
