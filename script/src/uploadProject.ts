//
import parser from "yargs-parser";
import consola from "consola";
import { ProjectCollection } from "./domain";
import { readFile, postData } from "./util";

const parseJson = (rawData: string): ProjectCollection => {
  return JSON.parse(rawData);
};

const main = async () => {
  const argv = parser(process.argv.slice(2));
  const { project: projectFilePath, url } = argv;

  const rawData = readFile(projectFilePath);
  const { meta, projects } = parseJson(rawData);

  consola.info(`총 ${meta.count}개의 프로젝트를 업로드 합니다...`);

  for (const project of projects) {
    const res = await postData(url, JSON.stringify(project));

    const data = await res.json();
    if (data.code === 400) {
      consola.error(data.message);
    }
  }
};

if (require.main === module) {
  main();
}
