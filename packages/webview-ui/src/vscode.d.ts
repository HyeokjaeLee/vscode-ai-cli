import * as vscode from 'vscode';

declare global {
  interface Window {
    acquireVsCodeApi: () => vscode.WebviewApi<unknown>;
  }
}