import { apiGet, apiPost } from '../api.js';

let cache = [];
let editingId = null;

export async function renderAdminItems() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading items…</div>`;
  try {
    cache = await apiGet('items.list');
  } catch (err) {
    app.innerHTML = `<div class="error-box">${err.message}</div>`;
    return;
  }
  editingId = null;
  paint();
}

function paint() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Manage Items</h1>
    <button class="btn btn-primary" onclick="window.__openItemForm()">+ Add Item</button>
    <div id="itemForm"></div>
    <table class="admin-table">
      <thead><tr>
        <th>Title</th><th>Type</th><th>Collection</th><th>Copies</th><th>Available</th><th></th>
      </tr></thead>
      <tbody>
        ${cache.map((it) => `
          <tr>
            <td>${escape(it.title)}</td>
            <td>${escape(it.item_type)}</td>
            <td>${escape(it.collection)}</td>
            <td>${it.total_copies}</td>
            <td>${it.copies_available}</td>
            <td>
              <button class="btn-sm" onclick="window.__openItemForm('${it.item_id}')">Edit</button>
              <button class="btn-sm btn-danger" onclick="window.__deactivateItem('${it.item_id}')">Deactivate</button>
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

window.__openItemForm = function (itemId) {
  editingId = itemId || null;
  const item = editingId ? cache.find((i) => i.item_id === editingId) : {};
  document.getElementById('itemForm').innerHTML = `
    <div class="form-card">
      <h2>${editingId ? 'Edit Item' : 'Add Item'}</h2>
      <label>Title <input id="fTitle" value="${attr(item.title)}" /></label>
      <label>Type
        <select id="fType">
          <option value="book" ${item.item_type === 'book' ? 'selected' : ''}>Book</option>
          <option value="boardgame" ${item.item_type === 'boardgame' ? 'selected' : ''}>Board Game</option>
          <option value="other" ${item.item_type === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </label>
      <label>Creators/Author <input id="fCreators" value="${attr(item.creators)}" /></label>
      <label>Publisher <input id="fPublisher" value="${attr(item.publisher)}" /></label>
      <label>Collection <input id="fCollection" value="${attr(item.collection)}" /></label>
      <label>Group <input id="fGroup" value="${attr(item.group)}" /></label>
      <label>ISBN-13 <input id="fIsbn13" value="${attr(item.isbn13)}" /></label>
      <label>Description <textarea id="fDescription" rows="3">${escape(item.description)}</textarea></label>
      <label>Cover Image URL <input id="fCover" value="${attr(item.cover_image_url)}" /></label>
      <label>Purchase Link <input id="fPurchase" value="${attr(item.purchase_link)}" /></label>
      <label>Recommended Level <input id="fLevel" value="${attr(item.recommended_level)}" /></label>
      <label>Condition
        <select id="fCondition">
          ${['New', 'Good', 'Fair', 'Worn', 'Damaged'].map((c) => `<option ${item.condition === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label>Total Copies <input id="fCopies" type="number" min="0" value="${item.total_copies != null ? item.total_copies : 1}" /></label>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="window.__saveItem()">Save</button>
        <button class="btn" onclick="window.__closeItemForm()">Cancel</button>
      </div>
      <div id="itemFormMsg"></div>
    </div>
  `;
};

function attr(str) {
  return (str == null ? '' : String(str)).replace(/"/g, '&quot;');
}

window.__closeItemForm = function () {
  editingId = null;
  document.getElementById('itemForm').innerHTML = '';
};

window.__saveItem = async function () {
  const msg = document.getElementById('itemFormMsg');
  msg.textContent = 'Saving…';
  const payload = {
    title: document.getElementById('fTitle').value,
    itemType: document.getElementById('fType').value,
    creators: document.getElementById('fCreators').value,
    publisher: document.getElementById('fPublisher').value,
    collection: document.getElementById('fCollection').value,
    group: document.getElementById('fGroup').value,
    isbn13: document.getElementById('fIsbn13').value,
    description: document.getElementById('fDescription').value,
    coverImageUrl: document.getElementById('fCover').value,
    purchaseLink: document.getElementById('fPurchase').value,
    recommendedLevel: document.getElementById('fLevel').value,
    condition: document.getElementById('fCondition').value,
    totalCopies: Number(document.getElementById('fCopies').value) || 0,
  };
  try {
    if (editingId) {
      payload.itemId = editingId;
      await apiPost('items.update', payload);
    } else {
      await apiPost('items.create', payload);
    }
    await renderAdminItems();
  } catch (err) {
    msg.textContent = err.message;
  }
};

window.__deactivateItem = async function (itemId) {
  if (!confirm('Deactivate this item? It will be hidden from the catalog.')) return;
  try {
    await apiPost('items.delete', { itemId });
    await renderAdminItems();
  } catch (err) {
    alert(err.message);
  }
};
