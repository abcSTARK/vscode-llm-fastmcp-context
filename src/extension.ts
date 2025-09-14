import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
    // Pass the webview and extensionPath to the HTML generator
    panel.webview.html = getWelcomeHtml(panel.webview, context.extensionUri);

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

function getWelcomeHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const logoUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'icon.png')
    );
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FastMCP Context Installer</title>
        <style>
            body { font-family: var(--vscode-font-family, 'Segoe UI', Arial, sans-serif); margin: 0; padding: 0; }
            .center { max-width: 600px; margin: 40px auto; padding: 0 24px; }
            .logo { width: 48px; height: 48px; display: block; margin: 32px auto 16px auto; }
            h1 { text-align: center; font-size: 1.6em; font-weight: 600; margin: 0 0 12px 0; }
            .desc, .author, .links { text-align: center; margin-bottom: 18px; }
            .links a { color: var(--vscode-textLink-foreground, #3794ff); text-decoration: none; margin: 0 8px; }
            .links a:hover { text-decoration: underline; }
            ul { margin: 18px 0 18px 0; padding-left: 20px; }
            .actions { text-align: center; margin: 28px 0 0 0; }
        </style>
    </head>
    <body>
        <div class="center">
            <img src="${logoUri}" class="logo" alt="FastMCP Logo" />
            <h1>FastMCP Context Installer</h1>
            <div class="desc">
                Add the <b>fastmcp-documentation-resource</b> server to your workspace and global settings for LLM context assistance.<br>
                <span style="font-size:0.98em;">FastMCP is a blazing-fast, open-source <a href="https://gofastmcp.com/getting-started/welcome" target="_blank">MCP server</a> for LLMs.</span>
            </div>
            <ul>
                <li>Click <b>Add FastMCP Context Server</b> to set up automatically.</li>
                <li>Check <b>.vscode/mcp.json</b> (workspace) and <b>mcp.json</b> (global) for config.</li>
                <li>Restart the server from the MCP panel if needed.</li>
                <li>Server Key: <code>fastmcp-documentation-resource</code></li>
                <li>Server URL: <code>https://abcstark-server.fastmcp.app/mcp</code></li>
            </ul>
            <div class="actions">
                <button id="addServerBtn">Add FastMCP Context Server</button>
            </div>
            <div class="links">
                <a href="https://gofastmcp.com/getting-started/welcome" target="_blank">FastMCP Docs</a> |
                <a href="https://modelcontextprotocol.io/docs/getting-started/intro" target="_blank">MCP Protocol</a> |
                <a href="https://github.com/abcSTARK/vscode-llm-fastmcp-context" target="_blank">GitHub</a>
            </div>
            <div class="author">
                Author: abcSTARK
            </div>
        </div>
        <script>
            document.getElementById('addServerBtn').addEventListener('click', () => {
                window.acquireVsCodeApi().postMessage({ command: 'addServer' });
            });
        </script>
    </body>
    </html>
    `;
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
