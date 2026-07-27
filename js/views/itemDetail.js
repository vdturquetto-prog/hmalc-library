import { apiGet, apiPost } from '../api.js';

export async function renderItemDetail({ id }) {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading item…</div>`;

  let item;
  try {
    item = await apiGet('items.get', { itemId: id });
  } catch (err) {
    app.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }

  app.innerHTML = `
    <a href="#/items" class="back-link">&larr; Back to inventory</a>
    <div class="item-detail">
      <div class="item-detail-cover" style="${item.cover_image_url ? `background-image:url('${item.cover_image_url}')` : ''}"></div>
      <div class="item-detail-info">
        <h1>${escape(item.title)}</h1>
        <p class="item-meta">${escape(item.creators || '')}</p>
        <p class="item-meta">${escape(item.publisher || '')} ${item.publish_date ? '· ' + escape(item.publish_date) : ''}</p>
        <p class="item-collection">${escape(item.collection || '')} ${item.group ? '· ' + escape(item.group) : ''}</p>
        <p class="item-description">${escape(item.description || 'No description available.')}</p>
        ${item.recommended_level ? `<p><strong>Level:</strong> ${escape(item.recommended_level)}</p>` : ''}
        ${item.condition ? `<p><strong>Condition:</strong> ${escape(item.condition)}</p>` : ''}
        ${item.purchase_link ? `<p><a href="${item.purchase_link}" target="_blank" rel="noopener">Purchase link</a></p>` : ''}
        <div class="availability-block ${item.copies_available > 0 ? 'available' : 'unavailable'}">
          ${item.copies_available > 0 ? item.copies_available + ' of ' + item.total_copies + ' available' : 'All copies currently checked out'}
        </div>
        <div id="requestArea"></div>
      </div>
    </div>
  `;

  const requestArea = document.getElementById('requestArea');
  if (item.copies_available > 0) {
    requestArea.innerHTML = `<button class="btn btn-primary" onclick="window.__requestBorrow('${item.item_id}')">Request to Borrow</button>`;
  } else {
    requestArea.innerHTML = `<button class="btn btn-disabled" disabled>Not currently available</button>`;
  }
}

function escape(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

window.__requestBorrow = async function (itemId) {
  const area = document.getElementById('requestArea');
  area.innerHTML = `<p>Sending request…</p>`;
  try {
    await apiPost('borrowRequests.create', { itemId });
    area.innerHTML = `<p class="success-box">Request sent! Check "My Requests" for updates.</p>`;
  } catch (err) {
    area.innerHTML = `<p class="error-box">${err.message}</p>
      <button class="btn btn-primary" onclick="window.__requestBorrow('${itemId}')">Try Again</button>`;
  }
};
