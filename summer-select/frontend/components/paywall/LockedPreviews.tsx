/**
 * Decorative stand-ins for the members-only pages. They are rendered blurred
 * behind the sign-up / upgrade prompt so visitors can see the *shape* of what
 * they would unlock. The text is invented sample copy; no member-only data is
 * ever sent to a visitor who hasn't paid.
 */
import { BookOpen, ChevronDown, Search, Sparkles, MessageSquare } from "lucide-react";

const card = "rounded-2xl bg-white border border-slate-200 shadow-sm";

const ESSAY_SAMPLES = [
  {
    program: "Research Mentorship Program",
    prompt: "Describe a question that keeps you up at night and how you would pursue it.",
    text: "The first time my pipette missed the well, I laughed. By the fortieth, I was reading about surface tension at midnight. What began as a failed titration became a question I could not put down: why do small errors hide the most interesting physics? I want to spend a summer learning how real labs turn a stubborn question into a method…",
  },
  {
    program: "Summer Science Institute",
    prompt: "Why this program, and what will you contribute to your cohort?",
    text: "I do not want a summer that simply decorates my transcript. I want one where I am the least experienced person in the room and the most curious. In my school's robotics club I learned to ask for help early, document failures, and celebrate other people's breakthroughs as if they were mine…",
  },
  {
    program: "Young Scholars Academy",
    prompt: "Tell us about an experience that shaped how you think.",
    text: "My grandmother kept a notebook of every recipe she never wrote down. Translating it taught me that precision and intuition are not opposites. Years later, when my first experiment failed, I opened that notebook again and started writing down what actually happened instead of what I expected…",
  },
  {
    program: "Pre-College Research Intensive",
    prompt: "What do you hope to learn that your school cannot teach you?",
    text: "Our school offers one statistics course, and I finished it in a semester. I started analysing public datasets on my own, and every answer opened three new questions. I am applying because I want a mentor who will tell me which of those questions are worth a summer…",
  },
];

export function EssaysPreview() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "#EEEEF7" }}>
          <BookOpen className="h-5 w-5" style={{ color: "#5B5F97" }} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "#3a3d6e" }}>Example Essays</h1>
          <p className="text-sm text-slate-500">Real essays, grouped by program and prompt</p>
        </div>
      </div>
      <div className={`${card} mb-5 flex items-center gap-2 px-4 py-3 text-sm text-slate-400`}>
        <Search className="h-4 w-4" /> Search programs or prompts…
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ESSAY_SAMPLES.map((e) => (
          <div key={e.program} className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5B5F97" }}>{e.program}</p>
            <p className="text-sm font-semibold text-slate-800 mb-3">{e.prompt}</p>
            <p className="text-sm leading-relaxed text-slate-600">{e.text}</p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "#FFF3CC", color: "#92600A" }}>Admitted</span>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600">2025</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const QUESTIONS = [
  { q: "Tell me about a time a project didn't go the way you planned.", a: "Start with the stakes, then spend most of your answer on what you changed afterwards. Interviewers care less about the failure than about the iteration. Use one concrete detail, such as a number or a decision…" },
  { q: "Why are you interested in this field?", a: "Anchor the answer in a specific moment rather than a general passion. Name the question you were left with, then connect it to something the program actually teaches…" },
  { q: "What would you do if your mentor disagreed with your approach?", a: "Show that you can hold a position and still update. Explain how you would test both ideas before debating them…" },
  { q: "What questions do you have for us?", a: "Ask about how students and mentors interact day to day, not about perks. One thoughtful question beats three generic ones…" },
  { q: "Describe your biggest strength in a team.", a: "Pick one strength and prove it with a short story. Avoid lists; interviewers remember a single clear example…" },
];

export function InterviewsPreview() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F0" }}>
          <MessageSquare className="h-5 w-5" style={{ color: "#FF6B6C" }} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "#3a3d6e" }}>Interview Prep</h1>
          <p className="text-sm text-slate-500">Questions interviewers actually ask, with how to answer them</p>
        </div>
      </div>
      <div className="space-y-3">
        {QUESTIONS.map((x, i) => (
          <div key={x.q} className={`${card} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">{x.q}</p>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            </div>
            {i < 2 && <p className="mt-3 text-sm leading-relaxed text-slate-600">{x.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvaluatePreview() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "#FFF8EC" }}>
          <Sparkles className="h-5 w-5" style={{ color: "#C98A00" }} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "#3a3d6e" }}>Essay Evaluator</h1>
          <p className="text-sm text-slate-500">Paste a draft and get feedback grounded in the example essays</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${card} p-5`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your draft</p>
          <p className="text-sm leading-relaxed text-slate-700">
            Ever since I joined the school science fair, I have been fascinated by how small design choices change an experiment&apos;s outcome. Last spring I rebuilt my water-filtration prototype three times, and each failure taught me something a textbook could not. This summer I want to learn how professional researchers decide which failures are worth chasing…
          </p>
          <div className="mt-4 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: "#5B5F97" }}>
            Evaluate my essay
          </div>
        </div>
        <div className={`${card} p-5`}>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-5xl font-black" style={{ color: "#5B5F97" }}>8.2</span>
            <span className="text-sm font-semibold text-slate-400 mb-1.5">/ 10</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><strong className="text-slate-800">Strength:</strong> a concrete, memorable opening scene.</li>
            <li><strong className="text-slate-800">Improve:</strong> tie the prototype to what you hope to learn next.</li>
            <li><strong className="text-slate-800">Compare:</strong> similar to a strong example essay that quantifies the result.</li>
            <li><strong className="text-slate-800">Next step:</strong> cut the first sentence and start with the failed prototype.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
