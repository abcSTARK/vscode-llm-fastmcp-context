import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as os from 'os';
import { getWelcomeHtml } from './welcomeHtml';

const SERVER_URL = 'https://abcstark-server.fastmcp.app/mcp';
const SERVER_KEY = 'fastmcp-documentation-resource';
const SERVER_TYPE = 'http';

function getMcpJsonPath(workspaceFolder: vscode.WorkspaceFolder): string {
    return path.join(workspaceFolder.uri.fsPath, '.vscode', 'mcp.json');
}

function getUserMcpJsonPath(): string | undefined {
    const homedir = os.homedir();
    if (process.platform === 'darwin') {
        return path.join(homedir, 'Library', 'Application Support', 'Code', 'User', 'mcp.json');
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
    const logoUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png')
    ).toString();
    // Load HTML from external file for maintainability
    panel.webview.html = getWelcomeHtml(logoUri);

    panel.webview.onDidReceiveMessage(
        message => {
            if (message.command === 'addServer') {
                vscode.commands.executeCommand('fastmcpContext.addServer');
            }
        },
        undefined,
        context.subscriptions
    );
}



async function addFastMcpServer() {
    let didAdd = false;
    // --- Add to workspace level ---
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const folder = workspaceFolders[0];
        const mcpJsonPath = getMcpJsonPath(folder);
        let mcpConfig = readMcpJson(mcpJsonPath);

        if (!mcpConfig.servers) mcpConfig.servers = {};
        if (!Array.isArray(mcpConfig.inputs)) mcpConfig.inputs = [];

        if (!mcpConfig.servers[SERVER_KEY] || mcpConfig.servers[SERVER_KEY].url !== SERVER_URL) {
            const vscodeDir = path.join(folder.uri.fsPath, '.vscode');
            if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir);

            mcpConfig.servers[SERVER_KEY] = { url: SERVER_URL, type: SERVER_TYPE };
            writeMcpJson(mcpJsonPath, mcpConfig);
            didAdd = true;
        }
    }

    // --- Add to user level ---
    const userMcpJsonPath = getUserMcpJsonPath();
    if (userMcpJsonPath) {
        let userMcpConfig = readMcpJson(userMcpJsonPath);

        if (!userMcpConfig.servers) userMcpConfig.servers = {};
        if (!Array.isArray(userMcpConfig.inputs)) userMcpConfig.inputs = [];

        if (!userMcpConfig.servers[SERVER_KEY] || userMcpConfig.servers[SERVER_KEY].url !== SERVER_URL) {
            userMcpConfig.servers[SERVER_KEY] = { url: SERVER_URL, type: SERVER_TYPE };
            writeMcpJson(userMcpJsonPath, userMcpConfig);
            didAdd = true;
        }
    }

    // Try starting/restarting the server
    try {
        const startResult = await vscode.commands.executeCommand('mcp.servers.start', SERVER_KEY);
        if (startResult === false || startResult === 'alreadyRunning') {
            await vscode.commands.executeCommand('mcp.servers.restart', SERVER_KEY);
        }
    } catch (err) {
        // ignore
    }

    // Always show a notification after setup
    if (didAdd) {
        vscode.window.showInformationMessage('FastMCP context server added to your workspace and global settings!');
    } else {
        vscode.window.showInformationMessage('FastMCP context server was already present in your workspace and global settings.');
    }
    return didAdd;
}

export async function activate(context: vscode.ExtensionContext) {
    // Temporary: Add a command to reset onboarding global state
    const resetDisposable = vscode.commands.registerCommand('fastmcpContext.resetOnboarding', async () => {
        await context.globalState.update('fastmcp.didRunSetup', false);
        vscode.window.showInformationMessage('[FastMCP] Onboarding state reset. Reload window to test onboarding again.');
    });
    context.subscriptions.push(resetDisposable);
    // Debug: Always show activation notification
    const didRun = context.globalState.get<boolean>('fastmcp.didRunSetup');
    vscode.window.showInformationMessage(`[FastMCP] Extension activated. didRunSetup=${didRun}`);

    // Register command
    const disposable = vscode.commands.registerCommand('fastmcpContext.addServer', async () => {
        await addFastMcpServer();
    });
    context.subscriptions.push(disposable);

    // 🔑 Show welcome and run setup only after install (only once)
    if (!didRun) {
        setTimeout(() => showWelcomeScreen(context), 500);
        await addFastMcpServer();
        vscode.window.showInformationMessage('FastMCP Context Server setup complete! You can now use LLM context assistance.', 'OK');
        await context.globalState.update('fastmcp.didRunSetup', true);
    }
}

export function deactivate() {}
