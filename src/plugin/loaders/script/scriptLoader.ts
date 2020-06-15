import { FileLoader, FileRelation } from "../../analyzer";
import * as fs from 'fs';

export const scriptLoader: FileLoader = {
  test: /\.ts$/igm,
  analyze: (fullName: string) => {
    const relations: FileRelation[] = [];

    try {
      const content = fs.readFileSync(fullName, { encoding: 'utf-8' });
      const regexp = /\b(?<=from ['"])[^'"]+|\b(?<=require\(['"])[^'"]+/gim;

      let matches: RegExpExecArray | null;
      while ((matches = regexp.exec(content)) !== null && matches.length > 0) {
        relations.push({ source: fullName, target: matches[0] });
      }
    } catch (e) {
    }

    return relations;
  }
};