import { FileLoader } from "../../analyzer";

export const cssLoader: FileLoader = {
  test: /(?:\.css|\.less|\.sass)$/igm,
  analyze: (fullName: string) => {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }
};
