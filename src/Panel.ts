import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class Panel {
  /**
   * 从某个HTML文件读取能被Webview加载的HTML内容
   * @param {*} context 上下文
   * @param {*} templatePath 相对于插件根目录的html文件相对路径
   */
  protected getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
    const resourcePath = path.join(context.extensionPath, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
      return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
  }
}