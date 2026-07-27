/**
 * Minimal hash router. Routes are registered as exact hash strings
 * (e.g. "#/items") or with a ":param" segment (e.g. "#/items/:id").
 * No build step, no dependency — matches the rest of this project.
 */

const routes = [];
let notFoundHandler = () => { document.getElementById('app').innerHTML = '<p>Page not found.</p>'; };

export function registerRoute(pattern, handler) {
  const paramNames = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:[^/]+/g, (m) => {
      paramNames.push(m.slice(1));
      return '([^/]+)';
    }) + '$'
  );
  routes.push({ regex, paramNames, handler });
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

export function navigate(hash) {
  window.location.hash = hash;
}

async function resolve() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  for (const route of routes) {
    const match = route.regex.exec(hash);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
      await route.handler(params);
      return;
    }
  }
  notFoundHandler();
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
