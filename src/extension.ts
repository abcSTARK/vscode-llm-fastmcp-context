import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as os from 'os';
import { getWelcomeHtml } from './welcomeHtml';

const SERVER_URL = 'https://abcstark-server.fastmcp.app/mcp';
const SERVER_KEY = 'fastmcp-documentation-resource';
const SERVER_TYPE = 'http';

let statusBarItem: vscode.StatusBarItem | undefined;

async function openUserMcpConfigExplicit() {
  const userPath = getUserMcpJsonPath();
  if (!userPath || !fs.existsSync(userPath)) {
    vscode.window.showWarningMessage(
      'User-level mcp.json not found yet. Add a server first.'
    );
    return;
  }
  const doc = await vscode.workspace.openTextDocument(userPath);
  await vscode.window.showTextDocument(doc, { preview: false });
}

async function updateStatusBar(toolsCount?: number) {
  const cfg = vscode.workspace.getConfiguration();
  const show = cfg.get<boolean>('fastmcpContext.statusBar.show', true);
  if (!show) {
    if (statusBarItem) {
      statusBarItem.hide();
    }
    return;
  }
  if (!statusBarItem) {
    const alignRight = cfg.get<boolean>(
      'fastmcpContext.statusBar.alignmentRight',
      false
    );
    statusBarItem = vscode.window.createStatusBarItem(
      alignRight
        ? vscode.StatusBarAlignment.Right
        : vscode.StatusBarAlignment.Left,
      100
    );
    statusBarItem.command = 'fastmcpContext.openUserMcpConfig';
  }
  const base = 'FastMCP';
  let text = `$(globe) ${base}`;
  if (typeof toolsCount === 'number') {
    text += `: ${toolsCount} tool${toolsCount === 1 ? '' : 's'}`;
  }
  statusBarItem.text = text;
  statusBarItem.tooltip = 'Open user mcp.json';
  statusBarItem.show();
}

function getMcpJsonPath(workspaceFolder: vscode.WorkspaceFolder): string {
  return path.join(workspaceFolder.uri.fsPath, '.vscode', 'mcp.json');
}

function getUserMcpJsonPath(): string | undefined {
  const homedir = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(
      homedir,
      'Library',
      'Application Support',
      'Code',
      'User',
      'mcp.json'
    );
  } else if (process.platform === 'win32') {
    return path.join(homedir, 'AppData', 'Roaming', 'Code', 'User', 'mcp.json');
  } else {
    return path.join(homedir, '.config', 'Code', 'User', 'mcp.json');
  }
}

function readMcpJson(filePath: string): any {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  return {};
}

function writeMcpJson(filePath: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}

function showWelcomeScreen(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'fastmcpWelcome',
    'Welcome to FastMCP Context Installer',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  // Get logo URI for the webview
  const logoUri = panel.webview
    .asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png')
    )
    .toString();
  // Load HTML from external file for maintainability
  panel.webview.html = getWelcomeHtml(logoUri);

  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case 'addServer':
          vscode.commands.executeCommand('fastmcpContext.addServer');
          break;
        case 'openUserConfig':
          vscode.commands.executeCommand('fastmcpContext.openUserMcpConfig');
          break;
        case 'openReadme':
          try {
            const uri = vscode.Uri.joinPath(context.extensionUri, 'README.md');
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: false });
          } catch {
            // ignore
          }
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

