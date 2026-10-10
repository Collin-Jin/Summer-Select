"use client";

import { useId, useState, useTransition } from "react";
import { CheckCircle2, PlusCircle, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/context/LanguageContext";
import { submitProgramRequest } from "@/app/actions/programRequest";
import { PROGRAM_REQUEST_LIMITS, type ProgramRequestField } from "@/lib/programRequests";

const COPY = {
  en: {
    button: "Request a program",
    calloutTitle: "Don't see a program you're interested in?",
    calloutBody: "Tell us which one and Collin will research it and add it to the directory within a week.",
    title: "Request a program",
    intro: "Tell us which summer program you'd like to see. Collin will research it and add it to the directory within a week.",
    nameLabel: "Program name",
    namePlaceholder: "For example: Stanford Summer Session",
    urlLabel: "Program website (optional)",
    urlPlaceholder: "https://",
    notesLabel: "Anything else we should know? (optional)",
    notesPlaceholder: "The host institution, grade level, or why you're interested.",
    emailLabel: "Your email (optional)",
    emailHelp: "Only if you'd like us to let you know when it's added.",
    send: "Send request",
    sending: "Sending…",
    cancel: "Cancel",
    close: "Close",
    doneTitle: "Request received",
    doneBody: (name: string) =>
      `Thanks! Collin will research ${name} and add it to the directory within a week.`,
    failed: "We couldn't send your request. Please try again.",
  },
  zh: {
    button: "推荐项目",
    calloutTitle: "没有找到你感兴趣的项目？",
    calloutBody: "告诉我们是哪一个，Collin 会在一周内调研并添加到项目库。",
    title: "推荐项目",
    intro: "告诉我们你希望看到哪个暑期项目。Collin 会在一周内调研并添加到项目库。",
    nameLabel: "项目名称",
    namePlaceholder: "例如：Stanford Summer Session",
    urlLabel: "项目官网（选填）",
    urlPlaceholder: "https://",
    notesLabel: "还有什么需要补充的？（选填）",
    notesPlaceholder: "主办机构、适用年级，或你感兴趣的原因。",
    emailLabel: "你的邮箱（选填）",
    emailHelp: "仅当你希望项目添加后收到通知时填写。",
    send: "提交请求",
    sending: "提交中…",
    cancel: "取消",
    close: "关闭",
    doneTitle: "已收到你的请求",
    doneBody: (name: string) => `谢谢！Collin 会在一周内调研 ${name} 并添加到项目库。`,
    failed: "提交失败，请重试。",
  },
} as const;

const fieldClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/25";

interface RequestProgramProps {
  /** Signed-in visitors are identified by their account, so no email is asked for. */
  signedIn: boolean;
  /** `button` is the compact toolbar control; `callout` is the full-width prompt under the list. */
  variant?: "button" | "callout";
  className?: string;
}

/**
 * Lets any visitor ask for a summer program to be added to the directory.
 * Requests land in the admin's Program requests inbox.
 */
export function RequestProgram({ signedIn, variant = "button", className }: RequestProgramProps) {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const uid = useId();
  const titleId = `${uid}-title`;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProgramRequestField, string>>>({});
  const [sentName, setSentName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openDialog = () => {
    setSentName(null);
    setError(null);
    setFieldErrors({});
    setOpen(true);
  };

  const closeDialog = () => {
    if (pending) return;
    setOpen(false);
    if (sentName) {
      setName("");
      setUrl("");
      setNotes("");
      setEmail("");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      try {
        const result = await submitProgramRequest({
          programName: name,
          programUrl: url,
          notes,
          email: signedIn ? "" : email,
        });
        if (result.ok) {
          setSentName(name.replace(/\s+/g, " ").trim());
        } else if (result.field) {
          setFieldErrors({ [result.field]: result.error });
        } else {
          setError(result.error);
        }
      } catch {
        setError(c.failed);
      }
    });
  };

  const trigger =
    variant === "callout" ? (
      <div
        className={`flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">{c.calloutTitle}</h2>
          <p className="mt-0.5 text-sm text-slate-600">{c.calloutBody}</p>
        </div>
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2"
          style={{ background: "var(--color-brand-600)" }}
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          {c.button}
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={openDialog}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] ${className ?? ""}`}
        style={{ borderColor: "var(--color-brand-100)", color: "var(--color-brand-600)" }}
      >
        <PlusCircle className="h-4 w-4" aria-hidden />
        {c.button}
      </button>
    );

  return (
    <>
      {trigger}

      <Modal open={open} onClose={closeDialog} labelledBy={titleId} className="max-w-lg">
        {sentName ? (
          <div className="p-6 text-center sm:p-8">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "var(--color-brand-50)" }}
            >
              <CheckCircle2 className="h-6 w-6" style={{ color: "var(--color-brand-600)" }} aria-hidden />
            </div>
            <h2 id={titleId} className="mt-4 text-lg font-bold text-slate-900">
              {c.doneTitle}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">{c.doneBody(sentName)}</p>
            <button
              type="button"
              data-autofocus
              onClick={closeDialog}
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2"
              style={{ background: "var(--color-brand-600)" }}
            >
              {c.close}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-bold text-slate-900">
                  {c.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.intro}</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label={c.close}
                className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="mt-5">
              <label htmlFor={`${uid}-name`} className="block text-sm font-semibold text-slate-800">
                {c.nameLabel}
              </label>
              <input
                id={`${uid}-name`}
                data-autofocus
                required
                type="text"
                minLength={PROGRAM_REQUEST_LIMITS.nameMin}
                maxLength={PROGRAM_REQUEST_LIMITS.nameMax}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
                aria-invalid={fieldErrors.programName ? true : undefined}
                className={`${fieldClass} mt-1.5`}
              />
              {fieldErrors.programName && (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.programName}</p>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor={`${uid}-url`} className="block text-sm font-semibold text-slate-800">
                {c.urlLabel}
              </label>
              <input
                id={`${uid}-url`}
                type="text"
                inputMode="url"
                autoComplete="off"
                maxLength={PROGRAM_REQUEST_LIMITS.urlMax}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={c.urlPlaceholder}
                aria-invalid={fieldErrors.programUrl ? true : undefined}
                className={`${fieldClass} mt-1.5`}
              />
              {fieldErrors.programUrl && (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.programUrl}</p>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor={`${uid}-notes`} className="block text-sm font-semibold text-slate-800">
                {c.notesLabel}
              </label>
              <textarea
                id={`${uid}-notes`}
                rows={3}
                maxLength={PROGRAM_REQUEST_LIMITS.notesMax}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={c.notesPlaceholder}
                aria-invalid={fieldErrors.notes ? true : undefined}
                className={`${fieldClass} mt-1.5 resize-y`}
              />
              {fieldErrors.notes && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.notes}</p>}
            </div>

            {!signedIn && (
              <div className="mt-3">
                <label htmlFor={`${uid}-email`} className="block text-sm font-semibold text-slate-800">
                  {c.emailLabel}
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="email"
                  maxLength={PROGRAM_REQUEST_LIMITS.emailMax}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  className={`${fieldClass} mt-1.5`}
                />
                {fieldErrors.email ? (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.email}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">{c.emailHelp}</p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={pending}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] disabled:opacity-60"
              >
                {c.cancel}
              </button>
              <button
                type="submit"
                disabled={pending || name.trim().length < PROGRAM_REQUEST_LIMITS.nameMin}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "var(--color-brand-600)" }}
              >
                {pending ? c.sending : c.send}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
