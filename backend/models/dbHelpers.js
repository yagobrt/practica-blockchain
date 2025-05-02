// Wrappers para las bases de datos

/**
 * Seleccionar una fila
 * @param {Database} db – Una instancia sqlite3.Database abierta
 * @param {string} sql – query SQL 
 * @param {any[]} params – Parametros de la query
 * @returns {Promise<Object>}
 */
function fetchFirst(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

/**
 * Seleccionar varias filas
 * @param {Database} db – Una instancia sqlite3.Database abierta
 * @param {string} sql – query SQL
 * @param {any[]} params – Parametros de la query
 * @returns {Promise<Object[]>}
 */
function fetchAll(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}


/**
 * Ejecutar una query que no devuelve nada (INSERT/UPDATE/DELETE) 
 * @param {Database} db – Una instancia sqlite3.Database abierta
 * @param {string} sql – query SQL
 * @param {any[]} params – Parametros de la query
 * @returns {Promise<void>}
 */
function execute(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = { fetchFirst, fetchAll, execute };
