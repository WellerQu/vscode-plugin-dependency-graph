import { FileLoader } from "../../analyzer";

export const cssLoader: FileLoader = {
  test: /(?:\.css|\.less|\.sass|\.scss)$/igm,
  analyze: (fullName: string, sourceCode: string) => {
    const regExp = /^(?!\/\/)(?:.*?(?:from|require|import)\s*\(?\s*['"])(?<dep>[^'"]+)/gim;
    return [];
  }
};
