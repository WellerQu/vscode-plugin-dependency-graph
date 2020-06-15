import { FileDesc } from "./fileWalker";

export interface FileRelation {
  source: string;
  target: string;
}

export interface FileLoader {
  test: RegExp,
  analyze: (fullName: string) => FileRelation[]
}

export const fileAnalyzer = (loaders: FileLoader[]) => (fileDescList: FileDesc[]): FileRelation[] => {
  return fileDescList.reduce<FileRelation[]>((cum, cur) => {
    const analyzer = loaders.find(item => cur.path.match(item.test));
    const relations = analyzer?.analyze(cur.path);
    return cum.concat(relations ?? []);
  }, []);
};