// Crea el archivo .env con un SESSION_SECRET aleatorio. Uso: npm run setup
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const destino = path.join(__dirname, '..', '.env');

if (fs.existsSync(destino)) {
  console.log('Ya existe un archivo .env: no se modificó.');
  process.exit(0);
}

const secreto = crypto.randomBytes(32).toString('hex');
fs.writeFileSync(destino, `PORT=3000\nNODE_ENV=development\nSESSION_SECRET=${secreto}\n`, { mode: 0o600 });
console.log('Archivo .env creado con un SESSION_SECRET aleatorio. No lo subas a GitHub.');
