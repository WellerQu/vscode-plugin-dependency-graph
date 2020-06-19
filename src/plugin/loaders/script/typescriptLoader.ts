import { FileLoader, FileRelation } from "../../analyzer";
import { detect } from "../detectDependencies";

const fileOptions = ['.tsx', '/index.tsx', '.vue', '/index.vue', '.ts', '/index.ts', '.d.ts', '/index.d.ts'];

export const typescriptLoader: FileLoader = {
  test: /\.tsx?$/igm,
  analyze: (fullName: string, sourceCode: string, scope: string) => {
    const regExp = /^(?!\/\/)(?:.*?(?:from|require|import)\s*\(?\s*['"])(?<dep>[^'"]+)/gim;
    return detect(regExp, fullName, sourceCode, fileOptions, scope);
  }
};