const images = require('./queries/images');
const projects = require('./queries/projects');

exports.publishProject = async projectId => {
  const imgs = await images.getForProject(projectId);
  const project = await projects.get(projectId);

  return imgs.map(img => {
    const { id, originalName, labelData, labeled, externalLink, link } = img;

    const publicLabels = (formParts, labels) => {
      let rv = {};
      for (const [key, label] of Object.entries(labels)) {
        if (key == '__temp') continue;

        const fineName = (formParts, key) => {
          let name = '';
          for (const form of formParts) {
            if (form.id == key) {
              name = form.name;
              break;
            }
          }

          return name;
        };

        rv[key] = label.map(annotation => {
          return {
            name: fineName(formParts, key),
            annotations: annotation,
          };
        });
      }

      return rv;
    };

    const contents = {
      link: externalLink,
      originalName,
      labels: publicLabels(project.form.formParts, labelData.labels || {}),
    };

    return {
      originalName,
      externalLink,
      cropLinks: [],
      link,
      name: `${originalName}.json`,
      contents: JSON.stringify(contents, null, 2),
    };
  });
};
