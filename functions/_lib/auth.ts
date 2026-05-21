import { json } from './http';

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T = Record<string, unknown>>() => Promise<T | null>;
      all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
      run: () => Promise<unknown>;
    };
    first: <T = Record<string, unknown>>() => Promise<T | null>;
    all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
    run: () => Promise<unknown>;
  };
  batch?: (statements: unknown[]) => Promise<unknown[]>;
};

export type Env = {
  DB?: Db;
  APP_ENV?: string;
  COOKIE_NAME?: string;
  ADMIN_EMAIL?: string;
  BOOTSTRAP_ADMIN_EMAIL?: string;
  ALLOW_FIRST_USER_ADMIN?: string;
  RETURN_RESET_LINK?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'reader' | 'author' | 'editor' | 'admin';
  created_at?: string;
  session_id?: string;
  expires_at?: string;
};

const encoder = new TextEncoder();
const DEFAULT_COOKIE_NAME = 'rrp_session';
const SESSION_DAYS = 30;
const HASH_VERSION = 'pbkdf2-sha256-v1';
const PBKDF2_ITERATIONS = 100_000;
const TOKEN_BYTES = 32;

export function requireDb(env: Env) {
  if (!env.DB) {
    throw new Error('Não foi possível acessar os dados do projeto. Verifique a configuração do ambiente.');
  }
  return env.DB;
}

export function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase();
}

export function publicUser(user: AuthUser | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: unknown) {
  const value = String(password || '');
  if (value.length < 8) return 'Use uma senha com pelo menos 8 caracteres.';
  if (value.length > 128) return 'Use uma senha com no máximo 128 caracteres.';
  return '';
}

export function parseCookies(request: Request) {
  const header = request.headers.get('cookie') || '';
  const cookies = new Map<string, string>();

  for (const part of header.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) continue;
    cookies.set(rawName, decodeURIComponent(rawValue.join('=')));
  }

  return cookies;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function randomToken(bytes = TOKEN_BYTES) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return bytesToBase64Url(array);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function safeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

export async function hashPassword(password: string) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: PBKDF2_ITERATIONS,
    hash: 'SHA-256'
  }, key, 256);

  return `${HASH_VERSION}$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [version, rawIterations, rawSalt, rawHash] = storedHash.split('$');
  if (version !== HASH_VERSION || !rawIterations || !rawSalt || !rawHash) return false;

  const iterations = Number(rawIterations);
  if (!Number.isFinite(iterations) || iterations < 10_000) return false;

  const salt = base64UrlToBytes(rawSalt);
  const expected = base64UrlToBytes(rawHash);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations,
    hash: 'SHA-256'
  }, key, expected.length * 8);

  return safeEqual(new Uint8Array(bits), expected);
}

export function cookieName(env: Env) {
  return env.COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

export function sessionExpiresAt() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  return expires;
}

export function makeSessionCookie(env: Env, request: Request, token: string, expires: Date) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${cookieName(env)}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=${expires.toUTCString()}; Max-Age=${SESSION_DAYS * 24 * 60 * 60}`;
}

export function makeClearCookie(env: Env, request: Request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${cookieName(env)}=; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}

export async function createSession(env: Env, request: Request, userId: string) {
  const db = requireDb(env);
  const token = randomToken(40);
  const tokenHash = await sha256(token);
  const expires = sessionExpiresAt();
  const userAgent = request.headers.get('user-agent') || null;
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null;

  await db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_address, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), userId, tokenHash, userAgent, ip, expires.toISOString()).run();

  return { token, expires };
}

export async function getSessionTokenHash(env: Env, request: Request) {
  const token = parseCookies(request).get(cookieName(env));
  if (!token) return null;
  return sha256(token);
}

export async function getSessionUser(env: Env, request: Request): Promise<AuthUser | null> {
  const db = requireDb(env);
  const tokenHash = await getSessionTokenHash(env, request);
  if (!tokenHash) return null;

  const now = new Date().toISOString();
  const user = await db.prepare(`
    SELECT
      users.id,
      users.name,
      users.email,
      users.role,
      users.created_at,
      sessions.id AS session_id,
      sessions.expires_at
    FROM sessions
    INNER JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
      AND sessions.expires_at > ?
    LIMIT 1
  `).bind(tokenHash, now).first<AuthUser>();

  return user || null;
}

export async function destroyCurrentSession(env: Env, request: Request) {
  const db = requireDb(env);
  const tokenHash = await getSessionTokenHash(env, request);
  if (!tokenHash) return;
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
}

export async function decideNewUserRole(env: Env, email: string) {
  const adminEmail = normalizeEmail(env.ADMIN_EMAIL || env.BOOTSTRAP_ADMIN_EMAIL || '');
  if (adminEmail && email === adminEmail) return 'admin';

  if (env.ALLOW_FIRST_USER_ADMIN === 'true') {
    const db = requireDb(env);
    const row = await db.prepare('SELECT COUNT(*) AS total FROM users').first<{ total: number }>();
    if (!row || Number(row.total) === 0) return 'admin';
  }

  return 'reader';
}

export function requireAdminUser(user: AuthUser | null) {
  if (!user) {
    return json({ ok: false, authenticated: false, message: 'Você precisa entrar para acessar esta área.' }, { status: 401 });
  }

  if (!['admin', 'editor'].includes(user.role)) {
    return json({ ok: false, authenticated: true, message: 'Acesso restrito à equipe editorial da Ryuzen.' }, { status: 403 });
  }

  return null;
}

export async function createPasswordResetToken(env: Env, userId: string, email: string, request: Request) {
  const db = requireDb(env);
  const token = randomToken(40);
  const tokenHash = await sha256(token);
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null;

  await db.prepare(`
    INSERT INTO password_resets (id, user_id, email, token_hash, requester_ip, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), userId, email, tokenHash, ip, expires.toISOString()).run();

  return { token, expires };
}

export async function hashToken(token: string) {
  return sha256(token);
}
