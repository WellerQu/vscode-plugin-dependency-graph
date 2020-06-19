import { FileLoader, FileRelation } from "../../analyzer";
import { detect } from "../detectDependencies";

const fileOptions = ['.vue', '/index.vue'];

export const vueLoader: FileLoader = {
  test: /\.vue$/igm,
  analyze: (fullName: string, sourceCode: string, scope: string) => {
    const regExp = /^(?!\/\/)(?:.*?(?:from|require|import)\s*\(?\s*['"])(?<dep>[^'"]+)/gim;
    return detect(regExp, fullName, sourceCode, fileOptions, scope);
  }
};