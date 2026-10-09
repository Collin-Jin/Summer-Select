import {
  Award, ShieldCheck, Crosshair, BarChart3, Lightbulb, FileText, Bot,
  MessagesSquare, Bookmark, Search, UserPlus, Unlock,
  type LucideIcon,
} from "lucide-react";

export type Bi = { en: string; zh: string };

export { CONTACT } from "@/lib/contact";

/** Programs Collin has coached students into. Shown in the hero marquee. */
export const COACHED_PROGRAMS = [
  "UCSB RMP",
  "UCSB SRA",
  "UCSC SIP",
  "UChicago RIBS",
  "The Summer Science Program",
  "Pioneer Academics",
] as const;

export const copy = {
  ctaLogin: { en: "Log in or create account", zh: "登录 / 注册" },
  ctaBrowse: { en: "Browse the Program Directory", zh: "浏览项目库" },
  ctaBrowseNote: { en: "Free · no sign-up needed", zh: "免费 · 无需注册" },

  heroEyebrow: { en: "The #1 Summer Program Platform", zh: "顶尖暑期项目平台" },
  heroSub: {
    en: "Applying to competitive summer programs shouldn't be a guessing game. Hand-verified programs, real strategy, and 60+ example essays — all in one place.",
    zh: "申请竞争激烈的暑期项目，不应该是一场猜谜游戏。人工核实的项目、真实的申请策略、60+ 篇范文——尽在一处。",
  },
  heroScroll: { en: "Scroll", zh: "向下" },
  heroPillPrograms: { en: "programs live now", zh: "个项目已上线" },
  heroPillEssays: { en: "example essays", zh: "篇范文" },
  heroPillBilingual: { en: "EN / 中文", zh: "中 / EN" },
  marqueeLabel: { en: "Students coached into", zh: "辅导学生成功录取" },

  founderEyebrow: { en: "A Note from the Founder", zh: "创始人寄语" },

  statsEyebrow: { en: "Coaching Results", zh: "辅导成果" },
  statsH2: { en: "The results?", zh: "成果如何？" },
  stat1Title: { en: "UCSB RMP Acceptances", zh: "UCSB RMP 录取" },
  stat1Body: { en: "Including a 9th grader with zero prior research experience!", zh: "包括一位零研究经验的 9 年级学生！" },
  stat2Title: { en: "Elite Program Admissions", zh: "顶尖项目录取" },
  stat2Body: { en: "UCSB SRA, UCSC SIP, UChicago RIBS, The Summer Science Program, and Pioneer Academics.", zh: "UCSB SRA、UCSC SIP、UChicago RIBS、暑期科学项目及 Pioneer Academics。" },
  stat3Title: { en: "Students Mentored", zh: "辅导学生人数" },
  stat3Body: { en: "And counting — across all grade levels and research backgrounds.", zh: "持续增长中——涵盖所有年级与科研背景的学生。" },
  statsClosing: {
    en: "I achieved this while overloading my college schedule. But there are only so many hours in the day—I want to help more ambitious students navigate this competitive landscape. That's why I built SUMMER SELECT.",
    zh: "这一切都是在我本科课业繁重的情况下完成的。但一天的时间毕竟有限——我希望帮助更多有志向的学生在竞争激烈的赛道上找到方向。这就是我打造 SUMMER SELECT 的初衷。",
  },

  platformEyebrow: { en: "Inside the Platform", zh: "平台内容一览" },
  platformH2: { en: "Everything you need, already built", zh: "你需要的一切，早已备好" },
  platformStats: {
    programs: { en: "Programs, hand-verified", zh: "个项目，人工核实" },
    essays: { en: "Example essays", zh: "篇范文" },
    prompts: { en: "Essay prompts covered", zh: "个文书题目" },
    interview: { en: "Interview questions", zh: "道面试题" },
  },
  platformStrip: {
    manual: { en: "100% manually reviewed", zh: "100% 人工审核" },
  },

  valueEyebrow: { en: "Why SUMMER SELECT", zh: "为何选择 SUMMER SELECT" },
  valueH2: { en: "The ultimate database for ambitious students", zh: "专为上进学生打造的终极数据库" },
  valueSub: {
    en: "SUMMER SELECT is the meticulously organized directory designed to streamline your summer application process.",
    zh: "SUMMER SELECT 是专为简化暑期申请流程而精心整理的项目数据库。",
  },

  reasonsEyebrow: { en: "6 reasons to register", zh: "注册的 6 大理由" },
  reasonsH2: { en: "What you unlock, step by step", zh: "逐级解锁，你能获得什么" },
  reasonsSub: {
    en: "Browsing is free. A free account adds Collin's analysis and My List. Full access adds essays, the evaluator and interview prep.",
    zh: "浏览免费。免费账户可查看 Collin 的分析并使用“我的列表”。完整权限再解锁范文、文书评估与面试准备。",
  },

  stepsEyebrow: { en: "How it works", zh: "使用流程" },
  stepsH2: { en: "From curious to confident in 3 steps", zh: "三步，从迷茫到笃定" },

  ctaBody: {
    en: "Stop stressing over where to find the right programs and start focusing on crafting the perfect application. Ready to level up your summer?",
    zh: "不再为寻找合适项目而焦虑，专注打磨每一份申请材料。准备好让你的暑假焕然一新了吗？",
  },
  ctaBtn: { en: "See what full access includes", zh: "查看完整权限包含什么" },

  tableEyebrow: { en: "Pricing", zh: "定价" },
  tableH2: { en: "Free vs Paid", zh: "免费 vs 付费" },
  tableHeaders: {
    feature: { en: "Feature", zh: "功能" },
    free: { en: "Free", zh: "免费" },
    paid: { en: "Paid ✦", zh: "付费 ✦" },
  },
  freeFeatures: [
    { en: "Browse the full Program Directory", zh: "浏览完整项目库" },
    { en: "Advanced search & filters", zh: "高级搜索与筛选" },
    { en: "Collin Index scores", zh: "Collin 指数评分" },
    { en: "Collin's analysis & application strategy (free account)", zh: "Collin 的分析与申请策略（免费账户）" },
    { en: "Save programs to My List (free account)", zh: "收藏项目到我的列表（免费账户）" },
    { en: "Bilingual content (EN / 中文)", zh: "中英双语内容" },
  ] as Bi[],
  paidFeatures: [
    { en: "Example essays (60+ essays)", zh: "范文参考（60+ 篇）" },
    { en: "AI essay evaluator", zh: "AI 文书评估" },
    { en: "Interview Q&A guides", zh: "面试问答指南" },
  ] as Bi[],

  contactBadge: { en: "Get full access", zh: "获取完整权限" },
  contactH2: { en: "Ready to get full access?", zh: "准备好获取完整访问权限了吗？" },
  contactLead: {
    en: "Want the example essays, the AI evaluator and interview prep? Message Collin directly on WeChat, Instagram or email. Tell me the email you signed up with and I'll upgrade your account.",
    zh: "想要范文、AI 文书评估和面试准备？直接通过微信、Instagram 或邮箱联系 Collin。告诉我你的注册邮箱，我会为你升级账户。",
  },
  contactSteps: [
    { en: "Create your free account", zh: "创建免费账户" },
    { en: "Message Collin on WeChat, Instagram or email", zh: "通过微信、Instagram 或邮箱联系 Collin" },
    { en: "Get upgraded to full access", zh: "升级为完整权限" },
  ] as Bi[],
  wechatLabel: { en: "WeChat", zh: "微信" },
  emailLabel: { en: "Email", zh: "邮箱" },
  copy: { en: "Copy", zh: "复制" },
  copied: { en: "Copied!", zh: "已复制！" },
  openInstagram: { en: "Open", zh: "打开" },
  sendEmail: { en: "Send email", zh: "发邮件" },
  contactFoot: {
    en: "Questions first? Message me anyway — happy to help you pick the right programs.",
    zh: "想先咨询？直接来聊——我很乐意帮你挑选合适的项目。",
  },
};

