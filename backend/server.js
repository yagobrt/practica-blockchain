const app = require('./app');

// poner un puerto por defecto, si no está definido en el .env
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server llistening on http://localhost:${PORT}`);
});
