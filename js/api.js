/**
 * Fetch wrapper for the Apps Script backend.
 *
 * Apps Script Web Apps can't set custom CORS headers and don't support
 * preflighted requests, so:
 *  - reads use GET (?action=...&token=...), a "simple request" — no preflight
 *  - writes use POST with Content-Type: text/plain and a JSON string body,
 *    which is ALSO a simple request (a real application/json POST would
 *    trigger a preflight Apps Script can't answer).
 * The session token travels as a plain field in the query/body, never as
 * an Authorization header.
 */

// Set this to your deployed Apps Script Web App URL after you run
// Deploy > New deployment > Web app in the Apps Script editor.
export const EXEC_URL = 'https://script.googleusercontent.com/a/macros/hudsonadulted.org/echo?user_content_key=AUkAhnTab77jUXCLezetGroDJAVCp-1Je-ZCvumm-HhxT3yPvrpqOQyhUFbC343Rb8kwbDUkcJkBYQCyjgFK8WVe9572iviIIFyz7p3dIBTPwomnZiqccGcK3fgKacGmeNIdzYaplXr1ryNwcnigyWT-mHlVEGTayj8R5ADcbnVyvsediIEzg9W8vQZM1gaJi6YWfEaPHviMXSUqEzRs9yZEUOg6-kQJiDdizH4ZKvV6GyICqH7WMtEoOQMHiV6TjzgKDcyrOQAE317pfYxTr2kCLMpndYuu4rTVoKksQgiTsLik3wtFRsY&lib=M1UEbldTuhCfcKYnoFn9pCLHw7bdhDzKy';

const TOKEN_KEY = 'hmalc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function handleResponse(res) {
  let body;
  try {
    body = await res.json();
  } catch (err) {
    throw new Error('Server returned an unreadable response');
  }
  if (!body.ok) {
    throw new Error(body.error || 'Request failed');
  }
  return body.data;
}

export async function apiGet(action, params = {}) {
  const url = new URL(EXEC_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('token', getToken());
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { method: 'GET' });
  return handleResponse(res);
}

export async function apiPost(action, params = {}) {
  const payload = Object.assign({ action, token: getToken() }, params);
  const res = await fetch(EXEC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}
