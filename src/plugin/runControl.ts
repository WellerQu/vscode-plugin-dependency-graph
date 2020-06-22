import * as fs from 'fs';
import * as vscode from 'vscode';

export function getCurrentWorkspaceDir() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length < 1) {
    throw new Error('No cwd');
  }

  const cwd = workspaceFolders[0].uri.path;
  return cwd;
}

export function controls() {
  const cwd = getCurrentWorkspaceDir();
  const rcFilePath = `${cwd}/.deprc`;
  if (!fs.existsSync(rcFilePath)) {
    return;
  }

  const rcContent = fs.readFileSync(rcFilePath, { encoding: 'utf-8' });
  const cfg = JSON.parse(rcContent);
}
