"use client";

import { useId, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Flag, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/context/LanguageContext";
import { submitReport } from "@/app/actions/report";
import { REPORT_LIMITS } from "@/lib/reports";

const COPY = {
  en: {
    button: "Report a problem",
    title: "Report a problem",
    intro: "Spotted a mistake, a wrong date, a broken link or a bug? Tell us and we'll look into it.",
    messageLabel: "What went wrong?",
    messagePlaceholder: "For example: the priority deadline on this page doesn't match the program's website.",
    emailLabel: "Your email (optional)",
    emailHelp: "Only if you'd like us to follow up.",
    page: "Page",
    send: "Send report",
    sending: "Sending…",
    cancel: "Cancel",
    close: "Close",
    doneTitle: "Thanks, we got it",
    doneBody: "Your report has been sent. We'll fix it as soon as we can.",
    failed: "We couldn't send your report. Please try again.",
  },
  zh: {
    button: "报告问题",
    title: "报告问题",
    intro: "发现了错误、日期不对、链接失效或其他问题？告诉我们，我们会尽快处理。",
    messageLabel: "哪里出了问题？",
    messagePlaceholder: "例如：本页的优先截止日期与项目官网不一致。",
    emailLabel: "你的邮箱（选填）",
    emailHelp: "仅当你希望我们回复时填写。",
    page: "页面",
    send: "提交报告",
    sending: "提交中…",
    cancel: "取消",
    close: "关闭",
    doneTitle: "谢谢，我们已收到",
    doneBody: "你的报告已提交，我们会尽快修复。",
    failed: "提交失败，请重试。",
  },
} as const;

const fieldClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/25";

/**
 * Floating "Report a problem" button for every public page. Opens a small form;
 * reports land in the admin's Problem reports inbox.
 */
export function ReportIssue({ userEmail }: { userEmail?: string | null }) {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const pathname = usePathname();
  const uid = useId();
  const titleId = `${uid}-title`;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  // The admin works inside the admin area and the edit tools; no need to nag.
  if (pathname.startsWith("/admin")) return null;

  const openDialog = () => {
    setSent(false);
    setError(null);
    setEmailError(null);
    setOpen(true);
  };

  const closeDialog = () => {
    if (pending) return;
    setOpen(false);
    if (sent) {
      setMessage("");
      setEmail("");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    const pageUrl = `${window.location.pathname}${window.location.search}`;
    startTransition(async () => {
      try {
        const result = await submitReport({ message, email, pageUrl });
        if (result.ok) {
          setSent(true);
        } else if (result.field === "email") {
          setEmailError(result.error);
        } else {
          setError(result.error);
        }
      } catch {
        setError(c.failed);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={c.button}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:text-[var(--color-brand-700)] hover:ring-[var(--color-brand-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] print:hidden"
      >
        <Flag className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{c.button}</span>
      </button>

      <Modal open={open} onClose={closeDialog} labelledBy={titleId} className="max-w-lg">
        {sent ? (
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
            <p className="mt-1.5 text-sm text-slate-600">{c.doneBody}</p>
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
              <label htmlFor={`${uid}-message`} className="block text-sm font-semibold text-slate-800">
                {c.messageLabel}
              </label>
              <textarea
                id={`${uid}-message`}
                data-autofocus
                required
                rows={5}
                minLength={REPORT_LIMITS.messageMin}
                maxLength={REPORT_LIMITS.messageMax}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={c.messagePlaceholder}
                className={`${fieldClass} mt-1.5 resize-y`}
              />
              <p className="mt-1 text-right text-xs tabular-nums text-slate-400">
                {message.length}/{REPORT_LIMITS.messageMax}
              </p>
            </div>

            {!userEmail && (
              <div className="mt-3">
                <label htmlFor={`${uid}-email`} className="block text-sm font-semibold text-slate-800">
                  {c.emailLabel}
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="email"
                  maxLength={REPORT_LIMITS.emailMax}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={emailError ? true : undefined}
                  className={`${fieldClass} mt-1.5`}
                />
                {emailError ? (
                  <p className="mt-1 text-xs font-medium text-red-600">{emailError}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">{c.emailHelp}</p>
                )}
              </div>
            )}

            <p className="mt-4 truncate text-xs text-slate-400">
              {c.page}: <span className="font-mono">{pathname}</span>
            </p>

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
                disabled={pending || message.trim().length < REPORT_LIMITS.messageMin}
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
