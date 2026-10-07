"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Lock, X } from "lucide-react";
import { clsx } from "clsx";
import { saveRecord } from "@/app/admin/actions";
import type { FieldDef, FieldValue, FormSpec, Option } from "@/lib/admin/resources";
import { Button } from "@/components/ui/Button";
import { errorClass, helpClass, inputClass, inputErrorClass, labelClass } from "./styles";

type FormValues = Record<string, FieldValue>;

interface ResourceFormProps {
  spec: FormSpec;
  /** Record id when editing, null when creating. */
  id: string | null;
  initialValues: FormValues;
  refOptions: Record<string, Option[]>;
  suggestions: Record<string, string[]>;
  /** Where "Cancel" goes. */
  cancelHref: string;
  /** Optional extra content in the action bar (e.g. delete button). */
  extraActions?: React.ReactNode;
}

function buildFormData(fields: FieldDef[], values: FormValues, mode: "create" | "update"): FormData {
  const fd = new FormData();
  for (const f of fields) {
    if (mode === "update" && f.immutable) continue;
    const v = values[f.name];
    if (Array.isArray(v)) v.forEach((item) => fd.append(f.name, item));
    else if (typeof v === "boolean") fd.append(f.name, v ? "true" : "false");
    else fd.append(f.name, v ?? "");
  }
  return fd;
}