export type Reason = { icon: LucideIcon; title: Bi; body: Bi; chip: Bi; accent: string; bg: string };

export const reasons: Reason[] = [
  {
    icon: BarChart3,
    title: { en: "The Collin Index", zh: "Collin 指数" },
    body: {
      en: "Every program is scored from 1–10 and sorted into Tier 1, 2 or 3, so you instantly see how selective it is and where to aim.",
      zh: "每个项目都有 1–10 的评分，并划分为第一、二、三梯队，让你一眼看清竞争程度与申请方向。",
    },
    chip: { en: "Free for everyone", zh: "人人免费" },
    accent: "#5B5F97", bg: "#EEEEF7",
  },
  {
    icon: Lightbulb,
    title: { en: "Collin's analysis & strategy", zh: "Collin 的分析与策略" },
    body: {
      en: "Why a program is worth it and how to approach the application — the rationale and strategy behind every listing.",
      zh: "每个项目为什么值得申请、该如何准备——每条项目背后的分析与申请策略。",
    },
    chip: { en: "Free account", zh: "免费账户" },
    accent: "#FFC145", bg: "#FFF8EC",
  },
  {
    icon: FileText,
    title: { en: "60+ example essays", zh: "60+ 篇范文" },
    body: {
      en: "Real essays across 30 prompts, edited to protect student privacy, so you can see what a strong answer looks like before you write yours.",
      zh: "涵盖 30 个题目的真实文书，经编辑以保护学生隐私，写作之前先看看优秀答案长什么样。",
    },
    chip: { en: "Full access", zh: "完整权限" },
    accent: "#FF6B6C", bg: "#FFF0F0",
  },
  {
    icon: Bot,
    title: { en: "AI essay evaluator", zh: "AI 文书评估" },
    body: {
      en: "Paste your draft and get feedback grounded in the example essays, so you can iterate at midnight without waiting on anyone.",
      zh: "粘贴你的草稿，获得基于范文库的反馈——深夜也能反复打磨，无需等待任何人。",
    },
    chip: { en: "Full access", zh: "完整权限" },
    accent: "#5B5F97", bg: "#EEEEF7",
  },
  {
    icon: MessagesSquare,
    title: { en: "75+ interview questions", zh: "75+ 道面试题" },
    body: {
      en: "Interview Q&A guides so a program interview is something you've already practiced, not something that surprises you.",
      zh: "面试问答指南，让项目面试成为你早已练习过的场景，而非临场惊吓。",
    },
    chip: { en: "Full access", zh: "完整权限" },
    accent: "#FFC145", bg: "#FFF8EC",
  },
  {
    icon: Bookmark,
    title: { en: "Your personal shortlist", zh: "你的专属收藏夹" },
    body: {
      en: "Save programs to My List and keep your whole summer plan in one place instead of 40 browser tabs.",
      zh: "把项目收藏到“我的列表”，整个暑期计划集中管理，告别 40 个浏览器标签页。",
    },
    chip: { en: "Free account", zh: "免费账户" },
    accent: "#FF6B6C", bg: "#FFF0F0",
  },
];

