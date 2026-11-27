# Primeros Pasos · Guías de compra para padres primerizos

Proyecto del curso **Introducción al Desarrollo Web** (UNSA). Portal con guías de compra para bebés y niños, con panel de asesores protegido por sesión. Está completo hasta el **Lab 07** (autenticación, sesiones, middlewares, bcrypt y `.env`).

Categorías del equipo: Asientos de seguridad para autos · Camas cuna · Coches para bebés y accesorios · Cunas infantiles · Cunas para bebés.

## Cómo ejecutarlo

```bash
npm install
npm run setup     # crea el archivo .env con un SESSION_SECRET aleatorio
npm start         # http://localhost:3000
```

El servidor no arranca si falta `SESSION_SECRET` (a propósito, para no usar un secreto por defecto). El `.env` nunca se sube a GitHub; `.env.example` muestra qué variables existen.

## Páginas

| Página | Qué hace |
|---|---|
| `index.html` | Portada: carrusel, categorías, etapas, guías recientes, FAQ |
| `guias.html` | Búsqueda, filtros, orden por precio, favoritos y comparar (hasta 3) |
| `categoria.html?c=<slug>` | Una categoría: qué mirar, seguridad y sus guías |
| `nosotros.html` / `contacto.html` | Equipo y formulario de contacto |
| `login.html` | Ingreso y registro de asesores |
| `panel.html` | Protegida: crear, editar y eliminar guías propias; leer mensajes |

## API

| Método y ruta | Acceso | Respuestas |
|---|---|---|
| `GET /api/meta` | público | 200 |
| `GET /api/fichas?categoria=&etapa=&q=&orden=&ids=&limit=` | público | 200 |
| `POST /api/auth/register` | público | 201, 400, 409 |
| `POST /api/auth/login` | público | 200, 400, 401 |
| `POST /api/auth/logout` · `GET /api/auth/sesion` | público | 200 |
| `GET /api/perfil` | sesión | 200, 401 |
| `GET /api/fichas/mias` · `POST /api/fichas` | sesión | 200 / 201, 400, 401 |
| `PUT /api/fichas/:id` · `DELETE /api/fichas/:id` | sesión y autor | 200, 400, 401, 403, 404 |
| `POST /api/contacto` | público | 201, 400, 429 |
| `GET /api/contacto` · `DELETE /api/contacto/:id` | sesión | 200, 401, 404 |

## Seguridad aplicada

- Contraseñas con **bcrypt** (10 rondas); nunca se devuelven. Máximo 72 caracteres (límite de bcrypt).
- Mismo mensaje y tiempo parecido si falla el correo o la contraseña (no revela qué correos existen).
- Sesión con cookie `httpOnly`, `sameSite=lax`, `secure` en producción, 1 hora; se regenera al iniciar sesión.
- Middleware de autenticación (401) y comprobación de autoría (403).
- Validación en el servidor de todos los campos; el texto del servidor se escapa antes de mostrarlo (anti-XSS).
- Cabeceras: CSP estricta (sin scripts en línea), `X-Frame-Options`, `nosniff`, `Referrer-Policy`.
- Límite de intentos (429) en login, registro y contacto; campo trampa `sitio` contra robots.

## Datos en el navegador (localStorage)

`pp_favoritos` y `pp_comparar`: listas de ids. No hay datos personales. Si el navegador bloquea el almacenamiento, el portal sigue funcionando.

## Imágenes

Las ilustraciones de `public/img/` son **originales y temporales**. Para usar fotos reales, guarda el archivo con el mismo nombre (o cambia `imagen` en `data/categorias.js`) y revisa que tengas derechos de uso.

## Datos de ejemplo

`data/seed.js` trae 15 guías ilustrativas (nombres genéricos, precios referenciales en soles). **Reemplázalas** por las recomendaciones reales del grupo desde el panel o editando ese archivo. Los datos viven en memoria: al reiniciar el servidor se pierden las guías y cuentas nuevas (se resuelve con PostgreSQL en el Lab 08).

## Pruebas

Importa `postman/Primeros-Pasos-Lab07.postman_collection.json` (variable `baseUrl`) y ejecútala con el Collection Runner en orden. Son 47 peticiones. Por el límite de intentos, no la ejecutes más de 2 veces en 10 minutos. Por consola: `npx newman run postman/Primeros-Pasos-Lab07.postman_collection.json`.

El cuestionario teórico está en `docs/cuestionario-lab07.md`.

## Reparto sugerido (4 integrantes, una rama por persona)

| Persona | Archivos |
|---|---|
| Sarah | `routes/auth.js`, `controllers/authController.js`, `middleware/`, `public/login.html`, `public/js/login.js` |
| Melany | `controllers/fichasController.js`, `routes/fichas.js`, `public/panel.html`, `public/js/panel.js` |
| Melanie | `public/index.html`, `public/guias.html`, `public/categoria.html`, `public/js/home.js`, `guias.js`, `categoria.js` |
| Hillary | `public/css/styles.css`, `public/js/layout.js`, `common.js`, `nosotros.html`, `contacto.*`, `README.md`, `postman/` |

Flujo: `git checkout -b feature/<nombre>` → commits pequeños → Pull Request a `main` revisado por otra persona.

## Siguientes laboratorios

- **Lab 08:** reemplazar `data/store.js` por PostgreSQL (tablas `users`, `fichas`, `mensajes`) y guardar la sesión en la base.
- **Lab 09:** despliegue: `NODE_ENV=production`, `SESSION_SECRET` en las variables del servicio, HTTPS.
