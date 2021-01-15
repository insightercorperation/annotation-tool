import consola from "consola";
import parser from "yargs-parser";
import { readFile, postData } from "./util";

const main = async () => {
  const argv = parser(process.argv.slice(2));
  const { image: imageFilePath, url } = argv;

  const rawData = readFile(imageFilePath);
  const res = await postData(url, rawData);
  const data = await res.json();
  consola.log(data);
  if (data.code === 400) {
    consola.error(data.message);
  }
};

if (require.main == module) {
  main();
}
