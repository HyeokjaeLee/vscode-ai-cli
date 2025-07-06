// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "ai-cli-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ai-cli.refresh", () => {
      sidebarProvider.resolveWebviewView(sidebarProvider._view!); // Use non-null assertion for simplicity, consider proper null handling
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
