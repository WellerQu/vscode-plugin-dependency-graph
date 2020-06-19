import { FileLoader, FileRelation } from "../../analyzer";
import * as fs from 'fs';
import * as path from 'path';

const fileOptions = ['.ts', '.tsx', '.d.ts', '/index.ts', '/index.d.ts', '.js', '.jsx', '/index.js', '.vue', '/index.vue'];

export const scriptLoader: FileLoader = {
  test: /\.tsx?$|\.vue$|\.jsx?$/igm,
  analyze: (fullName: string, scope?: string) => {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(fullName, { encoding: 'utf-8' }, (err, content) => {
        if (err) {
          return reject(err);
        }
        resolve(content);
      });
    }).then(content => {
      const relations: FileRelation[] = [];
      const regexp = /^(?!\/\/)(?:.*?(?:from|require|import)\s*\(?\s*['"])(?<dep>[^'"]+)/gim;

      let matches: RegExpExecArray | null;
      while ((matches = regexp.exec(content)) !== null && matches.groups) {
        const dependencyName = matches.groups.dep;
        let maybeName: string | undefined;
        // 第一种情况: dependency 是一个在 node_modules 中的依赖路径, 这种情况暂时忽略
        // 第二种情况: dependency 是一个 node 内置功能包, 忽略

        // 第三种情况: dependency 是一个简单的相对路径, 可能带有文件扩展名, 也可能不带文件扩展名
        // 例如: ../path/to/file.js or ./path/to/file
        if (dependencyName.startsWith('.', 0)) {
          const dirname = path.dirname(fullName);
          const fullDependencyName = path.join(dirname, dependencyName);
          const extname = path.extname(fullDependencyName);
          maybeName = (!extname ? fileOptions.map(ext => `${fullDependencyName}${ext}`) : [fullDependencyName])
            .find(item => fs.existsSync(item));
        }
        // 第四种情况: dependency 是一个被 webpack 重命名的相对路径
        // 第五种情况: dependency 是一个被 tsconfig 重命名的相对路径

        if (!maybeName) {
          continue;
        }

        if (!scope || !maybeName.startsWith(scope, 0)) {
          continue;
        }

        relations.push({ source: fullName, target: maybeName });
      }

      return relations;
    });
  }
};