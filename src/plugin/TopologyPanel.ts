import * as vscode from 'vscode';
import { Panel } from './Panel';

import { fileWalker, WalkerOptions } from './fileWalker';
import { fileAnalyzer } from './analyzer';

import { typescriptLoader } from './loaders/script/typescriptLoader';
import { javascriptLoader } from './loaders/script/javascriptLoader';
import { vueLoader } from './loaders/script/vueLoader';
import { cssLoader } from './loaders/stylesheet/cssLoader';
import { getCurrentWorkspaceDir } from './runControl';

// 默认遍历目录最大深度
const MAX_DEP = 6;

const analyzer = fileAnalyzer([
  typescriptLoader,
  javascriptLoader,
  vueLoader,
  cssLoader
]);

export class TopologyPanel extends Panel {
  private panel: vscode.WebviewPanel;
  private static instance: TopologyPanel | undefined;

  private constructor(private context: vscode.ExtensionContext) {
    super();

    this.panel = vscode.window.createWebviewPanel(
      'dependency graph panel',
      'Dependency graph',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    this.panel.onDidDispose(() => {
      TopologyPanel.instance = undefined;
    }, null, this.context.subscriptions);

    this.panel.webview.onDidReceiveMessage((ev) => {
      const message = ev as { type: string, payload: any };
      if (message.type === 'topology') {
        const cwd = getCurrentWorkspaceDir();

        const configurations = vscode.workspace.getConfiguration('dependencyAnalyzer');
        const include = configurations.get<string>('include');
        const exclude = configurations.get<string>('exclude');

        const options: WalkerOptions = {
          include: include ? new RegExp(include, 'gim') : undefined,
          exclude: exclude ? new RegExp(exclude, 'gim') : undefined,
          dep: MAX_DEP
        };

        const analyze = async () => {
          const fileDescList = fileWalker(cwd, options);
          const fileRelationList = await analyzer(fileDescList, cwd);

          this.panel.webview.postMessage({ 
            type: 'topology-data', 
            payload: { nodes: fileDescList, links: fileRelationList } 
          });

          vscode.window.showInformationMessage('dependency analyze completed');
        };

        analyze();
      }

    }, null, this.context.subscriptions);
  }

  public static getInstance(context: vscode.ExtensionContext) {
    if (!TopologyPanel.instance) {
      TopologyPanel.instance = new TopologyPanel(context);
    }

    return TopologyPanel.instance;
  }

  public showGraphData() {
    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    this.panel.reveal(columnToShowIn);
    this.panel.webview.html = this.getWebViewContent(this.context, 'assets/topology.html');
  }
}