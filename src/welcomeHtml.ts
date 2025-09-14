// This file contains the HTML content for the FastMCP Context Installer welcome page.
// Update this file to change the welcome screen content. It is loaded by the extension at runtime.

export function getWelcomeHtml(logoUri: string): string {
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
            pre, code { background: var(--vscode-editor-background, #f3f3f3); color: var(--vscode-editor-foreground, #333); font-size: 0.98em; border-radius: 4px; padding: 2px 4px; }
            pre { padding: 12px; overflow-x: auto; }
            hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
        </style>
    </head>
    <body>
        <div class="center">
            <img src="${logoUri}" class="logo" alt="FastMCP Logo" />
            <h1>FastMCP Context Installer for VS Code</h1>
            <div class="desc">
                <b>Real-time context and Python logic access for LLMs via FastMCP server</b>
            </div>
            <hr />
            <div class="desc">
                This extension integrates the <a href="https://gofastmcp.com/getting-started/welcome" target="_blank">FastMCP</a> (Model Context Protocol) server with VS Code, enabling your AI coding agent to access the latest Python logic, project files, and workspace knowledge for improved code assistance.
            </div>
            <hr />
            <div>
                <b>Features</b>
                <ul>
                    <li><b>Real-time Context Access:</b> LLMs get up-to-date project files and logic from your workspace.</li>
                    <li><b>Automatic FastMCP Server Registration:</b> Instantly adds FastMCP to both workspace and global <code>mcp.json</code>.</li>
                    <li><b>Easy Setup:</b> One-click onboarding via welcome screen or Command Palette.</li>
                    <li><b>Seamless VS Code Integration:</b> Works with MCP-enabled LLM agents and tools.</li>
                </ul>
            </div>
            <hr />
            <div>
                <b>Installation</b>
                <ol>
                    <li>Install from the <a href="https://marketplace.visualstudio.com/items?itemName=abcSTARK.vscode-llm-fastmcp-context" target="_blank">Marketplace</a> or via VSIX.</li>
                    <li>Reload VS Code if prompted.</li>
                    <li>On first activation, follow the welcome screen or run the command:<br>
                        <code>FastMCP: Add FastMCP Context Server</code>
                    </li>
                </ol>
            </div>
            <hr />
            <div>
                <b>Usage</b>
                <ol>
                    <li><b>Add Server:</b> Use the welcome screen or Command Palette to add the FastMCP server.</li>
                    <li><b>Verify Config:</b><br>
                        Workspace: <code>.vscode/mcp.json</code><br>
                        Global: <code>mcp.json</code> in your VS Code user settings folder
                    </li>
                    <li><b>Restart Server:</b> Use the MCP panel in the Activity Bar if needed.</li>
                </ol>
            </div>
            <hr />
            <div>
                <b>Example <code>mcp.json</code></b>
                <pre>{
  "servers": {
    "fastmcp-documentation-resource": {
      "url": "https://abcstark-server.fastmcp.app/mcp",
      "type": "http"
    }
  },
  "inputs": []
}</pre>
            </div>
            <hr />
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
