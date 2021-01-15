import parser from "yargs-parser";
import consola from "consola";
import { ImageCroppedCollection } from "./domain";
import { readFile, postData } from "./util";

const parseJson = (rawData: string): ImageCroppedCollection => {
  return JSON.parse(rawData);
};

const main = async () => {
  const argv = parser(process.argv.slice(2));
  const { annotation: projectFilePath, url } = argv;

  const readData = readFile(projectFilePath);
  const { imagePath, link, shapes } = parseJson(readData);

  const croppedLabels = shapes
    .filter(shape => shape.label !== "제거")
    .map(shape => {
      return {
        type: shape.label,
        points: shape.points
      };
    });

  const deleteLabels = shapes
    .filter(shape => shape.label === "제거")
    .map(shape => {
      return {
        type: shape.label,
        points: shape.points
      };
    });

  const rawData = {
    originalName: imagePath,
    link,
    croppedLabels,
    deleteLabels
  };
  const res = await postData(url, JSON.stringify(rawData));
  const data = await res.json();

  if (data.code === 400) {
    consola.error(data.message);
  }
};

if (require.main === module) {
  main();
}
