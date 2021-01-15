import fs from "fs";
import fetch from "node-fetch";

export const readFile = (path: string): string => {
  return fs.readFileSync(path, { encoding: "utf-8" });
};

export const writeFile = (fullPath: string, obj: any): void => {
  fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2));
};

export const postData = async (url: string, body: string): Promise<any> => {
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body
  });
};

export const sliceArray = <T>(array: T[], size: number) => {
  const result = [];
  const loop: number = array.length / size;
  for (let i = 0; i < loop; i++) {
    const arr = array.slice(i * size, (i + 1) * size);
    result.push(arr);
  }

  return result;
};
