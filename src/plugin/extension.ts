import * as vscode from 'vscode';

import { TopologyPanel } from './TopologyPanel';

import { fileWalker } from './fileWalker';
import { fileAnalyzer } from './analyzer';

import { scriptLoader } from './loaders/script/scriptLoader';

// 默认遍历目录最大深度
const MAX_DEP = 6;

export function activate(context: vscode.ExtensionContext) {
	const analyzer = fileAnalyzer([scriptLoader]);

	const disposable = vscode.commands.registerCommand('extension.dependency-analyze', async () => {
		const rootPath = vscode.workspace.workspaceFolders;
		if (!rootPath || rootPath.length < 1) {
			return;
		}

		const fileDescList = fileWalker(rootPath[0].uri.path, { ignore: /node_modules|^\..+/gim, dep: MAX_DEP });
		const fileRelationList = await analyzer(fileDescList);
		const panel = TopologyPanel.getInstance(context);

		console.log(fileDescList);
		console.log(fileRelationList);

		panel.setGraphData({ nodes: fileDescList, links: fileRelationList});

		vscode.window.showInformationMessage('dependency analyze completed');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
