const contactView = document.querySelector('#contact-view');
const adminView = document.querySelector('#admin-view');
const viewToggle = document.querySelector('#view-toggle');
const loginForm = document.querySelector('#login-form');
const inbox = document.querySelector('#inbox');
let authorization = '';

function setView(showAdmin) {
  contactView.hidden = showAdmin;
  adminView.hidden = !showAdmin;
  viewToggle.innerHTML = showAdmin
    ? 'Volver al contacto <span aria-hidden="true">↗</span>'
    : 'Administración <span aria-hidden="true">↗</span>';
  viewToggle.setAttribute('aria-label', showAdmin ? 'Volver al formulario de contacto' : 'Abrir administración');
  history.replaceState(null, '', showAdmin ? '#admin' : '#contacto');
  if (!showAdmin) logout();
}

viewToggle.addEventListener('click', () => setView(!contactView.hidden));
document.querySelector('#brand-link').addEventListener('click', (event) => {
  event.preventDefault();
  setView(false);
});

document.querySelector('#contact-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#contact-status');
  const values = Object.fromEntries(new FormData(form));
  const buttonLabel = button.querySelector('.button-label');
  status.textContent = '';
  status.dataset.kind = '';
  button.disabled = true;
  buttonLabel.textContent = 'Enviando...';

  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo enviar el mensaje.');
    form.reset();
    status.dataset.kind = 'success';
    status.textContent = 'Gracias, recibimos tu mensaje. Pronto nos pondremos en contacto.';
  } catch (error) {
    status.dataset.kind = 'error';
    status.textContent = error.message || 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
  } finally {
    button.disabled = false;
    buttonLabel.textContent = 'Enviar mensaje';
  }
});

function setStatus(element, message, kind) {
  element.textContent = message;
  element.dataset.kind = kind || '';
}

function logout() {
  authorization = '';
  loginForm.hidden = false;
  inbox.hidden = true;
  loginForm.reset();
  setStatus(document.querySelector('#login-status'), '', '');
  document.querySelector('#contact-list').replaceChildren();
}

function addContact(contact) {
  const article = document.createElement('article');
  article.className = 'contact-item';
  const details = document.createElement('div');
  const name = document.createElement('h3');
  name.className = 'contact-name';
  name.textContent = contact.name;
  const email = document.createElement('a');
  email.className = 'contact-email';
  email.href = `mailto:${contact.email}`;
  email.textContent = contact.email;
  details.append(name, email);
  const date = document.createElement('time');
  date.className = 'contact-date';
  date.dateTime = `${contact.created_at.replace(' ', 'T')}Z`;
  date.textContent = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })
    .format(new Date(date.dateTime));
  const message = document.createElement('p');
  message.className = 'contact-message';
  message.textContent = contact.message;
  article.append(details, date, message);
  return article;
}

function renderContacts(contacts) {
  const list = document.querySelector('#contact-list');
  list.replaceChildren(...contacts.map(addContact));
  document.querySelector('#contact-count').textContent = `Mensajes (${contacts.length})`;
  if (contacts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Todavía no hay mensajes.';
    list.append(empty);
  }
}

async function loadContacts() {
  const status = document.querySelector('#inbox-status');
  setStatus(status, 'Cargando mensajes...', '');
  try {
    const response = await fetch('/api/contacts', {
      headers: { Authorization: authorization },
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los mensajes.');
    renderContacts(result.contacts);
    setStatus(status, '', '');
  } catch (error) {
    if (error.message === 'Autenticación requerida.' || error.message === 'Credenciales no válidas.') {
      logout();
      setStatus(document.querySelector('#login-status'), error.message, 'error');
      return;
    }
    setStatus(status, error.message || 'No se pudieron cargar los mensajes.', 'error');
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  const username = document.querySelector('#admin-user').value;
  const password = document.querySelector('#admin-password').value;
  const encoded = new TextEncoder().encode(`${username}:${password}`);
  const binary = Array.from(encoded, (byte) => String.fromCharCode(byte)).join('');
  authorization = `Basic ${btoa(binary)}`;
  button.disabled = true;

  try {
    const response = await fetch('/api/contacts', {
      headers: { Authorization: authorization },
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo iniciar sesión.');
    loginForm.hidden = true;
    inbox.hidden = false;
    document.querySelector('#admin-password').value = '';
    renderContacts(result.contacts);
    setStatus(document.querySelector('#inbox-status'), '', '');
  } catch (error) {
    authorization = '';
    setStatus(document.querySelector('#login-status'), error.message || 'No se pudo conectar con el servidor.', 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#refresh-contacts').addEventListener('click', loadContacts);
document.querySelector('#logout').addEventListener('click', logout);
if (window.location.hash === '#admin') setView(true);
