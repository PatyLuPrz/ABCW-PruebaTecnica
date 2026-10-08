// ─────────────────────────────────────────────────────────────
//  Rutas de contactos. Los stubs responden 501 a propósito:
//  son los que tienes que construir.
// ─────────────────────────────────────────────────────────────
import { Router } from 'express';

import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/contacts  —  PÚBLICO
router.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Introduce un correo electrónico válido.' });
  }
  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({ error: 'El mensaje debe tener entre 10 y 2000 caracteres.' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)'
    ).run(name, email, message);

    return res.status(201).json({
      contact: {
        id: Number(result.lastInsertRowid),
        name,
        email,
        message,
        created_at: db.prepare('SELECT created_at FROM contacts WHERE id = ?').get(result.lastInsertRowid).created_at,
      },
    });
  } catch (error) {
    console.error('[contacts] No se pudo guardar el contacto:', error);
    return res.status(500).json({ error: 'No se pudo guardar el contacto. Inténtalo de nuevo.' });
  }
});

// GET /api/contacts  —  PROTEGIDO (vista de administración)
router.get('/', requireAuth, (req, res) => {
  try {
    const contacts = db.prepare(
      'SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC, id DESC'
    ).all();
    return res.json({ contacts });
  } catch (error) {
    console.error('[contacts] No se pudo listar los contactos:', error);
    return res.status(500).json({ error: 'No se pudieron cargar los contactos.' });
  }
});

export default router;
