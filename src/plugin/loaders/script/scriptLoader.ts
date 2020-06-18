import { FileLoader, FileRelation } from "../../analyzer";
import * as fs from 'fs';
import * as path from 'path';

const fillOptions = ['.ts', '.tsx', '.d.ts', '/index.ts', '/index.d.ts', '.js', '.jsx', '/index.js'];

export const scriptLoader: FileLoader = {
  test: /\.tsx?$/igm,
  analyze: (fullName: string) => {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(fullName, { encoding: 'utf-8' }, (err, content) => {
        if (err) {
          return reject(err);
        }
        resolve(content);
      });
    }).then(content => {
      const relations: FileRelation[] = [];
      const regexp = /^(?!\/\/)(?:.*?(?:from |require|import\()['"])(?<dep>[^'"]+)/gim;

      let matches: RegExpExecArray | null;
      while ((matches = regexp.exec(content)) !== null && matches.groups) {
        const dependencyName = matches.groups.dep;

        // 第一种情况: dependency 是一个简单的相对路径, 可能带有文件扩展名, 也可能不带文件扩展名
        if (dependencyName.startsWith('.', 0)) {
          const dirname = path.dirname(fullName);
          const fullDependencyName = path.join(dirname, dependencyName);
          const extname = path.extname(fullDependencyName); 
          const maybeName = !extname ? fillOptions
            .map(ext => `${fullDependencyName}${ext}`)
            .find(item => fs.existsSync(item))
            : fullDependencyName;

          if (!maybeName) {
            continue;
          }

          relations.push({ source: fullName, target: maybeName });
        }
        // 第二种情况: dependency 是一个被 webpack 重命名的相对路径
        // 第三种情况: dependency 是一个被 tsconfig 重命名的相对路径
        // 第四种情况: dependency 是一个在 node_modules 中的依赖路径, 这种情况暂时忽略
        // 第五种情况: dependency 是一个 node 内置功能包
      }

      return relations;
    });
  }
};