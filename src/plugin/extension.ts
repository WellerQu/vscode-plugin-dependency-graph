import * as vscode from 'vscode';

import { TopologyPanel } from './TopologyPanel';

import { fileWalker } from './fileWalker';
import { fileAnalyzer } from './analyzer';

import { scriptLoader } from './loaders/script/scriptLoader';
import { cssLoader } from './loaders/stylesheet/cssLoader';

// 默认遍历目录最大深度
const MAX_DEP = 6;

export function activate(context: vscode.ExtensionContext) {
	const analyzer = fileAnalyzer([scriptLoader, cssLoader]);

	const disposable = vscode.commands.registerCommand('extension.dependency-analyze', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length < 1) {
			return;
		}

		const configurations = vscode.workspace.getConfiguration('dependencyAnalyzer');
		const ignores = configurations.get<string>('ignores');
		const options = {
			ignore: ignores ? new RegExp(ignores, 'gim') : undefined,
			dep: MAX_DEP
		};

		const fileDescList = fileWalker(workspaceFolders[0].uri.path, options);
		const fileRelationList = await analyzer(fileDescList);
		const panel = TopologyPanel.getInstance(context);

		panel.setGraphData({ nodes: fileDescList, links: fileRelationList});

		vscode.window.showInformationMessage('dependency analyze completed');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
