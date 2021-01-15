const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const archiver = require('archiver');
const request = require('request');

const path = require('path');
const fs = require('fs').promises;

const projects = require('./queries/projects');
const images = require('./queries/images');
const comments = require('./queries/comments');
const mlmodels = require('./queries/mlmodels');
const exporter = require('./exporter');
const importer = require('./importer');
const publisher = require('./publisher');
const { setup, checkLoginMiddleware, authHandler } = require('./auth');

const UPLOADS_PATH =
  process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');

const app = express();

setup(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/api/summary', async (req, res) => {
  try {
    const getImageCount = projects => {
      let total = 0;
      let labeled = 0;
      for (const p of projects) {
        const imagesCount = p.imagesCount ? p.imagesCount : 0;
        const labelCount = p.labelsCount ? p.labelsCount : 0;

        total += imagesCount;
        labeled += labelCount;
      }

      return [total, labeled];
    };

    const [allTotal, allLabeled] = getImageCount(await projects.getAll());
    const [compTotal, compLabeled] = getImageCount(
      await projects.getAllByStatus('COMPLETE')
    );
    const [progTotal, progLabeled] = getImageCount(
      await projects.getAllByStatus('PROGRESS')
    );
    const [pausTotal, pausLabeled] = getImageCount(
      await projects.getAllByStatus('PAUSE')
    );

    res.json({
      total: {
        labeled: allLabeled,
        unlabeled: allTotal - allLabeled,
      },
      complete: {
        labeled: compLabeled,
        unlabeled: compTotal - compLabeled,
      },
      progress: {
        labeled: progLabeled,
        unlabeled: progTotal - progLabeled,
      },
      pause: {
        labeled: pausLabeled,
        unlabeled: pausTotal - pausLabeled,
      },
    });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.post('/api/bulk/images/', async (req, res) => {
  const { projectId, images: imgs } = req.body;

  if (!projectId || !imgs) {
    res.status(400);
    res.json({
      message: 'projectId and images are required',
      code: 400,
    });
  }

  try {
    const imageIds = await images.bulkCreateExternalLinkImages(projectId, imgs);
    res.json({
      success: true,
      imageIds,
    });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/mlmodels', (req, res) => {
  res.json(mlmodels.getAll());
});

app.post('/api/mlmodels', checkLoginMiddleware, (req, res) => {
  const { model } = req.body;
  const id = mlmodels.create(model);
  res.json({
    success: true,
    id,
  });
});

app.post('/api/mlmodels/:id', (req, res) => {
  const { id } = req.params;
  const model = mlmodels.get(id);
  request
    .post(model.url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })
    .pipe(res);
});

app.delete('/api/mlmodels/:id', checkLoginMiddleware, (req, res) => {
  const { id } = req.params;
  const model = mlmodels.delete(id);
  res.json({ success: true });
});

app.get('/api/projects', checkLoginMiddleware, async (req, res) => {
  const size = req.query.size;
  const index = req.query.index;
  const status = req.query.status;

  try {
    if (!size && !index && !status) {
      res.json(await projects.getAll());
      return;
    }

    if (!size | !index) {
      res.status(400);
      res.json({
        message: 'you need page size and index',
        code: 400,
      });
      return;
    }

    if (size && index && !status) {
      res.json(await projects.getByIndex(Number(size), Number(index)));
      return;
    } else {
      res.json(await projects.getByStatus(Number(size), Number(index), status));
      return;
    }
  } catch (err) {
    res.json({
      message: err.mesage,
      code: 400,
    });
  }
});

app.post('/api/projects', async (req, res) => {
  const body = req.body;

  const isEmptyObject = param => {
    return Object.keys(param).length === 0 && param.constructor === Object;
  };

  if (isEmptyObject(body)) {
    res.json(await projects.create());
    return;
  }

  const { projectId, name, form } = req.body;

  if (!projectId || !name || !form) {
    res.status(400);
    res.json({
      message: 'you need projectId, name and formParts',
      code: 400,
    });
    return;
  }

  try {
    const proj = await projects.createWithData(projectId, name, form);
    res.json(proj);
    return;
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
    return;
  }
});

app.get('/api/projects/count', checkLoginMiddleware, async (req, res) => {
  const status = req.query.status;

  try {
    if (status) {
      res.json(await projects.getTotalCountByStatus(status));
    } else {
      res.json(await projects.getTotalCount());
    }
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/projects/:id', checkLoginMiddleware, async (req, res) => {
  try {
    const result = await projects.get(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.patch('/api/projects/:id', checkLoginMiddleware, async (req, res) => {
  const { project } = req.body;
  try {
    await projects.update(req.params.id, project);
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
    return;
  }

  res.json({ success: true });
});

app.patch(
  '/api/projects/images/label',
  checkLoginMiddleware,
  async (req, res) => {
    const { projectId, labeled } = req.body;

    try {
      await images.updateLabeledByProject(projectId, labeled);
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }
    res.json({ success: true });
  }
);

app.patch(
  '/api/projects/images/inspect',
  checkLoginMiddleware,
  async (req, res) => {
    const { projectId, inspected } = req.body;

    try {
      await images.updateInspectedByProject(projectId, inspected);
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }
    res.json({ success: true });
  }
);

app.post('/api/status/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await projects.updateStatus(req.params.id, status);
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
    return;
  }

  res.json({ success: true });
});

app.delete('/api/projects/:id', checkLoginMiddleware, async (req, res) => {
  try {
    await projects.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/images/count', checkLoginMiddleware, async (req, res) => {
  const { projectId, labeled } = req.query;

  try {
    if (labeled === undefined) {
      res.json(await images.getTotalCount(Number(projectId)));
      return;
    } else {
      res.json(
        await images.getTotalByLabeled(Number(projectId), Number(labeled))
      );
      return;
    }
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/images', async (req, res) => {
  const projectId = req.query.projectId;
  const labeled = Number(req.query.labeled);
  const inspected = Number(req.query.inspected);
  const size = Number(req.query.size);
  const index = Number(req.query.index);

  try {
    if (projectId && size && index >= 0) {
      if (req.query.labeled !== undefined) {
        res.json(
          await images.getForProjectByLabeled(projectId, labeled, size, index)
        );
      } else if (req.query.inspected !== undefined) {
        res.json(
          await images.getForProjectByInspected(
            projectId,
            inspected,
            size,
            index
          )
        );
      } else {
        res.json(await images.getForProjectByIndex(projectId, size, index));
      }
    } else if (projectId && !size && !index >= 0) {
      res.json(await images.getForProject(projectId));
    } else {
      res.status(400);
      res.json({
        message: 'you need a page id or page size and index',
        code: 400,
      });
      return;
    }
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/images/:id', async (req, res) => {
  try {
    res.json(await images.get(req.params.id));
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.post('/api/images', checkLoginMiddleware, async (req, res) => {
  const { projectId, urls, localPath } = req.body;
  if (urls) {
    try {
      await images.addImageUrls(projectId, urls);
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }
    res.json({ success: true });
  } else if (localPath) {
    try {
      const files = await fs.readdir(localPath);
      const isImage = p =>
        ['.jpg', '.jpeg', '.png'].includes(path.extname(p).toLowerCase());
      const imagePaths = files.filter(isImage);
      if (!imagePaths.length) {
        throw new Error('The specified folder has no image files.');
      }
      for (const filename of imagePaths) {
        const id = await images.addImageStub(
          projectId,
          filename,
          path.join(localPath, filename)
        );
        await images.updateLink(id, { projectId, filename });
      }
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }
    res.json({ success: true });
  } else {
    res.status(400);
    res.json({
      message: 'No urls or local path passed',
      code: 400,
    });
  }
});

app.delete('/api/images/:id', checkLoginMiddleware, async (req, res) => {
  try {
    await images.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/getLabelingInfo', async (req, res) => {
  let { projectId, projectHash, imageId } = req.query;

  if (!projectId || !projectHash) {
    res.status(400);
    res.json({
      message: 'projectId and projectHash required',
      code: 400,
    });
    return;
  }

  try {
    await projects.checkValidation(projectId, projectHash);

    if (!imageId) {
      const ret = await images.allocateUnlabeledImage(projectId, imageId);
      if (!ret) {
        res.json({
          success: true,
        });
        return;
      }
      ({ imageId } = ret);
    }

    const project = await projects.get(projectId);
    const image = await images.get(imageId);
    const cmts = await comments.getForImage(imageId);

    res.json({
      project,
      image,
      comments: cmts,
    });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.patch('/api/images/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const { labelData, labeled, desc, inspected } = req.body;

  try {
    if (labelData) {
      await images.updateLabel(imageId, labelData);
    }
    if (labeled !== undefined) {
      await images.updateLabeled(imageId, labeled);
    }

    if (inspected !== undefined) {
      await images.updateInspected(imageId, inspected);
    }

    if (desc) {
      await images.updateDesc(imageId, desc);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

const uploads = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const { projectId } = req.params;
      try {
        if (!projects.get(projectId)) {
          throw new Error('No such projectId.');
        }
        const dest = path.join(UPLOADS_PATH, projectId);
        try {
          await fs.mkdir(dest);
        } catch (err) {}
        cb(null, dest);
      } catch (err) {
        cb(err);
      }
    },
    filename: async (req, file, cb) => {
      try {
        const { projectId } = req.params;
        const filename = file.originalname;

        if (req.reference) {
          const ext = path.extname(filename);
          const name = `_reference${ext}`;
          const referenceLink = `/uploads/${projectId}/${name}`;
          await projects.updateReference(projectId, referenceLink);
          cb(null, name);
        } else {
          const id = await images.addImageStub(projectId, filename, null);
          const newName = await images.updateLink(id, { projectId, filename });
          cb(null, newName);
        }
      } catch (err) {
        cb(err);
      }
    },
  }),
});

app.get('/api/comments/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const cmts = await comments.getForImage(imageId);

    res.json({
      comments: cmts,
    });
  } catch (err) {
    res.status(400);
    res.send({
      mesage: err.message,
      code: 400,
    });
  }
});

app.post('/api/comments/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    res.status(400);
    res.send({
      mesage: 'comment is required',
      code: 400,
    });
  }

  try {
    const id = await comments.addComment(imageId, comment);

    res.json({ id });
  } catch (err) {
    res.status(400);
    res.send({
      mesage: err.message,
      code: 400,
    });
  }
});

app.post(
  '/api/uploads/:projectId',
  checkLoginMiddleware,
  uploads.array('images'),
  (req, res) => {
    res.json({ success: true });
  }
);

app.post(
  '/api/uploads/:projectId/reference',
  checkLoginMiddleware,
  (req, res, next) => {
    req.reference = true;
    next();
  },
  uploads.single('referenceImage'),
  (req, res) => {
    res.json({ success: true });
  }
);

const imports = multer({
  storage: importer(),
});
app.post(
  '/api/import/:projectId',
  checkLoginMiddleware,
  (req, res, next) => {
    req.importRes = [];
    next();
  },
  imports.array('files'),
  (req, res) => {
    const { importRes } = req;
    const message = importRes.map(({ message }) => message).join('\n');
    res.json({ success: true, message });
  }
);

app.get('/uploads/:projectId/:imageName', async (req, res) => {
  const { projectId, imageName } = req.params;
  const imageId = imageName.split('.')[0];
  try {
    if (imageId !== '_reference') {
      const image = await images.get(imageId);
      if (image.localPath) {
        res.sendFile(image.localPath);
        return;
      } else if (image.externalLink) {
        request.get(image.externalLink).pipe(res);
        return;
      }
    }
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }

  res.sendFile(path.join(UPLOADS_PATH, projectId, path.join('/', imageName)));
});

app.get(
  '/api/projects/:projectId/export',
  checkLoginMiddleware,
  async (req, res) => {
    const archive = archiver('zip');

    archive.on('error', err => {
      res.status(500).send({ error: err.message });
    });

    res.attachment('project-export.zip');

    archive.pipe(res);

    const { projectId } = req.params;

    try {
      const projects = await exporter.exportProject(projectId);
      projects.forEach(({ name, contents }) => {
        archive.append(contents, { name });
      });

      archive.finalize();
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
    }
  }
);

app.get('/api/projects/:projectId/publish', async (req, res) => {
  const { projectId } = req.params;

  const archive = archiver('zip');

  archive.on('error', err => {
    res.status(500).send({ error: err.message });
  });

  res.attachment(`project-${projectId}-publish.zip`);

  archive.pipe(res);

  try {
    const projectData = await publisher.publishProject(projectId);

    const fromFile = async link => {
      const imagePath = path.join(UPLOADS_PATH, '..', link);
      const file = await fs.readFile(imagePath);
      return file;
    };

    for (const {
      originalName,
      externalLink,
      link,
      cropLinks,
      name,
      contents,
    } of projectData) {
      const image = externalLink
        ? request.get(externalLink)
        : await fromFile(link);
      const imageName = image ? originalName + '.jpg' : 'NO_IMAGE';
      archive.append(null, { name: originalName + '/' }); // dir
      archive.append(image, { name: originalName + '/' + imageName }); // image file
      archive.append(contents, { name: originalName + '/' + name }); // annotation file
    }

    archive.finalize();
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.get('/api/auth', authHandler);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();
    if (req.url.startsWith('/uploads/')) return next();
    res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
  });
}

const PORT = process.env.API_PORT || process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;
