import { FileLoader, FileRelation } from "../../analyzer";
import { detect } from "../detectDependencies";

const fileOptions = ['.jsx', '/index.jsx', '.vue', '/index.vue', '.js', '/index.js'];

export const javascriptLoader: FileLoader = {
  test: /\.jsx?$/igm,
  analyze: (fullName: string, sourceCode: string, scope: string) => {
    const regExp = /^(?!\/\/)(?:.*?(?:from|require|import)\s*\(?\s*['"])(?<dep>[^'"]+)/gim;
    return detect(regExp, fullName, sourceCode, fileOptions, scope);
  }
};