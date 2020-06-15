import * as vscode from 'vscode';
import { TopologyPanel } from './TopologyPanel';
import { fileWalker } from './fileWalker';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('extension.dependency-analyze', () => {
		const fileDescList = fileWalker(context.extensionPath, { ignore: /node_modules|^\..+/gim });
		const panel = TopologyPanel.getInstance(context);

		panel.setGraphData({ nodes: fileDescList, links: []});

		vscode.window.showInformationMessage('dependency analyze completed');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
