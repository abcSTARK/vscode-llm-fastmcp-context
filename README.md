# FastMCP Context Installer for VS Code

> Real-time context and Python logic access for LLMs via FastMCP server

---

## Overview

This extension integrates the [FastMCP](https://gofastmcp.com/getting-started/welcome) (Model Context Protocol) server with VS Code, enabling your AI coding agent to access the latest Python logic, project files, and workspace knowledge for improved code assistance.

---

## Features

- **Real-time Context Access:** LLMs get up-to-date project files and logic from your workspace.
- **Automatic FastMCP Server Registration:** Instantly adds FastMCP to both workspace and global `mcp.json`.
- **Easy Setup:** One-click onboarding via welcome screen or Command Palette.
- **Seamless VS Code Integration:** Works with MCP-enabled LLM agents and tools.

---

## Installation

1. Install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=abcSTARK.vscode-llm-fastmcp-context) or via VSIX.
2. Reload VS Code if prompted.
3. On first activation, follow the welcome screen or run the command:

   ```
   FastMCP: Add FastMCP Context Server
   ```

---

## Usage

1. **Add Server:** Use the welcome screen or Command Palette to add the FastMCP server.
2. **Verify Config:**
   - Workspace: `.vscode/mcp.json`
   - Global: `mcp.json` in your VS Code user settings folder
3. **Restart Server:** Use the MCP panel in the Activity Bar if needed.

---

## Example `mcp.json`

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

## Resources

- [FastMCP Getting Started](https://gofastmcp.com/getting-started/welcome)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/docs/getting-started/intro)
- [GitHub: abcSTARK/vscode-llm-fastmcp-context](https://github.com/abcSTARK/vscode-llm-fastmcp-context)

---

**Author:** abcSTARK

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
