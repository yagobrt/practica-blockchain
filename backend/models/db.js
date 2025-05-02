// Conexión a las bases de datos
var sqlite3 = require('@journeyapps/sqlcipher').verbose();
const path = require('path');

// Path to your encrypted SQLite file
const usersPath = path.resolve(__dirname, './users.db');
const loansPath = path.resolve(__dirname, './loans.db');

const db_users = new sqlite3.Database(usersPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to users SQLite database:', err.message);
  } else {
    // Set encryption key
    db_users.run(`PRAGMA key = '${process.env.DB_USERS_PASSWORD}';`, (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error applying PRAGMA key to users database:', pragmaErr.message);
      }
    });
  }
});


const db_loans = new sqlite3.Database(loansPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to loans SQLite database:', err.message);
  } else {
    // Set encryption key
    db_loans.run(`PRAGMA key = '${process.env.DB_LOANS_PASSWORD}';`, (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error applying PRAGMA key to loans database:', pragmaErr.message);
      }
    });
  }
});

module.exports = {db_users, db_loans};

