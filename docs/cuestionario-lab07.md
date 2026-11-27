# Cuestionario teórico · Lab 07 (autenticación, sesiones, middlewares, bcrypt, .env)

**1. ¿Diferencia entre autenticación y autorización? Ejemplo del proyecto.**
Autenticación es comprobar quién eres (login con correo y contraseña). Autorización es decidir qué puedes hacer. En el proyecto, `POST /api/fichas` exige sesión (401 si no hay) y `PUT/DELETE /api/fichas/:id` además exigen ser el autor (403 si no lo eres).

**2. ¿Por qué no se guarda la contraseña en texto plano?**
Si la base se filtra, todas las cuentas quedarían expuestas, y mucha gente reutiliza contraseñas. Se guarda solo un hash.

**3. ¿Qué es bcrypt y qué hace el "salt"?**
Es una función de hash lenta, pensada para contraseñas. El salt es un valor aleatorio distinto por usuario que se mezcla con la contraseña: dos usuarios con la misma clave tienen hashes distintos y las tablas precalculadas no sirven.

**4. ¿Qué significan las 10 rondas?**
El costo es 2^10 iteraciones. Subirlo hace más lento cada intento de adivinar la contraseña, también para el atacante, pero también para el servidor.

**5. ¿Por qué el login responde igual si falla el correo o la contraseña?**
Para no revelar qué correos están registrados. Además se compara contra un hash falso cuando el correo no existe, para que el tiempo de respuesta no delate la diferencia.

**6. ¿Qué es una sesión y cómo se identifica al usuario?**
Es información guardada en el servidor sobre una visita. El navegador solo guarda una cookie con el id de la sesión (firmada con `SESSION_SECRET`); en cada petición el servidor busca esa sesión.

**7. ¿Qué hacen `httpOnly`, `sameSite` y `secure` en la cookie?**
`httpOnly`: el JavaScript de la página no puede leerla (limita el robo por XSS). `sameSite=lax`: no se envía en peticiones de otros sitios (reduce CSRF). `secure`: solo viaja por HTTPS (activo en producción).

**8. ¿Por qué se regenera la sesión al iniciar sesión?**
Para evitar la fijación de sesión: un id que el atacante conocía antes del login deja de servir.

**9. ¿Qué es un middleware? ¿Importa el orden?**
Una función `(req, res, next)` que corre antes del controlador. Sí importa: `express.json()` y la sesión deben ir antes de las rutas que los usan; el manejador de errores va al final.

**10. ¿Diferencia entre 401, 403 y 404 en el proyecto?**
401: no hay sesión. 403: hay sesión pero la ficha es de otro asesor. 404: la ficha no existe. Se responde 404 antes que 403 para fichas inexistentes.

**11. ¿Para qué sirve el archivo `.env` y por qué no se sube a GitHub?**
Guarda configuración y secretos (como `SESSION_SECRET`) fuera del código. Si se sube, cualquiera podría falsificar sesiones. Por eso está en `.gitignore` y se comparte `.env.example` sin valores.

**12. ¿Qué es XSS y cómo se previene aquí?**
Inyectar HTML o JavaScript en la página a través de datos. Se previene escapando todo texto del servidor antes de mostrarlo, con una CSP que bloquea scripts en línea y con cookies `httpOnly`.

**13. ¿Para qué sirve el límite de intentos (429)?**
Frena la fuerza bruta contra el login y el abuso de los formularios públicos.

**14. ¿Qué pasa con las cuentas y fichas al reiniciar el servidor, y cómo se resuelve?**
Se pierden porque viven en memoria. Se resuelve guardándolas en una base de datos (PostgreSQL, Lab 08).
