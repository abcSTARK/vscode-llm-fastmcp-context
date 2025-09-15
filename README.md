# FastMCP Documentation MCP Server (VS Code Extension)

> Seamlessly expose FastMCP documentation + project context to MCP‑enabled LLM agents in VS Code.

---

## ✅ What This Extension Does

This extension automatically registers a remote **FastMCP Documentation MCP Server** in both your **workspace** and **user** `mcp.json` so LLM agents (via MCP host extensions) can query FastMCP docs and (depending on your server implementation) project resources. It streamlines first‑run setup, provides a status bar indicator, and gives you quick access to the configuration file.

---

## ✨ Features

| Capability           | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| Auto Registration    | Adds the server to workspace `.vscode/mcp.json` and user-level `mcp.json`. |
| First‑Run Onboarding | Welcome page + optional automatic opening of the config file.              |
| Status Bar Indicator | Shows FastMCP + tool count (click to open user config).                    |
| One‑Click Command    | `FastMCP: Add FastMCP Context Server` registers / re-registers.            |
| Configurable         | Settings to disable auto-open and hide/move status bar item.               |
| Remote HTTP Server   | Uses your deployed `https://abcstark-server.fastmcp.app/mcp` endpoint.     |

---

## 🚀 Installation

1. Install from the [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=abcSTARK.vscode-llm-fastmcp-context) or load the VSIX.
2. Reload VS Code if prompted.
3. On first activation the welcome screen appears. Click **Add FastMCP Context Server** (or run the command below).
4. (Optional) Re-open the welcome any time via the Command Palette.

### Opening the Command Palette

Mac: `⌘⇧P` | Windows / Linux: `Ctrl+Shift+P`

Then type part of the command title (e.g. “FastMCP”) and press Enter.

```text
FastMCP: Add FastMCP Context Server
FastMCP: Show FastMCP Welcome
FastMCP: Open User MCP Configuration
FastMCP: [DEV] Reset FastMCP Onboarding State
```

---

## 🧠 Using the FastMCP Docs Tool in Chat

Once the server is registered, your MCP‑enabled chat UI exposes a FastMCP docs tool (exact label varies). If inline tool tags are supported you can reference it directly as `#fastmcp_docs `.

### Quick Examples

```text
Use #fastmcp_docs  and summarize FastMCP authentication.
Use #fastmcp_docs  to list getting-started topics.
Compare FastMCP auth vs generic MCP auth (use #fastmcp_docs ).
Explain required headers/tokens (use #fastmcp_docs ).
```

If the hashtag form doesn’t trigger a tool call, say: “Call the FastMCP docs tool and explain authentication.”

| Need         | Prompt Hint                                              |
| ------------ | -------------------------------------------------------- |
| Auth details | `Use #fastmcp_docs  and outline auth requirements.`      |
| Config help  | `Use #fastmcp_docs  and show an example mcp.json block.` |
| Topics list  | `Use #fastmcp_docs  and list available sections.`        |

Trouble? Re-run the Add Server command, then restart the server (the command does this automatically). More tips are in Troubleshooting below.

---

## 🛠 Commands (Palette Titles & IDs)

| Title (Palette)                      | Command ID                         | Purpose                                 |
| ------------------------------------ | ---------------------------------- | --------------------------------------- |
| Add FastMCP Context Server           | `fastmcpContext.addServer`         | Writes/updates `mcp.json` + (re)starts. |
| Show FastMCP Welcome                 | `fastmcpContext.showWelcome`       | Re-opens the onboarding webview.        |
| Open User MCP Configuration          | `fastmcpContext.openUserMcpConfig` | Opens the user-level `mcp.json`.        |
| [DEV] Reset FastMCP Onboarding State | `fastmcpContext.resetOnboarding`   | Clears first‑run flag (reload after).   |

---

## ⚙️ Settings

| Setting                                   | Default | Description                                               |
| ----------------------------------------- | ------- | --------------------------------------------------------- |
| `fastmcpContext.openConfigOnFirstInstall` | `true`  | Open the created/updated config file after first install. |
| `fastmcpContext.statusBar.show`           | `true`  | Show FastMCP status bar item.                             |
| `fastmcpContext.statusBar.alignmentRight` | `false` | Align status bar item to the right.                       |

---

## 📄 Example `mcp.json`

```json
{
  "servers": {
    "fastmcp-documentation-resource": {
      "url": "https://abcstark-server.fastmcp.app/mcp",
      "type": "http"
    }
  },
  "inputs": []
}
```

---

## 🔍 Verifying Installation

1. Open `.vscode/mcp.json` (workspace) and confirm the server entry exists.
2. Open the **MCP Output** panel: ensure you see `Connection state: Running` and tool discovery messages.
3. Click the status bar item (globe icon) to open the user-level config.

---

## 🧪 Troubleshooting

| Symptom                    | Fix                                                                         |
| -------------------------- | --------------------------------------------------------------------------- |
| Server stays in `Starting` | Check network access to the URL, test with `curl`.                          |
| Tool count not shown       | The MCP host may not support `mcp.servers.listTools` – this is best‑effort. |
| Config didn’t open         | Disable/enable setting or run `FastMCP: Open User MCP Configuration`.       |
| Duplicate entries          | Run the Add command again; it safely overwrites the URL entry.              |

---

## 📚 Resources

- [FastMCP Getting Started](https://gofastmcp.com/getting-started/welcome)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/docs/getting-started/intro)
- [GitHub Repository](https://github.com/abcSTARK/vscode-llm-fastmcp-context)

---

<!-- (Docs Tool section moved up for visibility) -->

## 🗒 Release Notes (Summary)

See full history in [CHANGELOG.md](./CHANGELOG.md).

### 1.3.0

- Added status bar item (tool count + quick config access).
- Added commands & settings (open user config, configurable auto-open & status bar alignment).

### 1.2.0

- Auto-open `mcp.json` after first registration.

### 1.1.0

- Documentation refinements; description updates.

### 1.0.0

- Initial onboarding workflow & welcome page.

---

**Author:** abcSTARK  
**License:** MIT

---

Enjoying it? Consider starring the repo to support future enhancements.
