import { createHash, timingSafeEqual } from 'node:crypto';

export function requireAuth(req, res, next) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return res.status(503).json({ error: 'La autenticación del panel no está configurada.' });
  }

  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Basic\s+([A-Za-z0-9+/]+={0,2})$/i);
  if (!match) {
    res.set('WWW-Authenticate', 'Basic realm="Contactos", charset="UTF-8"');
    return res.status(401).json({ error: 'Autenticación requerida.' });
  }

  let credentials;
  try {
    credentials = Buffer.from(match[1], 'base64').toString('utf8');
  } catch {
    return res.status(401).json({ error: 'Credenciales no válidas.' });
  }

  const separator = credentials.indexOf(':');
  if (separator < 0) {
    return res.status(401).json({ error: 'Credenciales no válidas.' });
  }

  const user = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);
  const hash = (value) => createHash('sha256').update(value).digest();
  const validUser = timingSafeEqual(hash(user), hash(expectedUser));
  const validPassword = timingSafeEqual(hash(password), hash(expectedPassword));

  if (!validUser || !validPassword) {
    return res.status(401).json({ error: 'Credenciales no válidas.' });
  }

  return next();
}
