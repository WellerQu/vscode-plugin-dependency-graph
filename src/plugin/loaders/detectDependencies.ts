import * as path from 'path';
import * as fs from 'fs';
import { FileRelation } from '../analyzer';

export function detect(regExp: RegExp, relativeFile: string, sourceCode: string, options: string[], scope: string) {
  const relations: FileRelation[] = [];

  let matches: RegExpExecArray | null;
  while ((matches = regExp.exec(sourceCode)) !== null && matches.groups) {
    const dependencyName = matches.groups.dep;
    let maybeName: string | undefined;
    // 第一种情况: dependency 是一个在 node_modules 中的依赖路径, 这种情况暂时忽略
    // 第二种情况: dependency 是一个 node 内置功能包, 忽略

    // 第三种情况: dependency 是一个简单的相对路径, 可能带有文件扩展名, 也可能不带文件扩展名
    // 例如: ../path/to/file.js or ./path/to/file
    if (dependencyName.startsWith('.', 0)) {
      const dirname = path.dirname(relativeFile);
      const fullDependencyName = path.join(dirname, dependencyName);
      const extname = path.extname(fullDependencyName);
      maybeName = (!extname ? options.map(ext => `${fullDependencyName}${ext}`) : [fullDependencyName])
        .find(item => fs.existsSync(item));
    }
    // 第四种情况: dependency 是一个被 webpack 重命名的相对路径
    // 第五种情况: dependency 是一个被 tsconfig 重命名的相对路径

    if (!maybeName) {
      continue;
    }
    if (!maybeName.startsWith(scope)) {
      continue;
    }

    relations.push({ source: relativeFile, target: maybeName });
  }

  return relations;
}