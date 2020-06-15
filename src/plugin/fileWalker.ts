import * as fs from 'fs';
import * as path from 'path';

export interface FileDesc {
  path: string;
  size: number;
}

export interface WalkerOptions {
  ignore: RegExp,
}

const isNotIgnoreFile = (regexp?: RegExp) => (filename: string) => {
  if (!regexp) {
    return true;
  }

  const r = !(filename.match(regexp)); 
  console.log(filename, r);

  return r;
};

export const fileWalker = (dirname: string, options?: WalkerOptions): FileDesc[] => {
  if (!fs.existsSync(dirname)) {
    return [];
  }

  const stat = fs.statSync(dirname);
  if (!stat.isDirectory())  {
    return [{ path: dirname, size: stat.size }];
  }

  const filenames = fs.readdirSync(dirname)
    .filter(isNotIgnoreFile(options?.ignore))
    .map(filename => path.join(dirname, filename));

  return filenames.reduce<FileDesc[]>((cum, fullName) => {
    return cum.concat(fileWalker(fullName, options));
  }, []);
};