import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import { resources } from "../src/resources.js";

// ---------------------------------------------------------------------------
// Load & parse OpenAPI schema
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "../openapi-schema.yml");

interface OpenAPIParameter {
  name: string;
  required: boolean;
  in: string;
  schema: { type: string; enum?: string[] };
}

interface OpenAPIProperty {
  type?: string;
  format?: string;
  readOnly?: boolean;
  writeOnly?: boolean;
  nullable?: boolean;
  enum?: string[];
  items?: { type: string };
  $ref?: string;
}

interface OpenAPISchema {
  type: string;
  required?: string[];
  properties: Record<string, OpenAPIProperty>;
}

interface OpenAPIOperation {
  operationId: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content: {
      "application/json": {
        schema: { $ref: string };
      };
    };
  };
}

interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  delete?: OpenAPIOperation;
}

interface OpenAPISpec {
  paths: Record<string, OpenAPIPathItem>;
  components: {
    schemas: Record<string, OpenAPISchema>;
  };
}

const spec: OpenAPISpec = parseYaml(readFileSync(schemaPath, "utf-8")) as OpenAPISpec;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a $ref like "#/components/schemas/Feeding" to the schema object. */
function resolveRef(ref: string): OpenAPISchema {
  const name = ref.replace("#/components/schemas/", "");
  const schema = spec.components.schemas[name];
  if (!schema) throw new Error(`Schema not found: ${name}`);
  return schema;
}

/** Get the component schema referenced by a POST operation on a path. */
function getSchemaForPath(path: string): OpenAPISchema {
  const pathItem = spec.paths[path];
  if (!pathItem?.post?.requestBody) {
    throw new Error(`No POST operation with requestBody on ${path}`);
  }
  const ref = pathItem.post.requestBody.content["application/json"].schema.$ref;
  return resolveRef(ref);
}

/** Get writable (non-readOnly, non-binary) property names from an OpenAPI schema. */
function getWritableFields(schema: OpenAPISchema): string[] {
  return Object.entries(schema.properties)
    .filter(([, prop]) => !prop.readOnly && prop.format !== "binary")
    .map(([name]) => name);
}

/** Get required field names from an OpenAPI schema, excluding readOnly. */
function getRequiredFields(schema: OpenAPISchema): string[] {
  const required = schema.required ?? [];
  return required.filter((name) => !schema.properties[name]?.readOnly);
}

/** Get enum values from an OpenAPI property, if it's an enum. */
function getEnumValues(prop: OpenAPIProperty): string[] | undefined {
  return prop.enum;
}

/**
 * Unwrap a Zod type to get to the inner type, stripping optional/nullable.
 * Works with Zod v4 by walking _zod.def.
 */
function unwrapZod(zodType: unknown): unknown {
  const z = zodType as { _zod?: { def?: { type?: string; innerType?: unknown } } };
  const def = z?._zod?.def;
  if (def?.type === "optional" || def?.type === "nullable") {
    return unwrapZod(def.innerType);
  }
  return zodType;
}

/** Check if a Zod type is optional (has .optional() wrapper). */
function isZodOptional(zodType: unknown): boolean {
  const z = zodType as { _zod?: { def?: { type?: string; innerType?: unknown } } };
  const def = z?._zod?.def;
  if (def?.type === "optional") return true;
  if (def?.type === "nullable" && def.innerType) return isZodOptional(def.innerType);
  return false;
}

/** Get enum values from a Zod enum type (Zod v4 uses `entries` record). */
function getZodEnumValues(zodType: unknown): string[] | undefined {
  const inner = unwrapZod(zodType);
  const z = inner as { _zod?: { def?: { type?: string; entries?: Record<string, string> } } };
  if (z?._zod?.def?.type === "enum" && z._zod.def.entries) {
    return Object.keys(z._zod.def.entries);
  }
  return undefined;
}

