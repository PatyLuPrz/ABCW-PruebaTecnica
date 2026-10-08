// ─────────────────────────────────────────────────────────────
//  Conexión a SQLite — YA FUNCIONA (abre/crea el archivo de DB).
//  Lo que te toca a ti: DISEÑAR el esquema de los datos.
// ─────────────────────────────────────────────────────────────
import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_PATH || './db/app.sqlite';

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
	CREATE TABLE IF NOT EXISTS contacts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
		email TEXT NOT NULL CHECK(length(email) <= 254),
		message TEXT NOT NULL CHECK(length(message) BETWEEN 10 AND 2000),
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)
`);

export default db;