export type ValueCard = { icon: LucideIcon; title: Bi; body: Bi; accent: string; bg: string };

export const valueCards: ValueCard[] = [
  {
    icon: Award,
    title: { en: "Built by an Insider", zh: "内行人打造" },
    body: { en: "Created by someone who walked the walk, got accepted, and coached others to do the same.", zh: "由真正走过这条路、亲历录取、并带领他人成功的人创建。" },
    accent: "#5B5F97", bg: "#EEEEF7",
  },
  {
    icon: ShieldCheck,
    title: { en: "Unmatched Quality Control", zh: "无与伦比的质量把控" },
    body: { en: "Forget messy, AI-scraped lists with outdated links. Every program is manually reviewed for accuracy.", zh: "告别杂乱无章、满是失效链接的 AI 抓取列表。每个项目均经过人工核实，确保信息准确可靠。" },
    accent: "#FF6B6C", bg: "#FFF0F0",
  },
  {
    icon: Crosshair,
    title: { en: "Strategic Selection", zh: "精准项目匹配" },
    body: { en: "Find programs that fit your exact background — whether you're a seasoned researcher or a 9th grader seeking your first opportunity.", zh: "无论你是经验丰富的高中科研生，还是寻找第一个机会的 9 年级新生，都能找到最适合你的项目。" },
    accent: "#FFC145", bg: "#FFF8EC",
  },
];

export const steps: { icon: LucideIcon; title: Bi; body: Bi }[] = [
  {
    icon: Search,
    title: { en: "Browse for free", zh: "免费浏览" },
    body: { en: "Search and filter the Program Directory and see every Collin Index score. No account needed.", zh: "搜索并筛选项目库，查看每个项目的 Collin 指数。无需账号。" },
  },
  {
    icon: UserPlus,
    title: { en: "Create a free account", zh: "创建免费账户" },
    body: { en: "Instantly unlock Collin's analysis and strategy for every program, and save programs to My List.", zh: "立即解锁每个项目的 Collin 分析与申请策略，并可收藏项目到“我的列表”。" },
  },
  {
    icon: Unlock,
    title: { en: "Upgrade for full access", zh: "升级解锁全部" },
    body: { en: "Message Collin to get upgraded and open the example essays, the evaluator and interview guides.", zh: "联系 Collin 升级账户，即可解锁范文、文书评估与面试指南。" },
  },
];

export const founderText = {
  en: `Hi, I'm Collin Jin. Just a couple of years ago, I was exactly where you are—DIYing my entire application process for summer programs and colleges. That hustle paid off: I got admitted to UCSB RMP and SRA, Harvey Mudd, and am now pursuing a dual degree in Electrical Engineering & CS at Northwestern's McCormick School of Engineering.\n\nAfter cracking the formula for standing out, I started mentoring students in the 2025–2026 application cycle. That's why I built SUMMER SELECT.`,
  zh: `大家好，我是 Collin Jin。就在几年前，我和你一样——自己摸索着申请暑期项目和大学的全流程。那段努力没有白费：我成为了 UCSB RMP 和 SRA 的校友，被 Harvey Mudd 录取，目前正在西北大学麦考密克工程学院攻读电气工程与计算机科学双学位。\n\n在摸索出一套脱颖而出的方法论后，我开始在 2025–2026 申请季为学生提供指导。这就是我打造 SUMMER SELECT 的初衷。`,
};
