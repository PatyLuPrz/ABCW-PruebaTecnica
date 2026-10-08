# Prueba Técnica Full Stack — Repositorio base (Node)

Este repo existe para que **no pierdas tiempo en configuración**. Lo aburrido ya
está resuelto; lo que evaluamos lo construyes tú.

Recuerda: la parte práctica está pensada para **un máximo de 3 horas**. No pasa
nada si usas IA — solo pedimos que entiendas y puedas explicar lo que entregues.

---

## Arranque rápido

Necesitas **Node 18.18+**.

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npm run dev
```

Luego abre: http://localhost:3000/health
Si ves `{"status":"ok","db":true}`, todo está corriendo.

> `npm install` compila `better-sqlite3`. En la mayoría de los sistemas usa un
> binario precompilado y no necesitas nada extra.

---

## El reto (resumen)

Un **mini-gestor de contactos (leads)** que funcione de punta a punta:

**formulario público → tu API → base de datos → panel protegido**

1. Formulario público de contacto (nombre, correo, mensaje) con validación
   **en cliente y en servidor**.
2. Al enviarse, el contacto se **guarda en la base de datos** vía tu API.
3. Una **vista de administración protegida** que lista los contactos, del más
   reciente al más antiguo.
4. Manejo básico de errores.

No sobre-ingenierices: preferimos algo simple y bien resuelto.

---

## Qué ya está hecho (no necesitas tocarlo)

- Proyecto de Express que arranca con `npm run dev`.
- Conexión a **SQLite ya configurada** (`src/db.js`) — crea el archivo solo.
- Lectura de body JSON y de formularios.
- Servido de estáticos desde `src/public` (por si usas HTML/CSS/JS "vanilla").
- Ruta `/health` funcionando.
- `.gitignore` correcto (no subas `node_modules` ni tu `.env`).

## Qué construyes tú (esto es lo que evaluamos)

| Dónde | Qué falta |
|---|---|
| `src/db.js` | Diseñar el **esquema** de la tabla de contactos. |
| `src/routes/contacts.js` | `POST /api/contacts` (guardar) y `GET /api/contacts` (listar). |
| `src/middleware/auth.js` | La **autenticación** del panel (ahora no protege nada). |
| `src/public/` *(o tu front)* | El **formulario** y la **vista de administración**. |

El front-end es tu decisión: puedes usar la carpeta `src/public` con vanilla, o
montar **Astro / Next / Svelte** aparte. Lo único imprescindible es que consuma
tu propia API.

---

## Entrega

- Este repositorio en **GitHub** con tus commits.
- Completa la sección de abajo en este mismo README.
- Opcional: un video corto (2–3 min) mostrándolo funcionar. **No** hace falta
  desplegarlo; el despliegue lo conversamos en la sesión en vivo.

### Para completar por el candidato

**Cómo correr mi proyecto:**
1. Usa Node 18.18 o superior y ejecuta `npm install`.
2. Copia `.env.example` a `.env` y cambia `ADMIN_USER` y `ADMIN_PASSWORD`.
3. Ejecuta `npm run dev` y abre http://localhost:3000.
4. Envía un mensaje desde el formulario. El enlace «Administración» abre el
    panel; usa las credenciales del archivo `.env` para ver los mensajes.

El estado del servidor y de SQLite se puede comprobar en `/health`.

**Decisiones técnicas (3–4 puntos):**
- SQLite crea la tabla al iniciar; `created_at` se genera en la base de datos.
- La API valida y normaliza los datos también en servidor, y usa consultas
   parametrizadas para guardar y leer contactos.
- El listado exige HTTP Basic Auth con las credenciales del entorno y se ordena
   por fecha descendente, con el ID como desempate.
- El front usa HTML, CSS y JavaScript nativos, consume la API propia y mantiene
   las credenciales solo en memoria mientras el panel está abierto.

**Cómo usé IA:**
La usé como apoyo para implementar el esquema, las rutas, la autenticación y la
interfaz. Revisé y ajusté la validación de ambos lados, el orden del listado,
el manejo de errores y el comportamiento de acceso/cierre de sesión.

**Qué dejé pendiente por tiempo y cómo lo resolvería:**
- Añadir pruebas automatizadas para validaciones, autenticación y persistencia.
- En producción, usar HTTPS, credenciales fuertes y un mecanismo de sesión con
   protección CSRF si se amplía la administración más allá de este panel simple.
