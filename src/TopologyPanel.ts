import * as vscode from 'vscode';
import { Panel } from './Panel';
import { GraphData } from './visualization';

export class TopologyPanel extends Panel {
  private panel: vscode.WebviewPanel;
  public static readonly viewType = 'topology panel';

  constructor(private context: vscode.ExtensionContext) {
    super();

    this.panel = vscode.window.createWebviewPanel(
      'dependency graph panel',
      'The graph of source file dependency relation',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );
  }

  public setGraphData(datasource: GraphData) {
    this.panel.webview.html = this.getWebViewContent(this.context, 'assets/topology.html');
    this.panel.webview.postMessage({ type: 'datasource', payload: datasource });
  }
}