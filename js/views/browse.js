import { apiGet } from '../api.js';
import { state } from '../state.js';
import { navigate } from '../router.js';

export async function renderBrowse() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">Loading inventory…</div>`;

  if (!state.items) {
    try {
      state.items = await apiGet('items.list');
    } catch (err) {
      app.innerHTML = `<div class="error-box">${err.message}</div>`;
      return;
    }
  }

  app.innerHTML = `
    <div class="browse-header">
      <h1>Browse Inventory</h1>
      <input id="searchBox" type="search" placeholder="Search by title, author, or collection…" oninput="window.__filterItems()" />
    </div>
    <div id="itemGrid" class="item-grid"></div>
  `;
  renderGrid(state.items);
}

function renderGrid(items) {
  const grid = document.getElementById('itemGrid');
  if (items.length === 0) {
    grid.innerHTML = '<p class="empty-state">No items match your search.</p>';
    return;
  }
  grid.innerHTML = items.map((item) => `
    <div class="item-card" onclick="window.location.hash='#/items/${encodeURIComponent(item.item_id)}'">
      <div class="item-cover" style="${item.cover_image_url ? `background-image:url('${item.cover_image_url}')` : ''}">
        ${item.cover_image_url ? '' : '<span class="cover-fallback">' + iconFor(item.item_type) + '</span>'}
      </div>
      <div class="item-card-body">
        <div class="item-title">${escapeHtml(item.title)}</div>
        <div class="item-meta">${escapeHtml(item.creators || item.collection || '')}</div>
        <div class="availability ${item.copies_available > 0 ? 'available' : 'unavailable'}">
          ${item.copies_available > 0 ? item.copies_available + ' available' : 'All copies checked out'}
        </div>
      </div>
    </div>
  `).join('');
}

function iconFor(itemType) {
  return itemType === 'boardgame' ? '🎲' : '📘';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

window.__filterItems = function () {
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  if (!q) return renderGrid(state.items);
  const filtered = state.items.filter((item) =>
    [item.title, item.creators, item.collection, item.group, item.tags]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
  renderGrid(filtered);
};
