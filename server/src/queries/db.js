const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3');
const mariadb = require('mariadb');

const sqliteAdapter = () => {
  const dbPath =
    process.env.DATABASE_FILE_PATH ||
    path.join(__dirname, '../../../localdb/sqlite/database.sqlite');

  const exists = fs.existsSync(dbPath);
  const db = sqlite3(dbPath, {});

  if (!exists) {
    const migrations = path.join(
      path.join(__dirname, '..', '..'),
      'migrations'
    );
    const files = fs.readdirSync(migrations);
    files.sort();
    files.forEach(f => {
      if (!f.endsWith('.up.sql')) return;
      const sql = fs.readFileSync(path.join(migrations, f), 'utf8');
      db.exec(sql);
    });
  }

  return {
    all: (sql, value) => {
      return db.prepare(sql).all(...value);
    },
    get: (sql, value) => {
      return db.prepare(sql).get(...value);
    },
    update: (sql, value) => {
      return db.prepare(sql).run(...value);
    },
    transaction: callback => {
      db.transaction(callback)();
    },
  };
};

const mariaAdapter = () => {
  let pool;

  try {
    pool = mariadb.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      connectionLimit: 15,
      idleTimeout: 60,
    });
  } catch (e) {
    throw e;
  }

  return {
    all: async (sql, value, connection) => {
      const assignedConn = connection || (await pool.getConnection());
      try {
        const res = await assignedConn.query(sql, value);
        return res;
      } catch (e) {
        if (connection) {
          assignedConn.release();
        }
        throw e;
      } finally {
        if (!connection) {
          assignedConn.release();
        }
      }
    },
    get: async (sql, value, connection) => {
      const assignedConn = connection || (await pool.getConnection());
      try {
        const res = await assignedConn.query(sql, value);
        return res[0];
      } catch (e) {
        if (connection) {
          assignedConn.release();
        }
        throw e;
      } finally {
        if (!connection) {
          assignedConn.release();
        }
      }
    },
    update: async (sql, value, connection, noRelease) => {
      const assignedConn = connection || (await pool.getConnection());
      try {
        const res = await assignedConn.query(sql, value);
        return {
          lastInsertRowid: res.insertId,
        };
      } catch (e) {
        if (connection) {
          assignedConn.release();
        }
        throw e;
      } finally {
        if (!connection) {
          assignedConn.release();
        }
      }
    },
    transaction: async callback => {
      const assignedConn = await pool.getConnection();
      try {
        await assignedConn.beginTransaction();
        await callback(assignedConn);
        await assignedConn.commit();
      } catch (e) {
        assignedConn.rollback();
      } finally {
        assignedConn.release();
      }
    },
  };
};

exports.getDb = () => mariaAdapter();
