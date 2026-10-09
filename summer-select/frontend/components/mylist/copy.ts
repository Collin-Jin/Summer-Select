import type { Lang, SummerProgram } from "@/lib/database.types";
import type { DeadlineKind, Urgency } from "@/lib/planner";

export const COPY = {
  en: {
    title: "My List",
    cycle: "Admission cycle",
    savedCount: (n: number) => `${n} saved program${n === 1 ? "" : "s"}`,
    exportCal: "Add to calendar",
    exportHint: "Download an .ics file with reminders a week and a day before each deadline",
    nextDeadline: "Closest deadline",
    nextNone: "No upcoming deadlines",
    nextNoneHint:
      "None of your saved programs has an open deadline right now. Rolling programs accept applications any time, so apply early.",
    allSet: "Everything with a deadline is submitted or closed. Nice work.",
    thenDue: "Then due",
    viewProgram: "View program",
    today: "Today",
    tomorrow: "Tomorrow",
    inDays: (n: number) => `in ${n} days`,
    daysAgo: (n: number) => `${n} day${n === 1 ? "" : "s"} ago`,
    daysLeft: "days left",
    dueToday: "Due today",
    dueTomorrow: "Due tomorrow",
    stats: {
      saved: "Saved",
      submitted: "Submitted",
      dueSoon: "Due in 30 days",
      fees: "Fees still to pay",
      feesUnknown: (n: number) => `+${n} unknown`,
      rated: "Rated",
    },
    ribbonTitle: "Your year at a glance",
    ribbonEmpty: "No deadlines",
    timelineTitle: "Deadline timeline",
    showOpens: "Show opening dates",
    noDeadlines: "No deadline listed",
    noDeadlinesHint: "Check the program page for dates, or apply early if admission is rolling.",
    rolling: "Rolling admission",
    tbd: "Deadline TBD",
    outsideCycle: "Outside this cycle",
    missed: "Missed",
    passed: "Passed",
    done: "Done",
    kind: {
      opens: "Applications open",
      priority: "Priority deadline",
      regular: "Deadline",
    } satisfies Record<DeadlineKind, string>,
    programsTitle: "Your programs",
    sort: "Sort by",
    sortOptions: {
      deadline: "Closest deadline",
      rating: "My rating",
      added: "Recently saved",
      name: "Name",
    },
    allStatuses: "All",
    status: "Status",
    rating: "Your rating",
    notRated: "Not rated yet",
    ratingWords: ["Not for me", "Meh", "Interested", "Really like", "Dream program"],
    rateAria: (n: number) => `Rate ${n} out of 5`,
    notes: "Private notes",
    notesPlaceholder: "Essay ideas, who to email, requirements, why you like it…",
    saving: "Saving…",
    saved: "Saved",
    saveError: "Couldn’t save. Retry",
    unsaved: "Unsaved changes",
    saveFailedToast: "We couldn’t save that change. Check your connection and try again.",
    noMatches: "No programs with this status.",
    emptyTitle: "No saved programs yet",
    emptyBody: "Tap the heart on any program to save it here and track its deadlines.",
    browse: "Browse programs",
    opens: "Opens",
    fee: "Fee",
    cost: "Cost",
    free: "Free",
  },
  zh: {
    title: "我的收藏",
    cycle: "申请季",
    savedCount: (n: number) => `${n} 个已保存项目`,
    exportCal: "添加到日历",
    exportHint: "下载 .ics 文件，在每个截止日前一周和前一天提醒你",
    nextDeadline: "最近的截止日期",
    nextNone: "暂无即将到来的截止日期",
    nextNoneHint: "你收藏的项目目前都没有开放中的截止日期。滚动录取的项目随时可以申请，建议尽早提交。",
    allSet: "所有有截止日期的项目都已提交或已截止，做得好！",
    thenDue: "接下来",
    viewProgram: "查看项目",
    today: "今天",
    tomorrow: "明天",
    inDays: (n: number) => `${n} 天后`,
    daysAgo: (n: number) => `${n} 天前`,
    daysLeft: "天后截止",
    dueToday: "今天截止",
    dueTomorrow: "明天截止",
    stats: {
      saved: "已保存",
      submitted: "已提交",
      dueSoon: "30 天内截止",
      fees: "待缴申请费",
      feesUnknown: (n: number) => `另有 ${n} 项未知`,
      rated: "已评分",
    },
    ribbonTitle: "全年概览",
    ribbonEmpty: "无截止日期",
    timelineTitle: "截止日期时间线",
    showOpens: "显示开放日期",
    noDeadlines: "未列出截止日期",
    noDeadlinesHint: "请在项目页面查看日期；若为滚动录取，建议尽早申请。",
    rolling: "滚动录取",
    tbd: "截止日期待定",
    outsideCycle: "本申请季之外",
    missed: "已错过",
    passed: "已过",
    done: "完成",
    kind: {
      opens: "开放申请",
      priority: "优先截止",
      regular: "截止日期",
    } satisfies Record<DeadlineKind, string>,
    programsTitle: "我的项目",
    sort: "排序",
    sortOptions: {
      deadline: "最近截止",
      rating: "我的评分",
      added: "最近保存",
      name: "名称",
    },
    allStatuses: "全部",
    status: "状态",
    rating: "你的评分",
    notRated: "尚未评分",
    ratingWords: ["不适合我", "一般", "有兴趣", "很喜欢", "梦想项目"],
    rateAria: (n: number) => `评 ${n} 星（共 5 星）`,
    notes: "私人笔记",
    notesPlaceholder: "文书想法、需要联系的人、申请要求、喜欢的原因…",
    saving: "保存中…",
    saved: "已保存",
    saveError: "保存失败，点击重试",
    unsaved: "有未保存的更改",
    saveFailedToast: "保存失败，请检查网络后重试。",
    noMatches: "没有此状态的项目。",
    emptyTitle: "暂无收藏",
    emptyBody: "点击任意项目上的心形图标即可收藏，并在这里追踪截止日期。",
    browse: "浏览项目库",
    opens: "开放",
    fee: "费用",
    cost: "学费",
    free: "免费",
  },
} as const;

export type Copy = (typeof COPY)[Lang];

export function programName(p: SummerProgram, lang: Lang): string {
  return (lang === "zh" ? p.name_zh : null) || p.name_en;
}

export function programInstitution(p: SummerProgram, lang: Lang): string | null {
  return (lang === "zh" ? p.host_institution_zh : null) || p.host_institution_en || null;
}

const LOCALE: Record<Lang, string> = { en: "en-US", zh: "zh-CN" };

/** Formats a local calendar date. Deterministic for a given language. */
export function formatDay(
  date: Date,
  lang: Lang,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(LOCALE[lang], options).format(date);
}

/** "in 12 days", "Tomorrow", "3 days ago" … */
export function relativeDays(days: number, c: Copy): string {
  if (days === 0) return c.today;
  if (days === 1) return c.tomorrow;
  if (days > 1) return c.inDays(days);
  return c.daysAgo(-days);
}

export function urgencyLabel(urgency: Urgency, days: number, c: Copy): string {
  if (urgency === "today") return c.dueToday;
  if (days === 1) return c.dueTomorrow;
  return relativeDays(days, c);
}