export function ResourceForm({
  spec,
  id,
  initialValues,
  refOptions,
  suggestions,
  cancelHref,
  extraActions,
}: ResourceFormProps) {
  const router = useRouter();
  const mode = id ? "update" : "create";
  const [values, setValues] = useState<FormValues>(initialValues);
  const [baseline, setBaseline] = useState<string>(() => JSON.stringify(initialValues));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const fieldsByName = useMemo(
    () => Object.fromEntries(spec.fields.map((f) => [f.name, f])) as Record<string, FieldDef>,
    [spec.fields]
  );

  const dirty = JSON.stringify(values) !== baseline;

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirty || pending) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, pending]);

  // Clear the "saved" notice a few seconds after it appears.
  useEffect(() => {
    if (!savedMessage) return;
    const t = setTimeout(() => setSavedMessage(null), 4000);
    return () => clearTimeout(t);
  }, [savedMessage]);

  function setValue(name: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSavedMessage(null);
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function focusFirstError(fieldErrors: Record<string, string>) {
    const first = spec.fields.find((f) => fieldErrors[f.name]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first.name}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>("input, textarea, select, button")?.focus({ preventScroll: true });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    setSavedMessage(null);

    startTransition(async () => {
      let result;
      try {
        result = await saveRecord(spec.key, id, buildFormData(spec.fields, values, mode));
      } catch {
        setFormError("Couldn't reach the server. Check your connection and try again.");
        return;
      }

      if (!result.ok) {
        const fieldErrors = result.fieldErrors ?? {};
        setErrors(fieldErrors);
        if (result.error) setFormError(result.error);
        else if (Object.keys(fieldErrors).length) {
          setFormError("Please fix the highlighted fields.");
          requestAnimationFrame(() => focusFirstError(fieldErrors));
        }
        return;
      }

      setErrors({});
      setBaseline(JSON.stringify(values));
      setSavedMessage(result.message);
      if (result.redirectTo) router.push(result.redirectTo);
      else router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
      {spec.note && (
        <p className="rounded-lg border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] px-4 py-3 text-sm text-[var(--color-brand-700)]">
          {spec.note}
        </p>
      )}

      {spec.sections.map((section) => (
        <section key={section.title} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-base font-bold text-slate-900">{section.title}</h2>
            {section.description && <p className="mt-0.5 text-sm text-slate-500">{section.description}</p>}
          </header>
          <div className="space-y-5 p-5">
            {section.rows.map((row, i) => {
              const names = Array.isArray(row) ? row : [row];
              return (
                <div key={i} className={clsx("grid gap-5", names.length > 1 && "lg:grid-cols-2")}>
                  {names.map((name) => (
                    <FieldRow
                      key={name}
                      field={fieldsByName[name]}
                      value={values[name]}
                      error={errors[name]}
                      locked={mode === "update" && fieldsByName[name].immutable === true}
                      options={refOptions[name] ?? fieldsByName[name].options ?? []}
                      suggestions={suggestions[name] ?? []}
                      onChange={(v) => setValue(name, v)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Sticky action bar */}
      <div className="sticky bottom-3 z-30 rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 text-sm" aria-live="polite">
            {formError ? (
              <span className="inline-flex items-start gap-1.5 font-medium text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {formError}
              </span>
            ) : savedMessage ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                <Check className="h-4 w-4" /> {savedMessage}
              </span>
            ) : dirty ? (
              <span className="text-amber-600">You have unsaved changes.</span>
            ) : (
              <span className="text-slate-400">{mode === "create" ? "Fill in the form, then save." : "All changes saved."}</span>
            )}
          </div>
          {extraActions}
          <Link
            href={cancelHref}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {dirty ? "Discard" : "Back"}
          </Link>
          <Button type="submit" loading={pending} disabled={mode === "update" && !dirty}>
            {mode === "create" ? `Create ${spec.singular}` : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface FieldRowProps {
  field: FieldDef;
  value: FieldValue;
  error?: string;
  locked: boolean;
  options: Option[];
  suggestions: string[];
  onChange: (v: FieldValue) => void;
}

function FieldRow({ field, value, error, locked, options, suggestions, onChange }: FieldRowProps) {
  const uid = useId();
  const inputId = `${uid}-${field.name}`;
  const hasError = Boolean(error);
  const base = clsx(inputClass, hasError && inputErrorClass);
  const strValue = typeof value === "string" ? value : "";

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          id={inputId}
          rows={field.rows ?? 4}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={locked}
          aria-invalid={hasError}
          className={clsx(base, "resize-y leading-relaxed")}
        />
      );
      break;

    case "text":
    case "url": {
      const listId = suggestions.length ? `${inputId}-list` : undefined;
      control = (
        <>
          <input
            id={inputId}
            type={field.type === "url" ? "url" : "text"}
            inputMode={field.type === "url" ? "url" : undefined}
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={locked}
            list={listId}
            autoComplete="off"
            aria-invalid={hasError}
            className={base}
          />
          {listId && (
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </>
      );
      break;
    }

    case "int":
    case "decimal":
      control = (
        <input
          id={inputId}
          type="number"
          inputMode={field.type === "int" ? "numeric" : "decimal"}
          step={field.type === "int" ? 1 : "any"}
          min={field.min}
          max={field.max}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={locked}
          aria-invalid={hasError}
          className={base}
        />
      );
      break;

    case "date":
      control = (
        <div className="flex gap-2">
          <input
            id={inputId}
            type="date"
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={locked}
            aria-invalid={hasError}
            className={base}
          />
          {strValue && !field.required && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg border border-slate-300 px-2.5 text-slate-500 transition hover:bg-slate-100"
              aria-label={`Clear ${field.label}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      );
      break;

    case "bool":
      control = (
        <Toggle
          id={inputId}
          checked={value === true}
          onChange={onChange}
          label={value === true ? "Yes" : "No"}
          disabled={locked}
        />
      );
      break;

    case "tribool":
      control = (
        <div role="radiogroup" aria-label={field.label} className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm shadow-sm">
          {[
            { v: "", label: "Not specified" },
            { v: "true", label: "Yes" },
            { v: "false", label: "No" },
          ].map((opt) => {
            const active = strValue === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(opt.v)}
                className={clsx(
                  "px-3.5 py-2 font-medium transition",
                  "border-l border-slate-200 first:border-l-0",
                  active
                    ? "bg-[var(--color-brand-500)] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
      break;

    case "select":
      control = (
        <select
          id={inputId}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          aria-invalid={hasError}
          className={base}
        >
          <option value="">— Choose —</option>
          {/* Keep an unknown current value visible instead of silently dropping it. */}
          {strValue && !options.some((o) => o.value === strValue) && (
            <option value={strValue}>{strValue}</option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;

    case "tags":
      control = (
        <TagInput
          id={inputId}
          tags={Array.isArray(value) ? value : []}
          onChange={onChange}
          hasError={hasError}
        />
      );
      break;

    case "intset":
      control = (
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((o) => {
            const selected = Array.isArray(value) && value.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const current = Array.isArray(value) ? value : [];
                  onChange(selected ? current.filter((x) => x !== o.value) : [...current, o.value]);
                }}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  selected
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );
      break;
  }

  const isSwitch = field.type === "bool";

  return (
    <div data-field={field.name} className="min-w-0">
      <label htmlFor={inputId} className={clsx(labelClass, "mb-1.5 flex items-center gap-1.5")}>
        {field.label}
        {field.required && <span className="text-red-500" aria-hidden>*</span>}
        {locked && <Lock className="h-3 w-3 text-slate-400" aria-label="Cannot be changed" />}
      </label>
      {control}
      {error ? (
        <p className={errorClass} role="alert">
          {error}
        </p>
      ) : (
        field.help && <p className={clsx(helpClass, isSwitch && "mt-1.5")}>{field.help}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Toggle({
  id,
  checked,
  onChange,
  label,
  disabled,
}: {
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={clsx(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-[var(--color-brand-500)]" : "bg-slate-300"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </button>
  );
}

function TagInput({
  id,
  tags,
  onChange,
  hasError,
}: {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  hasError: boolean;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const parts = raw
      .split(/[,，;；\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...tags];
    for (const p of parts) {
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setDraft("");
  }

  return (
    <div
      className={clsx(
        "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 shadow-sm transition",
        "focus-within:border-[var(--color-brand-500)] focus-within:ring-2 focus-within:ring-[var(--color-brand-500)]/25",
        hasError ? "border-red-400" : "border-slate-300"
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-brand-700)]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="rounded-full p-0.5 hover:bg-[var(--color-brand-100)]"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (/[,，;；]$/.test(v)) commit(v);
          else setDraft(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // never submit the whole form from here
            commit(draft);
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={tags.length ? "" : "Type and press Enter"}
        className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
