const db = require('./db').getDb();
const path = require('path');

const Images = {
  bulkCreateExternalLinkImages: async (projectId, images) => {
    const imageIds = [];
    await db.transaction(async conn => {
      for (const image of images) {
        const { originalName, externalLink, desc } = image;
        const result = await db.update(
          `
          insert into images(originalName, link, externalLink, labeled, labelData, \`desc\`, projectsId, inspected)
          values (?, 'stub', ?, 0, '{ }' ,?, ?, 0);
          `,
          [originalName, externalLink, desc, projectId],
          conn
        );
        const { lastInsertRowid } = result;
        imageIds.push(lastInsertRowid);

        await Images.updateLink(lastInsertRowid, {
          projectId,
          filename: originalName,
          connection: conn,
        });
      }
    });

    return imageIds;
  },

  getForProject: async projectId => {
    const images = await db.all(
      `
        select images.id, originalName, link, externalLink, labeled, labelData, \`desc\`, projectsId, inspected
        from images
        where images.projectsId = ?;`,
      [projectId]
    );

    return images.map(image => ({
      ...image,
      labelData: JSON.parse(image.labelData),
    }));
  },

  getByLabeled: async imageId => {
    const image = await db.get(
      `
        select id, originalName, link, externalLink, labeled, labelData, \`desc\`, projectsId, inspected, (select form from projects where id=images.projectsId) as form
        from images
        where id = ?
        and labeled = 1;`,
      [imageId]
    );

    return {
      ...image,
      labelData: JSON.parse(image.labelData),
      form: JSON.parse(image.form),
    };
  },

  getForProjectByIndex: async (projectId, size, index) => {
    const images = await db.all(
      `
        select images.id, originalName, link, labeled, labelData, \`desc\`, projectsId, inspected
        from images
        where images.projectsId = ?
        limit ? offset ?;`,
      [projectId, size, index]
    );

    return images.map(image => ({
      ...image,
      labelData: JSON.parse(image.labelData),
    }));
  },

  getForProjectByLabeled: async (projectId, labeled, size, index) => {
    const images = await db.all(
      `
        select images.id, originalName, link, labeled, labelData, \`desc\`, projectsId, inspected
        from images
        where images.projectsId = ?
        and labeled = ?
        order by images.id -- desc
        limit ? offset ?;`,
      [projectId, labeled, size, index]
    );

    return images.map(image => ({
      ...image,
      labelData: JSON.parse(image.labelData),
    }));
  },

  getForProjectByInspected: async (projectId, inspected, size, index) => {
    const images = await db.all(
      `
        select images.id, originalName, link, labeled, labelData, \`desc\`, projectsId, inspected
        from images
        where images.projectsId = ?
        and inspected = ?
        order by images.id -- desc
        limit ? offset ?;`,
      [projectId, inspected, size, index]
    );

    return images.map(image => ({
      ...image,
      labelData: JSON.parse(image.labelData),
    }));
  },

  getTotalCount: async projectId => {
    const totalProjectCount = await db.get(
      `
      select count(*) as count
      from images
      where images.projectsId = ?`,
      [projectId]
    );
    return totalProjectCount;
  },

  getTotalByLabeled: async (projectId, labeled) => {
    const totalProjectCount = await db.get(
      `
      select count(*) as count
      from images
      where images.projectsId = ?
      and labeled = ?`,
      [projectId, labeled]
    );
    return totalProjectCount;
  },

  get: async id => {
    const image = await db.get(
      `
        select *
        from images
        where images.id = ?;`,
      [id]
    );

    return { ...image, labelData: JSON.parse(image.labelData) };
  },

  addImageUrls: async (projectId, urls) => {
    const getName = url =>
      path.basename(new URL(url, 'https://base.com').pathname);

    const sql = `
      insert into images(originalName, link, externalLink, labeled, labelData, projectsId, inspected)
      values (?, 'stub', ?, 0, '{ }', ?, 0);`;

    for (const url of urls) {
      const name = getName(url);
      const { lastInsertRowid } = await db.update(sql, [name, url, projectId]);
      await Images.updateLink(lastInsertRowid, { projectId, filename: name });
    }
  },

  addImageStub: async (projectId, filename, localPath) => {
    const sql = `
      insert into images(originalName, localPath, link, labeled, labelData, projectsId, inspected)
      values (?, ?, 'stub', 0, '{ }', ?, 0);`;

    const { lastInsertRowid } = await db.update(sql, [
      filename,
      localPath,
      projectId,
    ]);
    return lastInsertRowid;
  },

  updateLink: async (imageId, { projectId, filename, connection }) => {
    const ext = path.extname(filename);
    const link = `/uploads/${projectId}/${imageId}${ext}`;
    await db.update(
      `update images set link = ? where id = ?;`,
      [link, imageId],
      connection
    );
    return `${imageId}${ext}`;
  },

  allocateUnlabeledImage: async (projectId, imageId) => {
    let result = null;
    await db.transaction(async conn => {
      if (!imageId) {
        const unmarkedImage = await db.get(
          `select id from images
          where projectsId = ? and labeled = 0
          order by RAND()
          LIMIT 1;`,
          [projectId],
          conn
        );

        imageId = unmarkedImage && unmarkedImage.id;
      }

      if (!imageId) {
        result = null;
      } else {
        await db.update(
          `update images set lastEdited = ? where id = ?;`,
          [+new Date(), imageId],
          conn
        );
        result = { imageId };
      }
    });

    return result;
  },

  updateLabel: async (imageId, labelData) => {
    await db.update(
      `
      update images
      set labelData = ?, lastEdited = ?
      where id = ?;`,
      [JSON.stringify(labelData), +new Date(), imageId]
    );
  },

  updateLabeled: async (imageId, labeled) => {
    await db.update(
      `
      update images
      set labeled = ?
      where id = ?;`,
      [labeled ? 1 : 0, imageId]
    );
  },

  updateLabeledByProject: async (projectId, labeled) => {
    await db.update(
      `
      update images
      set labeled = ?
      where projectsId = ?;`,
      [labeled ? 1 : 0, projectId]
    );
  },

  updateDesc: async (imageId, desc) => {
    await db.update(
      `
      update images
      set \`desc\` = ?
      where id = ?;`,
      [desc, imageId]
    );
  },

  updateInspected: async (imageId, inspected) => {
    await db.update(
      `
      update images
      set inspected = ?
      where id = ?;`,
      [inspected ? 1 : 0, imageId]
    );
  },

  updateInspectedByProject: async (projectId, inspected) => {
    await db.update(
      `
      update images
      set inspected = ?
      where projectsId = ?;`,
      [inspected ? 1 : 0, projectId]
    );
  },

  delete: async imageId => {
    await db.update(
      `
      delete from images
      where id = ?;`,
      [imageId]
    );
  },

  getForImport: async (projectId, originalName) => {
    const image = await db.get(
      `
      select *
      from images
      where projectsId = ? and originalName = ?;`,
      [projectId, originalName]
    );

    if (!image) {
      throw new Error('No image with name ' + originalName);
    }

    return { ...image, labelData: JSON.parse(image.labelData) };
  },
};

module.exports = Images;
