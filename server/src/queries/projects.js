const db = require('./db').getDb();
const { v4: uuidv4 } = require('uuid');

module.exports = {
  getAll: async () => {
    const projects = await db.all(
      `
      select projects.id, projects.hash, projects.name, projects.form, projects.status, count(images.id) as imagesCount, sum(images.labeled) as labelsCount
      from projects
      left join images on projects.id = images.projectsId
      group by projects.id;`,
      []
    );

    return projects.map(project => ({
      ...project,
      form: JSON.parse(project.form),
    }));
  },

  getByIndex: async (size, index) => {
    const projects = await db.all(
      `
      select projects.id, projects.hash, projects.name, projects.form, projects.status, count(images.id) as imagesCount, sum(images.labeled) as labelsCount 
      from (
        select id, \`hash\`, \`name\`, form, status
        from projects
        limit ? offset ?
      ) projects 
      left join images on projects.id = images.projectsId 
      group by projects.id;`,
      [size, index]
    );

    return projects.map(project => ({
      ...project,
      form: JSON.parse(project.form),
    }));
  },

  getAllByStatus: async status => {
    const projects = await db.all(
      `
      select projects.id, projects.hash, projects.name, projects.form, projects.status, count(images.id) as imagesCount, sum(images.labeled) as labelsCount 
      from (
        select id, \`hash\`, \`name\`, form, status
        from projects
        where status = ?
      ) projects 
      left join images on projects.id = images.projectsId 
      group by projects.id;`,
      [status]
    );

    return projects.map(project => ({
      ...project,
      form: JSON.parse(project.form),
    }));
  },

  getByStatus: async (size, index, status) => {
    const projects = await db.all(
      `
      select projects.id, projects.hash, projects.name, projects.form, projects.status, count(images.id) as imagesCount, sum(images.labeled) as labelsCount 
      from (
        select id, \`hash\`, \`name\`, form, status
        from projects
        where status = ?
        limit ? offset ?
      ) projects 
      left join images on projects.id = images.projectsId 
      group by projects.id;`,
      [status, size, index]
    );

    return projects.map(project => ({
      ...project,
      form: JSON.parse(project.form),
    }));
  },

  get: async id => {
    const project = await db.get(
      `
      select projects.id, projects.hash, projects.name, projects.form, projects.status, count(images.id) as imagesCount, sum(images.labeled) as labelsCount
      from projects

      left join images on ? = images.projectsId
      where projects.id = ?`,
      [id, id]
    );
    return { ...project, form: JSON.parse(project.form) };
  },

  getTotalCount: async () => {
    const totalProjectCount = await db.get(
      `
      select count(*) as count
      from projects;`,
      []
    );
    return totalProjectCount;
  },

  getTotalCountByStatus: async status => {
    const totalProjectCount = await db.get(
      `
      select count(*) as count
      from projects
      where status = ?;`,
      [status]
    );
    return totalProjectCount;
  },

  create: async () => {
    const hash = uuidv4();
    const res = await db.update(
      `
      insert into projects(\`name\`, \`form\`, \`hash\`, \`status\`) values ('New Project', '{ "formParts": [] }', ?, 'PAUSE');`,
      [hash]
    );
    const { lastInsertRowid: id } = res;
    const project = await db.get(`select * from projects where id = ?;`, [id]);

    return {
      imagesCount: 0,
      labelsCount: 0,
      ...project,
      form: JSON.parse(project.form),
    };
  },

  createWithData: async (projectId, name, formParts) => {
    const hash = uuidv4();
    const res = await db.update(
      `
      insert into projects(id, name, form, hash, status) values (?, ?, ?, ?, 'PAUSE');`,
      [projectId, name, JSON.stringify(formParts), hash]
    );

    const { lastInsertRowid: id } = res;

    const project = await db.get(`select * from projects where id = ?;`, [id]);

    return {
      imagesCount: 0,
      labelsCount: 0,
      ...project,
      form: JSON.parse(project.form),
    };
  },

  update: async (id, project) => {
    if (
      !project.name ||
      project.name === '' ||
      !Array.isArray(project.form.formParts)
    ) {
      throw new Error('Project must have a non-empty name and a form object.');
    }
    if (!id) {
      throw new Error('Must present a valid id.');
    }

    await db.update(
      `
      update projects
      set name = ?, form = ?, referenceLink = ?, referenceText = ?
      where id = ?;`,
      [
        project.name,
        JSON.stringify(project.form),
        project.referenceLink || '',
        project.referenceText || '',
        id,
      ]
    );
  },

  updateReference: async (id, referenceLink) => {
    await db.update(
      `
      update projects
      set referenceLink = ?
      where id = ?;`,
      [referenceLink, id]
    );
  },

  updateStatus: async (id, status) => {
    await db.update(
      `
      update projects
      set status = ?
      where id = ?;`,
      [status, id]
    );
  },

  checkValidation: async (id, hash) => {
    const projectHash = await db.get(
      `
      select hash
      from projects
      where id = ?;`,
      [id]
    );

    if (projectHash.hash !== hash) {
      throw new Error('Must has valid hash');
    }
  },

  delete: async id => {
    await db.update(`delete from projects where id=?;`, [id]);
  },
};
