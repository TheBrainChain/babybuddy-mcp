#!/usr/bin/env node

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BabyBuddyClient } from "./client.js";
import { resources, type ResourceConfig } from "./resources.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BABY_BUDDY_URL = process.env.BABY_BUDDY_URL;
const BABY_BUDDY_API_KEY = process.env.BABY_BUDDY_API_KEY;

if (!BABY_BUDDY_URL || !BABY_BUDDY_API_KEY) {
  console.error(
    "Error: BABY_BUDDY_URL and BABY_BUDDY_API_KEY environment variables are required.\n" +
      "  BABY_BUDDY_URL     - Base URL of your Baby Buddy instance (e.g. http://localhost:8000)\n" +
      "  BABY_BUDDY_API_KEY - API key from your Baby Buddy user settings"
  );
  process.exit(1);
}

const client = new BabyBuddyClient(BABY_BUDDY_URL, BABY_BUDDY_API_KEY);

const server = new McpServer({
  name: "babybuddy",
  version,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function text(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

function toParams(args: Record<string, unknown>): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined && value !== null) {
      params[key] = Array.isArray(value) ? value.join(",") : String(value);
    }
  }
  return params;
}

function cleanBody(args: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(args).filter(([, v]) => v !== undefined)
  );
}

// ---------------------------------------------------------------------------
// Generic resource registration
// ---------------------------------------------------------------------------

function registerResource(config: ResourceConfig) {
  const {
    name,
    singular,
    displayName,
    path,
    idField,
    description,
    createSchema,
    updateSchema,
    filterSchema,
  } = config;

  const idZod =
    idField === "slug"
      ? z.string().describe(`Slug identifier of the ${singular}`)
      : z.number().describe(`Unique ID of the ${singular}`);

  // -- List --
  server.registerTool(
    `list_${name}`,
    {
      description: `List ${displayName.toLowerCase()} from Baby Buddy. ${description}`,
      inputSchema: {
        limit: z
          .number()
          .optional()
          .describe("Number of results to return per page"),
        offset: z
          .number()
          .optional()
          .describe("Starting index for pagination"),
        ordering: z
          .string()
          .optional()
          .describe("Field to order by (prefix with - for descending)"),
        ...(filterSchema || {}),
      },
    },
    async (args) => {
      try {
        const result = await client.list(path, toParams(args));
        return text(result);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // -- Get --
  server.registerTool(
    `get_${singular}`,
    {
      description: `Get a single ${singular} by ${idField} from Baby Buddy`,
      inputSchema: { [idField]: idZod },
    },
    async (args) => {
      try {
        const id = (args as Record<string, unknown>)[idField];
        const result = await client.get(`${path}${id}/`);
        return text(result);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // -- Create --
  server.registerTool(
    `create_${singular}`,
    {
      description: `Create a new ${singular} in Baby Buddy`,
      inputSchema: createSchema,
    },
    async (args) => {
      try {
        const result = await client.create(path, cleanBody(args));
        return text(result);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // -- Update (PATCH) --
  server.registerTool(
    `update_${singular}`,
    {
      description: `Update an existing ${singular} in Baby Buddy (partial update)`,
      inputSchema: { [idField]: idZod, ...updateSchema },
    },
    async (args) => {
      try {
        const id = (args as Record<string, unknown>)[idField];
        const body = { ...args } as Record<string, unknown>;
        delete body[idField];
        const result = await client.update(`${path}${id}/`, cleanBody(body));
        return text(result);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  // -- Delete --
  server.registerTool(
    `delete_${singular}`,
    {
      description: `Delete a ${singular} from Baby Buddy`,
      inputSchema: { [idField]: idZod },
    },
    async (args) => {
      try {
        const id = (args as Record<string, unknown>)[idField];
        await client.remove(`${path}${id}/`);
        return text({ success: true, message: `Deleted ${singular} ${id}` });
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}

// ---------------------------------------------------------------------------
// Register all resources
// ---------------------------------------------------------------------------

for (const resource of resources) {
  registerResource(resource);
}

// ---------------------------------------------------------------------------
// Special tools (not standard CRUD)
// ---------------------------------------------------------------------------

// Timer restart
server.registerTool(
  "restart_timer",
  {
    description: "Restart an existing timer in Baby Buddy, resetting its start time to now",
    inputSchema: {
      id: z.number().describe("Unique ID of the timer to restart"),
    },
  },
  async ({ id }) => {
    try {
      const result = await client.update(`/api/timers/${id}/restart/`, {});
      return text(result);
    } catch (err) {
      return errorResult(err);
    }
  }
);

// Profile
server.registerTool(
  "get_profile",
  {
    description: "Get the current user's profile from Baby Buddy",
  },
  async () => {
    try {
      const result = await client.get("/api/profile");
      return text(result);
    } catch (err) {
      return errorResult(err);
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
