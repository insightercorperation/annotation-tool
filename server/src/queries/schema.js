const fs = require('fs');
const path = require('path');
const mariadb = require('mariadb');
const parser = require('yargs-parser');

const main = async () => {
  const argv = parser(process.argv.slice(2));
  const { host, port: dbPort, database, user, password: dbPw, action } = argv;

  let conn;

  try {
    conn = await mariadb.createConnection({
      host,
      port: dbPort.toString(),
      database,
      user,
      password: dbPw.toString(),
    });

    if (action === 'create') {
      const sqlPath = path.join(
        __dirname,
        '../../migrations/001-init.up.maria.sql'
      );
      const sqlText = fs.readFileSync(sqlPath, { encoding: 'utf-8' });
      const multipleSql = sqlText.split(';');

      for (const sql of multipleSql) {
        if (sql.length < 2) continue;
        try {
          const res = await conn.query(sql);
        } catch (e) {}
      }
    }

    if (action === 'drop') {
      const sqlPath = path.join(
        __dirname,
        '../../migrations/001-init.down.maria.sql'
      );
      const sqlText = fs.readFileSync(sqlPath, { encoding: 'utf-8' });
      const multipleSql = sqlText.split(';');

      for (const sql of multipleSql) {
        if (sql.length < 2) continue;
        try {
          const res = await conn.query(sql);
        } catch (e) {}
      }
    }
  } catch (e) {
    throw e;
  } finally {
    if (conn) conn.end();
  }
};

if (require.main === module) {
  main();
}
