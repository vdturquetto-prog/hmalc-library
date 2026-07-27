import { apiGet, apiPost } from '../api.js';

export async function renderAdminCirculation() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading circulation…</div>`;

  let checkouts;
  try {
    checkouts = await apiGet('checkouts.currentlyOut');
  } catch (err) {
    app.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }

  checkouts.sort((a, b) => (a.overdue === b.overdue ? 0 : a.overdue ? -1 : 1));

  app.innerHTML = `
    <h1>Circulation — Currently Checked Out</h1>
    <button class="btn btn-primary" onclick="window.__openCheckoutForm()">+ Manual Checkout</button>
    <div id="checkoutForm"></div>
    ${checkouts.length === 0 ? '<p class="empty-state">Nothing is currently checked out.</p>' : ''}
    <table class="admin-table">
      <thead><tr><th>Item</th><th>Held by</th><th>Checked out</th><th>Due</th><th></th></tr></thead>
      <tbody>
        ${checkouts.map((c) => `
          <tr class="${c.overdue ? 'row-overdue' : ''}">
            <td>${escape(c.item_title)}</td>
            <td>${escape(c.user_name)}</td>
            <td>${new Date(c.checkout_date).toLocaleDateString()}</td>
            <td>${c.due_date ? new Date(c.due_date).toLocaleDateString() : '—'} ${c.overdue ? '<span class="badge-overdue">OVERDUE</span>' : ''}</td>
            <td><button class="btn-sm" onclick="window.__returnItem('${c.checkout_id}')">Mark Returned</button></td>
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

window.__returnItem = async function (checkoutId) {
  try {
    await apiPost('items.return', { checkoutId });
    await renderAdminCirculation();
  } catch (err) {
    alert(err.message);
  }
};

window.__openCheckoutForm = async function () {
  const container = document.getElementById('checkoutForm');
  container.innerHTML = `<div class="form-card"><p>Loading items and staff…</p></div>`;
  let items, users;
  try {
    [items, users] = await Promise.all([apiGet('items.list'), apiGet('users.list')]);
  } catch (err) {
    container.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }
  const available = items.filter((i) => i.copies_available > 0);
  const teachers = users.filter((u) => u.active !== false);

  container.innerHTML = `
    <div class="form-card">
      <h2>Manual Checkout</h2>
      <label>Item
        <select id="coItem">
          ${available.map((i) => `<option value="${i.item_id}">${escape(i.title)} (${i.copies_available} available)</option>`).join('')}
        </select>
      </label>
      <label>Staff member
        <select id="coUser">
          ${teachers.map((u) => `<option value="${u.user_id}">${escape(u.first_name)} ${escape(u.last_name)} (${u.user_id})</option>`).join('')}
        </select>
      </label>
      <label>Due date <input id="coDue" type="date" /></label>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="window.__submitCheckout()">Check Out</button>
        <button class="btn" onclick="document.getElementById('checkoutForm').innerHTML=''">Cancel</button>
      </div>
      <div id="checkoutMsg"></div>
    </div>
  `;
};

window.__submitCheckout = async function () {
  const msg = document.getElementById('checkoutMsg');
  msg.textContent = 'Checking out…';
  try {
    await apiPost('items.checkout', {
      itemId: document.getElementById('coItem').value,
      userId: document.getElementById('coUser').value,
      dueDate: document.getElementById('coDue').value,
    });
    await renderAdminCirculation();
  } catch (err) {
    msg.textContent = err.message;
  }
};