async function addFastMcpServer() {
  let didAdd = false;
  let openedPath: string | undefined;
  // --- Add to workspace level ---
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const folder = workspaceFolders[0];
    const mcpJsonPath = getMcpJsonPath(folder);
    let mcpConfig = readMcpJson(mcpJsonPath);

    if (!mcpConfig.servers) mcpConfig.servers = {};
    if (!Array.isArray(mcpConfig.inputs)) mcpConfig.inputs = [];

    if (
      !mcpConfig.servers[SERVER_KEY] ||
      mcpConfig.servers[SERVER_KEY].url !== SERVER_URL
    ) {
      const vscodeDir = path.join(folder.uri.fsPath, '.vscode');
      if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir);

      mcpConfig.servers[SERVER_KEY] = { url: SERVER_URL, type: SERVER_TYPE };
      writeMcpJson(mcpJsonPath, mcpConfig);
      didAdd = true;
      openedPath = mcpJsonPath;
    }
  }

  // --- Add to user level ---
  const userMcpJsonPath = getUserMcpJsonPath();
  if (userMcpJsonPath) {
    let userMcpConfig = readMcpJson(userMcpJsonPath);

    if (!userMcpConfig.servers) userMcpConfig.servers = {};
    if (!Array.isArray(userMcpConfig.inputs)) userMcpConfig.inputs = [];

    if (
      !userMcpConfig.servers[SERVER_KEY] ||
      userMcpConfig.servers[SERVER_KEY].url !== SERVER_URL
    ) {
      userMcpConfig.servers[SERVER_KEY] = {
        url: SERVER_URL,
        type: SERVER_TYPE,
      };
      writeMcpJson(userMcpJsonPath, userMcpConfig);
      didAdd = true;
      // only set openedPath if workspace file not created
      if (!openedPath) {
        openedPath = userMcpJsonPath;
      }
    }
  }

  // Try starting/restarting the server
  try {
    const startResult = await vscode.commands.executeCommand(
      'mcp.servers.start',
      SERVER_KEY
    );
    if (startResult === false || startResult === 'alreadyRunning') {
      await vscode.commands.executeCommand('mcp.servers.restart', SERVER_KEY);
    }
  } catch (err) {
    // ignore
  }

  // Always show a notification after setup
  if (didAdd) {
    vscode.window.showInformationMessage(
      'FastMCP context server added to your workspace and global settings!'
    );
  } else {
    vscode.window.showInformationMessage(
      'FastMCP context server was already present in your workspace and global settings.'
    );
  }
  // Open the MCP configuration file if newly added
  if (didAdd && openedPath) {
    const cfg = vscode.workspace.getConfiguration();
    if (cfg.get<boolean>('fastmcpContext.openConfigOnFirstInstall', true)) {
      try {
        const doc = await vscode.workspace.openTextDocument(openedPath);
        await vscode.window.showTextDocument(doc, { preview: false });
      } catch (e) {
        // ignore open errors
      }
    }
  }
  return didAdd;
}

export async function activate(context: vscode.ExtensionContext) {
  // Temporary: Add a command to reset onboarding global state
  const resetDisposable = vscode.commands.registerCommand(
    'fastmcpContext.resetOnboarding',
    async () => {
      await context.globalState.update('fastmcp.didRunSetup', false);
      vscode.window.showInformationMessage(
        '[FastMCP] Onboarding state reset. Reload window to test onboarding again.'
      );
    }
  );
  context.subscriptions.push(resetDisposable);
  // Debug: Always show activation notification
  const didRun = context.globalState.get<boolean>('fastmcp.didRunSetup');
  vscode.window.showInformationMessage(
    `[FastMCP] Extension activated. didRunSetup=${didRun}`
  );

  // Register commands
  const disposable = vscode.commands.registerCommand(
    'fastmcpContext.addServer',
    async () => {
      await addFastMcpServer();
    }
  );
  context.subscriptions.push(disposable);

  const openUserConfigCmd = vscode.commands.registerCommand(
    'fastmcpContext.openUserMcpConfig',
    async () => {
      await openUserMcpConfigExplicit();
    }
  );
  context.subscriptions.push(openUserConfigCmd);

  const showWelcomeCmd = vscode.commands.registerCommand(
    'fastmcpContext.showWelcome',
    async () => {
      showWelcomeScreen(context);
    }
  );
  context.subscriptions.push(showWelcomeCmd);

  // 🔑 Show welcome and run setup only after install (only once)
  if (!didRun) {
    setTimeout(() => showWelcomeScreen(context), 500);
    await addFastMcpServer();
    vscode.window.showInformationMessage(
      'FastMCP Context Server setup complete! You can now use LLM context assistance.',
      'OK'
    );
    await context.globalState.update('fastmcp.didRunSetup', true);
  }

  // Initialize status bar
  updateStatusBar();

  // Attempt to list tools if the MCP host exposes a command (best-effort)
  try {
    const tools: any = await vscode.commands.executeCommand(
      'mcp.servers.listTools',
      SERVER_KEY
    );
    if (Array.isArray(tools)) {
      updateStatusBar(tools.length);
    }
  } catch {
    // silently ignore if command unsupported
  }

  // React to configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration('fastmcpContext.statusBar.show') ||
        e.affectsConfiguration('fastmcpContext.statusBar.alignmentRight')
      ) {
        if (statusBarItem) {
          statusBarItem.dispose();
          statusBarItem = undefined;
        }
        updateStatusBar();
      }
    })
  );
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = undefined;
  }
}
