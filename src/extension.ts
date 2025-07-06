// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "ai-cli" is now active!');

	let disposable = vscode.commands.registerCommand('ai-cli.start', () => {
		const panel = vscode.window.createWebviewPanel(
			'aiCli',
			'AI CLI',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'dist'))]
			}
		);

		const scriptPathOnDisk = vscode.Uri.file(
			path.join(context.extensionPath, 'dist', 'webview.js')
		);

		const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

		panel.webview.html = getWebviewContent(scriptUri);
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(scriptUri: vscode.Uri) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>AI CLI</title>
	</head>
	<body>
		<div id="root"></div>
		<script src="${scriptUri}"></script>
	</body>
	</html>`;
}

export function deactivate() {}
