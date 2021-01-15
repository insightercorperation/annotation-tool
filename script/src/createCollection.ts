import parser from "yargs-parser";
import {
  MetaProject,
  ProjectCollection,
  ImageCollection,
  Project,
  Meta,
  FormPart
} from "./domain";

import { sliceArray, readFile, writeFile } from "./util";
import path from "path";

const parseJson = (rawData: string): MetaProject => {
  return JSON.parse(rawData);
};

const buildProjectCollectionFileName = (meta: Meta) => {
  const { main, mid, sub } = meta.vienna;
  return `project_collection_${main}${mid}${sub}.json`;
};

const buildImageCollectionFileName = (imgCollection: ImageCollection) => {
  return `image_collection_${imgCollection.projectId}.json`;
};

const createProjectAndImageGroup = (
  metaProject: MetaProject,
  size: number,
  initalId: number
): [ProjectCollection, ImageCollection[]] => {
  const initialProjectCollection: ProjectCollection = {
    meta: {
      count: 0,
      vienna: metaProject.meta.vienna
    },
    projects: []
  };

  const initalImageCollectionList: ImageCollection[] = [];

  const imageGroups = sliceArray(metaProject.images, size);

  function* genId(initalId: number) {
    let init = initalId;
    while (true) {
      yield init++;
    }
  }

  const getId = genId(initalId);

  const buildProjectName = (meta: Meta, idx: number): string => {
    const { main, mid, sub, desc } = meta.vienna;
    return `${desc}@${main}-${mid}-${mid}-${sub}#${idx}`;
  };

  const buildFormParts = (desc: string = "default"): FormPart[] => {
    const randId = () =>
      `${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    return [
      {
        id: randId(),
        name: desc,
        type: "bbox"
      },
      {
        id: randId(),
        name: desc,
        type: "polygon"
      },
      {
        id: randId(),
        name: "제거",
        type: "polygon"
      }
    ];
  };

  for (const idx in imageGroups) {
    const projectId = getId.next().value || -1;
    // create project and push to collection
    const proj: Project = {
      projectId,
      name: buildProjectName(metaProject.meta, parseInt(idx) + 1),
      form: {
        formParts: buildFormParts(metaProject.meta.vienna.desc)
      }
    };
    initialProjectCollection.projects.push(proj);

    // create imageCollection and push to collection
    const imageCollection: ImageCollection = {
      projectId,
      images: imageGroups[idx]
    };
    initalImageCollectionList.push(imageCollection);
  }

  // set project counts
  initialProjectCollection.meta.count =
    initialProjectCollection.projects.length;

  return [initialProjectCollection, initalImageCollectionList];
};

const main = async () => {
  const argv = parser(process.argv.slice(2));
  const { metaproject: metaProjectPath, size, initialId, outputDir } = argv;

  if (size < 1) {
    return;
  }

  const rawData = readFile(metaProjectPath);
  const metaProject: MetaProject = parseJson(rawData);
  const [projectCollection, imageCollectionList] = createProjectAndImageGroup(
    metaProject,
    size,
    initialId
  );

  const projectCollecteionFileName = buildProjectCollectionFileName(
    projectCollection.meta
  );
  const fullPath = path.join(outputDir, projectCollecteionFileName);
  writeFile(fullPath, projectCollection);

  for (const imageCollection of imageCollectionList) {
    const imageCollectionFileName = buildImageCollectionFileName(
      imageCollection
    );
    const fullPath = path.join(outputDir, imageCollectionFileName);
    writeFile(fullPath, imageCollection);
  }
};

if (require.main === module) {
  main();
}
