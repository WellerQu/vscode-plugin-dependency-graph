import { FileDesc } from "./fileWalker";

export interface FileRelation {
  source: string;
  target: string;
}

export interface FileLoader {
  test: RegExp,
  analyze: (fullName: string) => Thenable<FileRelation[]>
}

export const fileAnalyzer = (loaders: FileLoader[]) => (fileDescList: FileDesc[]): Promise<FileRelation[]> => {
  return Promise.all(fileDescList.map(cur => {
    const analyzer = loaders.find(item => cur.path.match(item.test));
    if (!analyzer) {
      return Promise.resolve([]);
    }

    return analyzer.analyze(cur.path);
  })).then((results: FileRelation[][]) => {
    return results.reduce<FileRelation[]>((cum, cur) => cum.concat(cur), []);
  });
};