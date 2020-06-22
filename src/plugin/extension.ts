import * as vscode from 'vscode';

import { TopologyPanel } from './TopologyPanel';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.dependency-analyze', async () => {
		const panel = TopologyPanel.getInstance(context);
		panel.showGraphData();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
