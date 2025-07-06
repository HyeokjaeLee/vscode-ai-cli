import * as vscode from 'vscode';
import { getNonce } from './utils';
import { spawn } from 'child_process';

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "runCommand": {
          const { tool, command } = data;
          const terminal = this._view?.webview;
          if (!terminal) {
            return;
          }

          let cmd = '';
          let args: string[] = [];

          if (tool === 'gemini') {
            cmd = 'gemini';
            args = [command];
          } else if (tool === 'claude') {
            cmd = 'claude';
            args = [command];
          }

          if (cmd) {
            const child = spawn(cmd, args, { shell: true });

            child.stdout.on('data', (data) => {
              terminal.postMessage({ type: 'commandOutput', output: data.toString() });
            });

            child.stderr.on('data', (data) => {
              terminal.postMessage({ type: 'commandOutput', output: data.toString() });
            });

            child.on('close', (code) => {
              terminal.postMessage({ type: 'commandEnd', code });
            });

            child.on('error', (err) => {
              terminal.postMessage({ type: 'commandOutput', output: `Error: ${err.message}\r\n` });
              terminal.postMessage({ type: 'commandEnd', code: 1 });
            });
          } else {
            terminal.postMessage({ type: 'commandOutput', output: `Unknown tool: ${tool}\r\n` });
            terminal.postMessage({ type: 'commandEnd', code: 1 });
          }
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js")
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https: and data: sources.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script nonce="${nonce}">
            const tsVscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
