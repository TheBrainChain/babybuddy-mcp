# Baby Buddy MCP Server

An MCP (Model Context Protocol) server that provides full access to the [Baby Buddy](https://github.com/babybuddy/babybuddy) API. Track and manage baby care data including feedings, diaper changes, sleep, tummy time, pumping, temperature, growth measurements, and more.

## Features

- Full CRUD operations for all Baby Buddy resources
- 72 tools covering the complete Baby Buddy API
- Timer management with start/restart support
- Filtering, pagination, and ordering on all list operations
- Tag support across all record types

## Prerequisites

- Node.js 18+
- A running [Baby Buddy](https://github.com/babybuddy/babybuddy) instance
- An API key from Baby Buddy (Settings > API Key)

## Installation

### Claude Desktop (Recommended)

Install directly in Claude Desktop using the `.mcpb` package:

1. Download the latest `babybuddy-mcp-server.mcpb` from [Releases](https://github.com/babybuddy/babybuddy-mcp-server/releases)
2. Open Claude Desktop and go to **Settings > Extensions**
3. Drag the `.mcpb` file into the Extensions panel, or click **Install from file** and select it
4. When prompted, enter your:
   - **Baby Buddy URL** — the base URL of your Baby Buddy instance (e.g. `http://localhost:8000`)
   - **Baby Buddy API Key** — found in Baby Buddy under **Settings > API Key**

The server will connect automatically. Your API key is stored securely in the OS keychain.

### npm

```bash
npm install -g babybuddy-mcp-server
```

### From source

```bash
git clone https://github.com/babybuddy/babybuddy-mcp-server.git
cd babybuddy-mcp-server
npm install
npm run build
```

## Configuration

The server requires two environment variables:

| Variable | Description | Example |
|---|---|---|
| `BABY_BUDDY_URL` | Base URL of your Baby Buddy instance | `http://localhost:8000` |
| `BABY_BUDDY_API_KEY` | API key from Baby Buddy user settings | `your-api-key-here` |

> If you installed via the `.mcpb` package in Claude Desktop, these are configured automatically through the setup prompts. The manual configuration below is only needed for npm or source installs.

### Claude Desktop (manual)

Add to your Claude Desktop config file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "babybuddy": {
      "command": "babybuddy-mcp-server",
      "env": {
        "BABY_BUDDY_URL": "http://localhost:8000",
        "BABY_BUDDY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

If installed from source, use the full path:

```json
{
  "mcpServers": {
    "babybuddy": {
      "command": "node",
      "args": ["/path/to/babybuddy-mcp-server/dist/index.js"],
      "env": {
        "BABY_BUDDY_URL": "http://localhost:8000",
        "BABY_BUDDY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add babybuddy -- env BABY_BUDDY_URL=http://localhost:8000 BABY_BUDDY_API_KEY=your-api-key-here babybuddy-mcp-server
```

## Available Tools

### Children
- `list_children` - List all children
- `get_child` - Get a child by slug
- `create_child` - Add a new child
- `update_child` - Update child details
- `delete_child` - Remove a child

### Feedings
- `list_feedings` - List feeding records
- `get_feeding` - Get a specific feeding
- `create_feeding` - Log a feeding (breast milk, formula, solid food)
- `update_feeding` - Update a feeding record
- `delete_feeding` - Delete a feeding record

### Diaper Changes
- `list_changes` - List diaper changes
- `get_diaper_change` - Get a specific change
- `create_diaper_change` - Log a diaper change
- `update_diaper_change` - Update a change record
- `delete_diaper_change` - Delete a change record

### Sleep
- `list_sleep` - List sleep records
- `get_sleep` - Get a specific sleep record
- `create_sleep` - Log a sleep session
- `update_sleep` - Update a sleep record
- `delete_sleep` - Delete a sleep record

### Tummy Time
- `list_tummy_times` - List tummy time sessions
- `get_tummy_time` - Get a specific session
- `create_tummy_time` - Log tummy time
- `update_tummy_time` - Update a session
- `delete_tummy_time` - Delete a session

### Pumping
- `list_pumping` - List pumping sessions
- `get_pumping` - Get a specific session
- `create_pumping` - Log a pumping session
- `update_pumping` - Update a session
- `delete_pumping` - Delete a session

### Notes
- `list_notes` / `get_note` / `create_note` / `update_note` / `delete_note`

### Temperature
- `list_temperature` / `get_temperature` / `create_temperature` / `update_temperature` / `delete_temperature`

### Weight
- `list_weight` / `get_weight` / `create_weight` / `update_weight` / `delete_weight`

### Height
- `list_height` / `get_height` / `create_height` / `update_height` / `delete_height`

### Head Circumference
- `list_head_circumference` / `get_head_circumference` / `create_head_circumference` / `update_head_circumference` / `delete_head_circumference`

### BMI
- `list_bmi` / `get_bmi` / `create_bmi` / `update_bmi` / `delete_bmi`

### Tags
- `list_tags` / `get_tag` / `create_tag` / `update_tag` / `delete_tag`

### Timers
- `list_timers` / `get_timer` / `create_timer` / `update_timer` / `delete_timer`
- `restart_timer` - Restart a timer (resets start time to now)

### Profile
- `get_profile` - Get the current user's profile

## License

MIT
