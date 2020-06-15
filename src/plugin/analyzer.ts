import { FileDesc } from "./fileWalker";

export interface FileRelation {
  source: string;
  target: string;
}

export interface FileLoader {
  test: RegExp,
  analyze: () => FileRelation[]
}

export default (loaders: FileLoader[]) => (fileDescList: FileDesc[]): FileRelation[] => {
  return [];
};