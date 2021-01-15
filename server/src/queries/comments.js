const db = require('./db').getDb();

const Comments = {
  getForImage: async imageId => {
    const comments = await db.all(
      `
      select comments.id, comment, createdAt, imagesId
      from comments
      where comments.imagesId = ?;`,
      [imageId]
    );

    return comments;
  },

  addComment: async (imageId, comment) => {
    const { lastInsertRowid } = await db.update(
      `
      insert into comments(comment, createdAt, imagesId) values (?, ?, ?);`,
      [comment, +new Date(), imageId]
    );

    return lastInsertRowid;
  },
};

module.exports = Comments;
