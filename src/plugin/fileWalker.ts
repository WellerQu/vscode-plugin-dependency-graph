import * as fs from 'fs';
import * as path from 'path';

export interface FileDesc {
  path: string;
  size: number;
  ext: string;
}

export interface WalkerOptions {
  include?: RegExp
  exclude?: RegExp
  dep?: number
}

const isIncludeFile = (regexp?: RegExp) => (filename: string) => {
  if (!regexp) {
    return true;
  }

  return (filename.match(regexp)); 
};

const isExcludeFile = (regexp?: RegExp) => (filename: string) => {
  if (!regexp) {
    return true;
  }

  return !(filename.match(regexp));  
};

export const fileWalker = (dirname: string, options?: WalkerOptions): FileDesc[] => {
  const dep = options?.dep ? options.dep - 1 : 6;
  const exclude = options?.exclude;
  const include = options?.include;

  if (dep < 0) {
    return [];
  }

  if (!fs.existsSync(dirname)) {
    return [];
  }

  const stat = fs.statSync(dirname);
  if (!stat.isDirectory())  {
    return [{ path: dirname, size: stat.size, ext: path.extname(dirname) }];
  }

  const filenames = fs.readdirSync(dirname)
    .map(filename => path.join(dirname, filename))
    .filter(isExcludeFile(exclude))
    .filter(isIncludeFile(include));

  return filenames.reduce<FileDesc[]>((cum, fullName) => {
    return cum.concat(fileWalker(fullName, { exclude, include, dep }));
  }, []);
};