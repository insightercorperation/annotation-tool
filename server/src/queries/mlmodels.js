const db = require('./db').getDb();

module.exports = {
  getAll: () => {
    return db.all(`select * from mlmodels;`, []);
  },

  get: id => {
    return db.get(
      `
      select *
      from mlmodels
      where id = ?;`,
      [id]
    );
  },

  create: model => {
    const id = db.update(
      `
      insert into mlmodels(name, url, type) values (?, ?, ?);`,
      [model.name, model.url, model.type]
    ).lastInsertRowid;

    return id;
  },

  delete: id => {
    db.update(`delete from mlmodels where id = ?;`, [id]);
  },
};
