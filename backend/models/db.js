// Conexión a las bases de datos
require('dotenv').config();
var sqlite3 = require('@journeyapps/sqlcipher').verbose();
const path = require('path');

// Path to your encrypted SQLite file
const usersPath = path.resolve(__dirname, './users.db');
const loansPath = path.resolve(__dirname, './loans.db');
const flags     = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

const db_users = new sqlite3.Database(usersPath, flags, (err) => {
  if (err) return console.error('Error connecting to users SQLite database:', err.message);
});

// Create a Promise that resolves once migrations finish
const dbReady = new Promise((resolve, reject) => {
  db_users.serialize(() => {
    db_users.run(`PRAGMA key = '${process.env.DB_USERS_PASSWORD}';`, (err) => {
      if (err) return reject(err);
      console.log('PRAGMA key applied');

      db_users.run(`
        CREATE TABLE IF NOT EXISTS users (
          wallet   TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          email    TEXT NOT NULL
        );
      `, (err) => {
        if (err) return reject(err);
        console.log('users table is present');
        resolve();
      });
    });
  });
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

module.exports = { db_users, dbReady, db_loans };

