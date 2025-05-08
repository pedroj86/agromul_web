const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;



// Ruta del archivo JSON
const usersFilePath = path.join(__dirname, 'users.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'clave-secreta',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname)));

// Función para leer usuarios desde el archivo
function readUsersFromFile() {
  try {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
  } catch (err) {
    console.error('Error al leer users.json:', err.message);
    return [];
  }
}

// Función para escribir usuarios en el archivo
function writeUsersToFile(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Ruta para mostrar formulario de registro
app.get('/registro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

// Ruta para registrar nuevos usuarios
app.post('/register', (req, res) => {
  const { nombre, email, password } = req.body;

  // Validación básica
  if (!nombre || !email || !password) {
    return res.status(400).send('Por favor completa todos los campos.');
  }

  let users = readUsersFromFile();

  // Verificar si el correo ya está registrado
  const userExists = users.some(u => u.email === email);

  if (userExists) {
    return res.status(400).send('Este correo ya está registrado.');
  }

  // Crear nuevo usuario
  const newUser = {
    id: users.length + 1,
    nombre,
    email,
    password,
    parcels: [] // Inicializamos con un array vacío
  };

  users.push(newUser);
  writeUsersToFile(users); // Guardar en el archivo

  req.session.user = {
    id: newUser.id,
    email: newUser.email,
    nombre: newUser.nombre
  };

  res.redirect('/dashboard.html');
});

// Proteger dashboard.html
app.get('/dashboard.html', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Ruta de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let users = readUsersFromFile();

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    req.session.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre || email.split('@')[0]
    };
    return res.send('success');
  }

  res.status(401).send('Credenciales inválidas');
});

// Ruta para obtener las parcelas y recintos del usuario actual
app.get('/api/my-parcels', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No autorizado');
  }

  const userEmail = req.session.user.email;
  const users = readUsersFromFile();
  const user = users.find(u => u.email === userEmail);

  if (!user) {
    return res.status(404).send('Usuario no encontrado');
  }

  // Devolver tanto parcelas como recintos
  return res.json({
    parcels: user.parcels || [],
    recintos: user.recintos || []
  });
});



// Guardar una parcela o recinto dibujado por el usuario
app.post('/api/save-plot', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No autorizado');
  }

  const { name, cultivo, geoJson, type } = req.body;

  if (!name || !geoJson || !type) {
    return res.status(400).json({ error: 'Nombre, geometría y tipo son obligatorios.' });
  }

  if (!['parcela', 'recinto'].includes(type)) {
    return res.status(400).json({ error: 'Tipo inválido. Usa "parcela" o "recinto".' });
  }

  const userEmail = req.session.user.email;
  let users = readUsersFromFile();

  const userIndex = users.findIndex(u => u.email === userEmail);

  if (userIndex === -1) {
    return res.status(401).send('Usuario no encontrado');
  }

  const user = users[userIndex];

  // Asegurar que existen los arrays
  if (!Array.isArray(user.parcels)) user.parcels = [];
  if (!Array.isArray(user.recintos)) user.recintos = [];

  const newLayer = {
    id: Date.now(),
    name,
    cultivo,
    geoJson,
    created_at: new Date().toISOString()
  };

  if (type === 'parcela') {
    user.parcels.push(newLayer);
  } else if (type === 'recinto') {
    user.recintos.push(newLayer);
  }

  writeUsersToFile(users);

  console.log(`Capa (${type}) guardada por ${userEmail}:`, newLayer);
  res.json({ status: 'success', plotId: newLayer.id, type });
});






// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});