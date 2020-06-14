import * as vscode from 'vscode';
import { Panel } from './Panel';
import { FileDesc } from './fileWalker';

export class TopologyPanel extends Panel {
  private panel: vscode.WebviewPanel;
  private static instance: TopologyPanel | undefined;
  public static readonly viewType = 'topology panel';

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
  }

  public static getInstance(context: vscode.ExtensionContext)  {
    if (!TopologyPanel.instance) {
      TopologyPanel.instance = new TopologyPanel(context);
    }

    return TopologyPanel.instance;
  }

  private ready() {
    return new Promise((resolve) => {
      this.panel.webview.onDidReceiveMessage((ev) => {
        const message = ev as { type: string, payload: any };
        if (message.type === 'notify' && message.payload === 'ready') {
          resolve();
        }
      }, null, this.context.subscriptions);
    });
  }

  public setGraphData(datasource: { nodes: FileDesc[], links: any[] }) {
    this.panel.webview.html = this.getWebViewContent(this.context, 'assets/topology.html');
    this.ready().then(() => {
      this.panel.webview.postMessage({ type: 'data', payload: datasource });
    });
  }
}