import { describe, expect, it } from "vitest";
import {
  NAV_RESOURCE_KEYS,
  RESOURCES,
  getField,
  getResource,
  initialFormValues,
  toFormSpec,
  type FieldDef,
} from "./resources";

const resources = Object.values(RESOURCES);

describe("resource registry", () => {
  it("keys each resource by its own key", () => {
    for (const [key, resource] of Object.entries(RESOURCES)) {
      expect(resource.key).toBe(key);
    }
  });

  it("only places declared fields in form sections", () => {
    for (const resource of resources) {
      const names = new Set(resource.fields.map((f) => f.name));
      for (const section of resource.sections) {
        for (const name of section.rows.flat()) {
          expect(names.has(name), `${resource.key}: unknown field "${name}" in "${section.title}"`).toBe(true);
        }
      }
    }
  });

  it("lays out every editable field exactly once", () => {
    for (const resource of resources) {
      const placed = resource.sections.flatMap((s) => s.rows.flat());
      expect(new Set(placed).size, `${resource.key}: a field appears twice`).toBe(placed.length);
      for (const f of resource.fields) {
        expect(placed.includes(f.name), `${resource.key}: "${f.name}" is not on the form`).toBe(true);
      }
    }
  });

  it("resolves every cross-reference to a real resource", () => {
    for (const resource of resources) {
      for (const f of resource.fields) {
        if (f.refResource) expect(getResource(f.refResource), `${resource.key}.${f.name}`).not.toBeNull();
        if (f.suggestFrom) expect(getResource(f.suggestFrom.resource), `${resource.key}.${f.name}`).not.toBeNull();
      }
      if (resource.parent) expect(getResource(resource.parent.resource)).not.toBeNull();
      for (const child of resource.children ?? []) {
        const target = getResource(child.resource);
        expect(target, `${resource.key} child ${child.resource}`).not.toBeNull();
        expect(target!.fields.some((f) => f.name === child.field)).toBe(true);
      }
    }
  });

  it("gives select and intset fields their choices", () => {
    for (const resource of resources) {
      for (const f of resource.fields) {
        if (f.type === "intset" || (f.type === "select" && !f.refResource)) {
          expect(f.options?.length, `${resource.key}.${f.name}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("lists only registered resources in the navigation", () => {
    for (const key of NAV_RESOURCE_KEYS) expect(getResource(key)).not.toBeNull();
  });
});

describe("getResource / getField", () => {
  it("does not resolve inherited object properties", () => {
    for (const key of ["constructor", "__proto__", "toString", "missing"]) {
      expect(getResource(key)).toBeNull();
    }
  });

  it("throws for an unknown field", () => {
    expect(() => getField(RESOURCES.programs, "nope")).toThrow(/Unknown field/);
  });
});

describe("toFormSpec", () => {
  it("exposes only the serialisable parts needed by the client", () => {
    const spec = toFormSpec(RESOURCES.programs);
    expect(Object.keys(spec).sort()).toEqual(["fields", "key", "label", "note", "sections", "singular"]);
    expect(() => JSON.stringify(spec)).not.toThrow();
  });
});

describe("initialFormValues", () => {
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", default: "Untitled" },
    { name: "flag", label: "Flag", type: "bool" },
    { name: "maybe", label: "Maybe", type: "tribool" },
    { name: "tags", label: "Tags", type: "tags" },
    { name: "when", label: "When", type: "date" },
    { name: "n", label: "N", type: "int" },
  ];

  it("uses defaults and presets for new records", () => {
    const v = initialFormValues(fields, null, { n: "5" });
    expect(v).toMatchObject({ title: "Untitled", flag: false, maybe: "", tags: [], when: "", n: "5" });
  });

  it("converts an existing row into form values", () => {
    const v = initialFormValues(fields, {
      title: "Hello",
      flag: true,
      maybe: false,
      tags: ["a", 2],
      when: "2026-05-15T00:00:00Z",
      n: 7,
    });
    expect(v).toEqual({ title: "Hello", flag: true, maybe: "false", tags: ["a", "2"], when: "2026-05-15", n: "7" });
  });
});
