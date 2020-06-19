import * as vscode from 'vscode';

import { TopologyPanel } from './TopologyPanel';

import { fileWalker, WalkerOptions } from './fileWalker';
import { fileAnalyzer } from './analyzer';

import { typescriptLoader } from './loaders/script/typescriptLoader';
import { javascriptLoader } from './loaders/script/javascriptLoader';
import { vueLoader } from './loaders/script/vueLoader';
import { cssLoader } from './loaders/stylesheet/cssLoader';

// 默认遍历目录最大深度
const MAX_DEP = 6;

export function activate(context: vscode.ExtensionContext) {
	const analyzer = fileAnalyzer([
		typescriptLoader,
		javascriptLoader,
		vueLoader,
		cssLoader
	]);

	const disposable = vscode.commands.registerCommand('extension.dependency-analyze', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length < 1) {
			return;
		}

		const cwd = workspaceFolders[0].uri.path;

		const configurations = vscode.workspace.getConfiguration('dependencyAnalyzer');
		const include = configurations.get<string>('include');
		const exclude = configurations.get<string>('exclude');

		const options: WalkerOptions = {
			include: include ? new RegExp(include, 'gim') : undefined,
			exclude: exclude ? new RegExp(exclude, 'gim') : undefined,
			dep: MAX_DEP
		};

		const fileDescList = fileWalker(cwd, options);
		const fileRelationList = await analyzer(fileDescList, cwd);

		const panel = TopologyPanel.getInstance(context);

		panel.setGraphData({ nodes: fileDescList, links: fileRelationList });

		vscode.window.showInformationMessage('dependency analyze completed');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
