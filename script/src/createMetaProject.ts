import parser from "yargs-parser";
import consola from "consola";
import parse from "csv-parse/lib/sync";
import { readFile, writeFile } from "./util";
import { MetaProject, Kipris, KiprisData } from "./domain";
import path from "path";

const buildMetaProjectFileName = (metaProject: MetaProject) => {
  const { main, mid, sub } = metaProject.meta.vienna;
  return `meta_proect_${main}${mid}${sub}.json`;
};

const main = async () => {
  const argv = parser(process.argv.slice(2));
  const {
    kipris: kiprisFilePath,
    vienna: viennaFilePath,
    main: mainCode,
    outputDir
  } = argv;

  consola.info(`${outputDir} 폴더에 파일을 생성합니다...`);

  // build CodeTree
  const codeTree: {
    [key: string]: string;
  } = {};

  parse(readFile(viennaFilePath), {
    columns: true,
    delimiter: "@",
    bom: true
  }).forEach((record: any) => {
    const key = `${record.main}_${record.mid}_${record.sub}_${record.main}${record.mid}${record.sub}`;
    codeTree[key] = record.desc;
  });

  // build Kipris
  const kipris: Kipris = {};
  parse(readFile(kiprisFilePath), {
    columns: true,
    delimiter: ",",
    bom: true
  }).forEach((record: any) => {
    const key = `${record.main}${record.mid}${record.sub}`;

    if (kipris[key] === undefined) {
      kipris[key] = [];
    }

    kipris[key].push({
      applicationCode: record.applicationNumber,
      link: record.link
    });
  });

  // loop over on main code and write file
  for (const key in codeTree) {
    const [main, mid, sub, viennaCode] = key.split("_");

    if (main == mainCode) {
      const images = kipris[viennaCode];
      if (images === undefined) continue;

      const metaProject: MetaProject = {
        meta: {
          count: images.length,
          vienna: {
            main,
            mid,
            sub,
            desc: codeTree[key]
          }
        },
        images: images.map((data: KiprisData) => {
          return {
            originalName: data.applicationCode,
            externalLink: data.link,
            desc: codeTree[key]
          };
        })
      };

      const metaProjectFileName = buildMetaProjectFileName(metaProject);

      const fullPath = path.join(outputDir, metaProjectFileName);

      writeFile(fullPath, metaProject);
    }
  }
};

if (require.main === module) {
  main();
}
