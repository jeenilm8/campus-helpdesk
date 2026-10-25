const encoder = new TextEncoder();
function hex(bytes) { return [...bytes].map(b => b.toString(16).padStart(2, '0')).join(''); }
export async function digest(value) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))); }
export async function hashPassword(password, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  // Workers supports up to 100,000 PBKDF2 iterations per derivation.
  const bits = await crypto.subtle.deriveBits({name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256'}, key, 256);
  return `pbkdf2$100000$${salt}$${hex(new Uint8Array(bits))}`;
}
export async function verifyPassword(password, stored) {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2' || parts[1] !== '100000') return false;
  const actual = await hashPassword(password, parts[2]);
  if (actual.length !== stored.length) return false;
  let difference = 0;
  for (let i = 0; i < stored.length; i++) difference |= actual.charCodeAt(i) ^ stored.charCodeAt(i);
  return difference === 0;
}
export function sessionCookie(token, secure, clear = false) {
  return `campus_session=${clear ? '' : token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${clear ? 0 : 28800}${secure ? '; Secure' : ''}`;
}
export function sessionToken(request) {
  return (request.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith('campus_session='))?.slice(15);
}
