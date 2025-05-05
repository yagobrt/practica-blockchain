// Conexión a las bases de datos
require('dotenv').config();
const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const path = require('path');

// Path to the encrypted SQLite files
const usersPath = path.resolve(__dirname, './users.db');
const loansPath = path.resolve(__dirname, './loans.db');
const flags = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

// Abrir ambas bases de datos
const db_users = new sqlite3.Database(usersPath, flags, (err) => {
  if (err) {
    console.error('Error connecting to users SQLite database:', err.message);
  } else {
    console.log('users.db opened');
  }
});


const db_loans = new sqlite3.Database(loansPath, flags, (err) => {
  if (err) {
    console.error('Error connecting to loans SQLite database:', err.message);
  } else {
    console.log('loans.db opened');
  }
});


// Definir los esquemas de las bases de datos
const usersMigrations = [
  `CREATE TABLE IF NOT EXISTS users (
   wallet      TEXT  PRIMARY KEY,          -- dirección Ethereum (identificador)
   username    TEXT  NOT NULL,             -- apodo del usuario (no único)
   password    TEXT  NOT NULL,             -- hash SHA3(password + salt)
   email       TEXT  NOT NULL              -- email de verificación
  );`
];

const loansMigrations = [
  `CREATE TABLE IF NOT EXISTS loans (
   id               INTEGER PRIMARY KEY AUTOINCREMENT, -- id auto-incremental
   lender_address   TEXT    NOT NULL,                  -- wallet del prestamista
   borrower_address TEXT    NOT NULL,                  -- wallet del prestatario
   amount_eth       REAL    NOT NULL,                  -- cantidad en ETH
   interest_rate    REAL    NOT NULL,                  -- tasa de interés (0.05 = 5%)
   payment_dates    TEXT    NOT NULL                   -- lista de fechas en JSON
  );`
];


// Create a Promise that resolves once migrations finish
const dbReady = new Promise((resolve, reject) => {
  db_users.serialize(() => {
    db_users.run(`PRAGMA key = '${process.env.DB_USERS_PASSWORD}';`, (err) => {
      if (err) return reject(new Error(`Error applying PRAGMA key to users database: ${err.message}`));
      console.log('PRAGMA key applied to users.db');

      for (const sql of usersMigrations) {
        db_users.run(sql, (err) => {
          if (err) return reject(new Error(`Error creating users database: ${err.message}`));
        });
      }
      console.log('users db is ready');

      db_loans.serialize(() => {
        db_loans.run(`PRAGMA key = '${process.env.DB_LOANS_PASSWORD}';`, (err) => {
          if (err) return reject(new Error(`Error applying PRAGMA key to loans database: ${err.message}`));
          console.log('PRAGMA key applied to loans.db');

          for (const sql of loansMigrations) {
            db_loans.run(sql, (err) => {
              if (err) return reject(new Error(`Error creating loans database: ${err.message}`));
            });
          }
          console.log('loans db is ready');
          resolve();
        });
      });
    });
  });
});

module.exports = { db_users, dbReady, db_loans };

