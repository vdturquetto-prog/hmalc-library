// Tiny in-memory app state, populated at boot and after login.
export const state = {
  user: null,       // { user_id, first_name, last_name, role, photo_url, bio }
  items: null,       // cached catalog (array), refreshed via loadItems()
};

export function isAdmin() {
  return !!state.user && state.user.role === 'admin';
}

export function displayName(user) {
  if (!user) return '';
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_id;
}
