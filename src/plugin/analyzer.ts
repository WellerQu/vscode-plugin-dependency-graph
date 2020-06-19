import { FileDesc } from "./fileWalker";
import * as fs from 'fs';

export interface FileRelation {
  source: string;
  target: string;
}

export interface FileLoader {
  test: RegExp;
  analyze: (fullPath: string, sourceCode: string, scope: string) => FileRelation[];
}

function createReadPromise(file: FileDesc): Promise<[FileDesc, string]> {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, { encoding: 'utf-8' }, (err, content) => {
      if (err) {
        return reject(err);
      }
      resolve([file, content]);
    });
  });
}

export const fileAnalyzer = (loaders: FileLoader[]) => (fileDescList: FileDesc[], scope: string): Promise<FileRelation[]> => {
  const fileReadPromises: Promise<[FileDesc, string]>[] = fileDescList
    .map(createReadPromise);
  
  return Promise.all(fileReadPromises)
    .then((results: [FileDesc, string][]) =>{
      return results.reduce<FileRelation[]>((cum, [file, sourceCode]) => {
        return cum.concat(loaders.reduce<FileRelation[]>((relations, loader) => {
          return relations.concat(file.path.match(loader.test) ? loader.analyze(file.path, sourceCode, scope) : []);
        }, []));
      }, []);
  });
};