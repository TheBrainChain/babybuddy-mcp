import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ZodShape = Record<string, z.ZodTypeAny>;

export interface ResourceConfig {
  /** Plural name used for list tool, e.g. "children" */
  name: string;
  /** Singular name used for get/create/update/delete tools, e.g. "child" */
  singular: string;
  /** Human-readable name, e.g. "Children" */
  displayName: string;
  /** API path, e.g. "/api/children/" */
  path: string;
  /** ID field: "id" (number) or "slug" (string) */
  idField: "id" | "slug";
  /** Short description for the list tool */
  description: string;
  /** Zod schema for create operation (required + optional fields) */
  createSchema: ZodShape;
  /** Zod schema for update operation (all optional) */
  updateSchema: ZodShape;
  /** Optional extra filter params for the list operation */
  filterSchema?: ZodShape;
}

// ---------------------------------------------------------------------------
// Resource definitions
// ---------------------------------------------------------------------------

export const resources: ResourceConfig[] = [
  // -- Children --
  {
    name: "children",
    singular: "child",
    displayName: "Children",
    path: "/api/children/",
    idField: "slug",
    description:
      "Returns child profiles with name, birth date, and slug identifier.",
    createSchema: {
      first_name: z.string().describe("Child's first name"),
      last_name: z.string().optional().describe("Child's last name"),
      birth_date: z.string().describe("Birth date in YYYY-MM-DD format"),
      birth_time: z
        .string()
        .optional()
        .describe("Birth time in HH:MM:SS format"),
    },
    updateSchema: {
      first_name: z.string().optional().describe("Child's first name"),
      last_name: z.string().optional().describe("Child's last name"),
      birth_date: z
        .string()
        .optional()
        .describe("Birth date in YYYY-MM-DD format"),
      birth_time: z
        .string()
        .optional()
        .describe("Birth time in HH:MM:SS format"),
    },
    filterSchema: {
      id: z.number().optional().describe("Filter by child ID"),
      first_name: z.string().optional().describe("Filter by first name"),
      last_name: z.string().optional().describe("Filter by last name"),
      slug: z.string().optional().describe("Filter by slug"),
      birth_date: z.string().optional().describe("Filter by birth date"),
      birth_time: z.string().optional().describe("Filter by birth time"),
    },
  },

  // -- Feedings --
  {
    name: "feedings",
    singular: "feeding",
    displayName: "Feedings",
    path: "/api/feedings/",
    idField: "id",
    description:
      "Track feeding sessions including type, method, duration, and amount.",
    createSchema: {
      child: z
        .number()
        .optional()
        .describe("Child ID (required unless timer is provided)"),
      start: z
        .string()
        .optional()
        .describe(
          "Start date-time in ISO 8601 format (required unless timer is provided)"
        ),
      end: z
        .string()
        .optional()
        .describe(
          "End date-time in ISO 8601 format (required unless timer is provided)"
        ),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      type: z
        .enum(["breast milk", "formula", "fortified breast milk", "solid food"])
        .describe("Type of feeding"),
      method: z
        .enum([
          "bottle",
          "left breast",
          "right breast",
          "both breasts",
          "parent fed",
          "self fed",
        ])
        .describe("Feeding method"),
      amount: z.number().optional().describe("Amount consumed"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      start: z
        .string()
        .optional()
        .describe("Start date-time in ISO 8601 format"),
      end: z.string().optional().describe("End date-time in ISO 8601 format"),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      type: z
        .enum(["breast milk", "formula", "fortified breast milk", "solid food"])
        .optional()
        .describe("Type of feeding"),
      method: z
        .enum([
          "bottle",
          "left breast",
          "right breast",
          "both breasts",
          "parent fed",
          "self fed",
        ])
        .optional()
        .describe("Feeding method"),
      amount: z.number().optional().describe("Amount consumed"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      start: z.string().optional().describe("Filter by start date-time"),
      start_min: z
        .string()
        .optional()
        .describe("Filter by minimum start date-time"),
      start_max: z
        .string()
        .optional()
        .describe("Filter by maximum start date-time"),
      end: z.string().optional().describe("Filter by end date-time"),
      end_min: z
        .string()
        .optional()
        .describe("Filter by minimum end date-time"),
      end_max: z
        .string()
        .optional()
        .describe("Filter by maximum end date-time"),
      type: z
        .enum(["breast milk", "formula", "fortified breast milk", "solid food"])
        .optional()
        .describe("Filter by feeding type"),
      method: z
        .enum([
          "bottle",
          "left breast",
          "right breast",
          "both breasts",
          "parent fed",
          "self fed",
        ])
        .optional()
        .describe("Filter by feeding method"),
      tags: z.string().optional().describe("Filter by tag name"),
    },
  },

  // -- Diaper Changes --
  {
    name: "changes",
    singular: "diaper_change",
    displayName: "Diaper changes",
    path: "/api/changes/",
    idField: "id",
    description:
      "Track diaper changes including wet/solid status, color, and amount.",
    createSchema: {
      child: z.number().describe("Child ID"),
      time: z
        .string()
        .optional()
        .describe("Date-time of change in ISO 8601 format"),
      wet: z.boolean().describe("Whether the diaper was wet"),
      solid: z.boolean().describe("Whether the diaper had solid waste"),
      color: z
        .enum(["black", "brown", "green", "yellow"])
        .optional()
        .describe("Color of solid waste"),
      amount: z.number().optional().describe("Amount"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      time: z
        .string()
        .optional()
        .describe("Date-time of change in ISO 8601 format"),
      wet: z.boolean().optional().describe("Whether the diaper was wet"),
      solid: z
        .boolean()
        .optional()
        .describe("Whether the diaper had solid waste"),
      color: z
        .enum(["black", "brown", "green", "yellow"])
        .optional()
        .describe("Color of solid waste"),
      amount: z.number().optional().describe("Amount"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      amount: z.number().optional().describe("Filter by amount"),
      date: z.string().optional().describe("Filter by date-time"),
      date_min: z.string().optional().describe("Filter by minimum date-time"),
      date_max: z.string().optional().describe("Filter by maximum date-time"),
      wet: z.boolean().optional().describe("Filter by wet status"),
      solid: z.boolean().optional().describe("Filter by solid status"),
      color: z
        .enum(["black", "brown", "green", "yellow"])
        .optional()
        .describe("Filter by color"),
      tags: z.string().optional().describe("Filter by tag name"),
    },
  },

  // -- Sleep --
  {
    name: "sleep",
    singular: "sleep",
    displayName: "Sleep records",
    path: "/api/sleep/",
    idField: "id",
    description:
      "Track sleep sessions including start/end times and nap status.",
    createSchema: {
      child: z
        .number()
        .optional()
        .describe("Child ID (required unless timer is provided)"),
      start: z
        .string()
        .optional()
        .describe(
          "Start date-time in ISO 8601 format (required unless timer is provided)"
        ),
      end: z
        .string()
        .optional()
        .describe(
          "End date-time in ISO 8601 format (required unless timer is provided)"
        ),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      nap: z
        .boolean()
        .optional()
        .describe("Whether this was a nap (vs. nighttime sleep)"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      start: z
        .string()
        .optional()
        .describe("Start date-time in ISO 8601 format"),
      end: z.string().optional().describe("End date-time in ISO 8601 format"),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      nap: z.boolean().optional().describe("Whether this was a nap"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      start: z.string().optional().describe("Filter by start date-time"),
      start_min: z
        .string()
        .optional()
        .describe("Filter by minimum start date-time"),
      start_max: z
        .string()
        .optional()
        .describe("Filter by maximum start date-time"),
      end: z.string().optional().describe("Filter by end date-time"),
      end_min: z
        .string()
        .optional()
        .describe("Filter by minimum end date-time"),
      end_max: z
        .string()
        .optional()
        .describe("Filter by maximum end date-time"),
      tags: z.string().optional().describe("Filter by tag name"),
    },
  },

  // -- Tummy Time --
  {
    name: "tummy_times",
    singular: "tummy_time",
    displayName: "Tummy time sessions",
    path: "/api/tummy-times/",
    idField: "id",
    description:
      "Track tummy time sessions including duration and milestones achieved.",
    createSchema: {
      child: z
        .number()
        .optional()
        .describe("Child ID (required unless timer is provided)"),
      start: z
        .string()
        .optional()
        .describe(
          "Start date-time in ISO 8601 format (required unless timer is provided)"
        ),
      end: z
        .string()
        .optional()
        .describe(
          "End date-time in ISO 8601 format (required unless timer is provided)"
        ),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      milestone: z
        .string()
        .optional()
        .describe("Milestone achieved during tummy time"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      start: z
        .string()
        .optional()
        .describe("Start date-time in ISO 8601 format"),
      end: z.string().optional().describe("End date-time in ISO 8601 format"),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      milestone: z.string().optional().describe("Milestone achieved"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      start: z.string().optional().describe("Filter by start date-time"),
      start_min: z
        .string()
        .optional()
        .describe("Filter by minimum start date-time"),
      start_max: z
        .string()
        .optional()
        .describe("Filter by maximum start date-time"),
      end: z.string().optional().describe("Filter by end date-time"),
      end_min: z
        .string()
        .optional()
        .describe("Filter by minimum end date-time"),
      end_max: z
        .string()
        .optional()
        .describe("Filter by maximum end date-time"),
      tags: z.string().optional().describe("Filter by tag name"),
    },
  },

  // -- Pumping --
  {
    name: "pumping",
    singular: "pumping",
    displayName: "Pumping sessions",
    path: "/api/pumping/",
    idField: "id",
    description:
      "Track breast milk pumping sessions including amount and duration.",
    createSchema: {
      child: z
        .number()
        .optional()
        .describe("Child ID (required unless timer is provided)"),
      amount: z.number().describe("Amount of milk pumped"),
      start: z
        .string()
        .optional()
        .describe(
          "Start date-time in ISO 8601 format (required unless timer is provided)"
        ),
      end: z
        .string()
        .optional()
        .describe(
          "End date-time in ISO 8601 format (required unless timer is provided)"
        ),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      amount: z.number().optional().describe("Amount of milk pumped"),
      start: z
        .string()
        .optional()
        .describe("Start date-time in ISO 8601 format"),
      end: z.string().optional().describe("End date-time in ISO 8601 format"),
      timer: z
        .number()
        .optional()
        .describe("Timer ID - can be used in place of start, end, and child"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      start: z.string().optional().describe("Filter by start date-time"),
      start_min: z
        .string()
        .optional()
        .describe("Filter by minimum start date-time"),
      start_max: z
        .string()
        .optional()
        .describe("Filter by maximum start date-time"),
      end: z.string().optional().describe("Filter by end date-time"),
      end_min: z
        .string()
        .optional()
        .describe("Filter by minimum end date-time"),
      end_max: z
        .string()
        .optional()
        .describe("Filter by maximum end date-time"),
    },
  },

  // -- Notes --
  {
    name: "notes",
    singular: "note",
    displayName: "Notes",
    path: "/api/notes/",
    idField: "id",
    description: "Free-form notes about a child.",
    createSchema: {
      child: z.number().describe("Child ID"),
      note: z.string().describe("Note text content"),
      time: z
        .string()
        .optional()
        .describe("Date-time of note in ISO 8601 format"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      note: z.string().optional().describe("Note text content"),
      time: z
        .string()
        .optional()
        .describe("Date-time of note in ISO 8601 format"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      date: z.string().optional().describe("Filter by date-time"),
      date_min: z.string().optional().describe("Filter by minimum date-time"),
      date_max: z.string().optional().describe("Filter by maximum date-time"),
      tags: z.string().optional().describe("Filter by tag name"),
    },
  },

  // -- Temperature --
  {
    name: "temperature",
    singular: "temperature",
    displayName: "Temperature readings",
    path: "/api/temperature/",
    idField: "id",
    description: "Track body temperature readings for a child.",
    createSchema: {
      child: z.number().describe("Child ID"),
      temperature: z.number().describe("Temperature value"),
      time: z
        .string()
        .optional()
        .describe("Date-time of reading in ISO 8601 format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      temperature: z.number().optional().describe("Temperature value"),
      time: z
        .string()
        .optional()
        .describe("Date-time of reading in ISO 8601 format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      date: z.string().optional().describe("Filter by date-time"),
      date_min: z.string().optional().describe("Filter by minimum date-time"),
      date_max: z.string().optional().describe("Filter by maximum date-time"),
      tags: z.string().optional().describe("Filter by tag name"),
    },
  },

  // -- Weight --
  {
    name: "weight",
    singular: "weight",
    displayName: "Weight measurements",
    path: "/api/weight/",
    idField: "id",
    description: "Track weight measurements for a child over time.",
    createSchema: {
      child: z.number().describe("Child ID"),
      weight: z.number().describe("Weight value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      weight: z.number().optional().describe("Weight value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      date: z.string().optional().describe("Filter by date"),
    },
  },

  // -- Height --
  {
    name: "height",
    singular: "height",
    displayName: "Height measurements",
    path: "/api/height/",
    idField: "id",
    description: "Track height measurements for a child over time.",
    createSchema: {
      child: z.number().describe("Child ID"),
      height: z.number().describe("Height value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      height: z.number().optional().describe("Height value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      date: z.string().optional().describe("Filter by date"),
    },
  },

  // -- Head Circumference --
  {
    name: "head_circumference",
    singular: "head_circumference",
    displayName: "Head circumference measurements",
    path: "/api/head-circumference/",
    idField: "id",
    description:
      "Track head circumference measurements for a child over time.",
    createSchema: {
      child: z.number().describe("Child ID"),
      head_circumference: z.number().describe("Head circumference value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      head_circumference: z
        .number()
        .optional()
        .describe("Head circumference value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      date: z.string().optional().describe("Filter by date"),
    },
  },

  // -- BMI --
  {
    name: "bmi",
    singular: "bmi",
    displayName: "BMI entries",
    path: "/api/bmi/",
    idField: "id",
    description: "Track BMI (Body Mass Index) values for a child over time.",
    createSchema: {
      child: z.number().describe("Child ID"),
      bmi: z.number().describe("BMI value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      bmi: z.number().optional().describe("BMI value"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      notes: z.string().optional().describe("Additional notes"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      date: z.string().optional().describe("Filter by date"),
    },
  },

  // -- Tags --
  {
    name: "tags",
    singular: "tag",
    displayName: "Tags",
    path: "/api/tags/",
    idField: "slug",
    description:
      "Manage tags used to categorize entries across all record types.",
    createSchema: {
      name: z.string().describe("Tag name"),
      color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
        .describe("Tag color as hex string (e.g. #ff0000)"),
    },
    updateSchema: {
      name: z.string().optional().describe("Tag name"),
      color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
        .describe("Tag color as hex string (e.g. #ff0000)"),
    },
    filterSchema: {
      name: z.string().optional().describe("Filter by tag name"),
      last_used: z.string().optional().describe("Filter by last used date"),
    },
  },

  // -- Timers --
  {
    name: "timers",
    singular: "timer",
    displayName: "Timers",
    path: "/api/timers/",
    idField: "id",
    description:
      "Manage timers that can be used to track duration-based activities (feedings, sleep, tummy time, pumping).",
    createSchema: {
      child: z
        .number()
        .optional()
        .describe("Child ID to associate the timer with"),
      name: z.string().optional().describe("Timer name/label"),
      start: z
        .string()
        .optional()
        .describe("Start date-time in ISO 8601 format (defaults to now)"),
      user: z.number().optional().describe("User ID who owns the timer"),
    },
    updateSchema: {
      child: z.number().optional().describe("Child ID"),
      name: z.string().optional().describe("Timer name/label"),
      start: z
        .string()
        .optional()
        .describe("Start date-time in ISO 8601 format"),
      user: z.number().optional().describe("User ID"),
    },
    filterSchema: {
      child: z.number().optional().describe("Filter by child ID"),
      name: z.string().optional().describe("Filter by timer name"),
      user: z.number().optional().describe("Filter by user ID"),
      start: z.string().optional().describe("Filter by start date-time"),
      start_min: z
        .string()
        .optional()
        .describe("Filter by minimum start date-time"),
      start_max: z
        .string()
        .optional()
        .describe("Filter by maximum start date-time"),
      end: z.string().optional().describe("Filter by end date-time"),
      end_min: z
        .string()
        .optional()
        .describe("Filter by minimum end date-time"),
      end_max: z
        .string()
        .optional()
        .describe("Filter by maximum end date-time"),
    },
  },
];