/** Get the query parameters from a GET list operation, excluding standard pagination params. */
function getFilterParams(path: string): string[] {
  const pathItem = spec.paths[path];
  const params = pathItem?.get?.parameters ?? [];
  const standardParams = ["limit", "offset", "ordering"];
  return params
    .filter((p) => p.in === "query" && !standardParams.includes(p.name))
    .map((p) => p.name);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Schema compliance", () => {
  describe("every resource path exists in the OpenAPI spec", () => {
    for (const resource of resources) {
      it(`${resource.path} exists`, () => {
        expect(spec.paths[resource.path]).toBeDefined();
      });

      it(`${resource.path}{${resource.idField}}/ detail path exists`, () => {
        const detailPath = `${resource.path}{${resource.idField}}/`;
        expect(spec.paths[detailPath]).toBeDefined();
      });
    }
  });

  describe("create schema fields match OpenAPI writable properties", () => {
    for (const resource of resources) {
      describe(resource.name, () => {
        it("has all writable OpenAPI fields (excluding readOnly)", () => {
          const apiSchema = getSchemaForPath(resource.path);
          const apiFields = getWritableFields(apiSchema);
          const zodFields = Object.keys(resource.createSchema);

          const missingInZod = apiFields.filter((f) => !zodFields.includes(f));
          expect(
            missingInZod,
            `Fields in OpenAPI but missing from Zod create schema: ${missingInZod.join(", ")}`
          ).toEqual([]);
        });

        it("has no extra fields not in OpenAPI", () => {
          const apiSchema = getSchemaForPath(resource.path);
          const apiFields = getWritableFields(apiSchema);
          const zodFields = Object.keys(resource.createSchema);

          const extraInZod = zodFields.filter((f) => !apiFields.includes(f));
          expect(
            extraInZod,
            `Fields in Zod create schema but not in OpenAPI: ${extraInZod.join(", ")}`
          ).toEqual([]);
        });
      });
    }
  });

  describe("update schema fields match OpenAPI writable properties", () => {
    for (const resource of resources) {
      describe(resource.name, () => {
        it("has all writable OpenAPI fields (excluding readOnly)", () => {
          const apiSchema = getSchemaForPath(resource.path);
          const apiFields = getWritableFields(apiSchema);
          const zodFields = Object.keys(resource.updateSchema);

          const missingInZod = apiFields.filter((f) => !zodFields.includes(f));
          expect(
            missingInZod,
            `Fields in OpenAPI but missing from Zod update schema: ${missingInZod.join(", ")}`
          ).toEqual([]);
        });

        it("has no extra fields not in OpenAPI", () => {
          const apiSchema = getSchemaForPath(resource.path);
          const apiFields = getWritableFields(apiSchema);
          const zodFields = Object.keys(resource.updateSchema);

          const extraInZod = zodFields.filter((f) => !apiFields.includes(f));
          expect(
            extraInZod,
            `Fields in Zod update schema but not in OpenAPI: ${extraInZod.join(", ")}`
          ).toEqual([]);
        });

        it("all update fields are optional", () => {
          for (const [name, zodType] of Object.entries(resource.updateSchema)) {
            expect(
              isZodOptional(zodType),
              `Update field "${name}" should be optional`
            ).toBe(true);
          }
        });
      });
    }
  });

  describe("required fields in create schema match OpenAPI", () => {
    for (const resource of resources) {
      it(resource.name, () => {
        const apiSchema = getSchemaForPath(resource.path);
        const apiRequired = getRequiredFields(apiSchema);

        for (const field of apiRequired) {
          const zodType = resource.createSchema[field];
          if (!zodType) continue; // covered by field presence tests above
          expect(
            isZodOptional(zodType),
            `"${field}" is required in OpenAPI but optional in Zod create schema`
          ).toBe(false);
        }
      });
    }
  });

  describe("enum values match OpenAPI", () => {
    for (const resource of resources) {
      describe(resource.name, () => {
        it("create schema enums match", () => {
          const apiSchema = getSchemaForPath(resource.path);

          for (const [field, zodType] of Object.entries(
            resource.createSchema
          )) {
            const apiProp = apiSchema.properties[field];
            if (!apiProp) continue;

            const apiEnums = getEnumValues(apiProp);
            const zodEnums = getZodEnumValues(zodType);

            if (apiEnums) {
              expect(
                zodEnums?.sort(),
                `Enum mismatch for "${field}"`
              ).toEqual([...apiEnums].sort());
            }
          }
        });
      });
    }
  });

  describe("filter schema params match OpenAPI query parameters", () => {
    for (const resource of resources) {
      describe(resource.name, () => {
        it("has all OpenAPI query parameters", () => {
          const apiParams = getFilterParams(resource.path);
          const zodParams = Object.keys(resource.filterSchema ?? {});

          const missingInZod = apiParams.filter((p) => !zodParams.includes(p));
          expect(
            missingInZod,
            `Query params in OpenAPI but missing from Zod filter schema: ${missingInZod.join(", ")}`
          ).toEqual([]);
        });

        it("has no extra filter params not in OpenAPI", () => {
          const apiParams = getFilterParams(resource.path);
          const zodParams = Object.keys(resource.filterSchema ?? {});

          const extraInZod = zodParams.filter((p) => !apiParams.includes(p));
          expect(
            extraInZod,
            `Filter params in Zod but not in OpenAPI: ${extraInZod.join(", ")}`
          ).toEqual([]);
        });
      });
    }
  });

  describe("special endpoints exist in OpenAPI", () => {
    it("/api/timers/{id}/restart/ PATCH exists", () => {
      const path = spec.paths["/api/timers/{id}/restart/"];
      expect(path).toBeDefined();
      expect(path?.patch).toBeDefined();
    });

    it("/api/profile GET exists", () => {
      const path = spec.paths["/api/profile"];
      expect(path).toBeDefined();
      expect(path?.get).toBeDefined();
    });
  });

  describe("filter enum values match OpenAPI", () => {
    for (const resource of resources) {
      if (!resource.filterSchema) continue;

      const pathItem = spec.paths[resource.path];
      const apiParams = pathItem?.get?.parameters ?? [];

      for (const [field, zodType] of Object.entries(resource.filterSchema)) {
        const apiParam = apiParams.find((p) => p.name === field);
        if (!apiParam?.schema.enum) continue;

        it(`${resource.name}: filter enum "${field}" matches`, () => {
          const zodEnums = getZodEnumValues(zodType);
          expect(zodEnums?.sort(), `Filter enum mismatch for "${field}"`).toEqual(
            [...apiParam!.schema.enum!].sort()
          );
        });
      }
    }
  });
});
