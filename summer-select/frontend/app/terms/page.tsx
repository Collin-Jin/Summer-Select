import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions · Summer Select",
};

type Subsection = {
  heading: string | null;
  content: string | null;
  list?: string[];
};

type Section = {
  number: string;
  title: string;
  body?: string | null;
  subsections?: Subsection[];
  contact?: boolean;
};

const sections: Section[] = [
  {
    number: "1.",
    title: "ACCEPTANCE OF TERMS",
    body: "By utilizing the Services, you acknowledge that you have read, understood, and agree to be legally bound by these Terms. The Site provides an aggregated database of high school summer research programs and related application resources, including but not limited to past interview questions and successful applicant essays.",
  },
  {
    number: "2.",
    title: "INTELLECTUAL PROPERTY AND PROHIBITION ON REDISTRIBUTION",
    body: null,
    subsections: [
      {
        heading: null,
        content:
          "All materials provided on the Site, including the aggregated database, text, essays, interview questions, graphics, and underlying structure (collectively, \"Site Content\"), are the exclusive property of Summer Select or its content suppliers and are protected by applicable intellectual property laws.",
      },
      {
        heading: null,
        content:
          "You are granted a limited, personal, non-exclusive, non-transferable, and revocable license to access and use the Site Content solely for your own personal, non-commercial use in preparing your own summer program applications.",
      },
      {
        heading: "Strictly Prohibited Actions:",
        content: null,
        list: [
          "Copy, reproduce, distribute, publicly display, or perform any Site Content.",
          "Share, forward, sell, or license access to the essays, interview questions, or database information to any third party, whether for profit or free of charge.",
          "Scrape, extract, download, or otherwise harvest data from the Site using automated or manual means to create a derivative database or alternative service.",
          "Post or publish any materials from the Site on other websites, forums, social media, or public platforms.",
        ],
      },
      {
        heading: null,
        content:
          "Any violation of these prohibitions constitutes a material breach of these Terms and will result in the immediate termination of your access to the Site, and may subject you to civil and criminal liability.",
      },
    ],
  },
  {
    number: "3.",
    title: "DISCLAIMER OF WARRANTIES AND ACCURACY OF INFORMATION",
    body: "The Site and all Site Content are provided on an \"AS IS\" and \"AS AVAILABLE\" basis without warranties of any kind, either express or implied.",
    subsections: [
      {
        heading: "No Guarantee of Accuracy:",
        content:
          "While we strive to aggregate and provide useful information, the details regarding summer programs—including admission criteria, dates, tuition costs, and application requirements—are subject to change by the respective program administrators without notice. We make no representations or warranties regarding the accuracy, completeness, reliability, or timeliness of the information provided in the database.",
      },
      {
        heading: "No Guarantee of Admission:",
        content:
          "The provision of past successful essays and interview questions is for informational and educational purposes only. We do not guarantee, represent, or warrant that reviewing or utilizing these resources will result in admission to any summer program.",
      },
    ],
  },
  {
    number: "4.",
    title: "LIMITATION OF LIABILITY",
    body: "To the fullest extent permitted by applicable law, Summer Select, its owners, operators, affiliates, and contributors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the Site or the Site Content.\n\nThis includes, without limitation, liability for any errors, omissions, or inaccuracies in the database, or any decisions made or actions taken by you in reliance upon the information provided on the Site. You assume full responsibility and risk for your use of the Site and your application outcomes.",
  },
  {
    number: "5.",
    title: "USER ACCOUNTS AND SECURITY",
    body: "If the Site requires you to create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate your account at our sole discretion if we suspect unauthorized sharing of access or violation of these Terms.",
  },
  {
    number: "6.",
    title: "MODIFICATIONS TO THE TERMS",
    body: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. The most current version will be posted on the Site with an updated effective date. Your continued use of the Site following the posting of any changes constitutes acceptance of those changes.",
  },
  {
    number: "7.",
    title: "GOVERNING LAW AND JURISDICTION",
    body: "These Terms shall be governed by and construed in accordance with the laws of the State of Illinois, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in Illinois, and the parties hereby irrevocably consent to the personal jurisdiction and venue therein.",
  },
  {
    number: "8.",
    title: "CONTACT INFORMATION",
    body: null,
    contact: true,
  },
];

export default function TermsPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 60%, #2a1f5e 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFB", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
        >
          {/* Header */}
          <div
            className="px-8 py-8"
            style={{ background: "linear-gradient(135deg, #3a3d6e 0%, var(--color-brand-500) 100%)" }}
          >
            <p
              className="text-3xl font-extrabold tracking-tight uppercase leading-none"
              style={{ fontFamily: "var(--font-syne, sans-serif)", color: "#FFFFFB", letterSpacing: "0.05em" }}
            >
              Terms &amp; Conditions
            </p>
            <p className="text-sm mt-2 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
              Summer Select · Last Updated: June 17, 2026
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
            {/* Intro */}
            <p>
              Welcome to <strong>Summer Select</strong>. These Terms and Conditions (&ldquo;Terms&rdquo;) govern
              your access to and use of the Summer Select website, located at{" "}
              <strong>collinxuezhang.com</strong> (the &ldquo;Site&rdquo;), and all content, databases, services,
              and materials provided therein (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing, registering for, or using the Site, you agree to be bound by these Terms. If you do
              not agree to these Terms, you may not access or use the Site.
            </p>

            <hr style={{ borderColor: "#EEEEF7" }} />

            {sections.map((section) => (
              <div key={section.number} className="space-y-3">
                <h2
                  className="text-base font-extrabold tracking-wide"
                  style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}
                >
                  {section.number}&nbsp;{section.title}
                </h2>

                {section.body && (
                  <div className="space-y-3">
                    {section.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

                {section.subsections?.map((sub, i) => (
                  <div key={i} className="space-y-2">
                    {sub.heading && (
                      <p className="font-semibold" style={{ color: "var(--color-brand-600)" }}>
                        {sub.heading}
                      </p>
                    )}
                    {sub.content && <p>{sub.content}</p>}
                    {sub.list && (
                      <ul className="list-disc list-inside space-y-1.5 pl-2" style={{ color: "#4B5563" }}>
                        {sub.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {section.contact && (
                  <p>
                    If you have any questions or concerns regarding these Terms and Conditions, please contact us
                    at{" "}
                    <a
                      href="mailto:CollinJin2029@u.northwestern.edu"
                      className="font-semibold hover:underline underline-offset-2"
                      style={{ color: "var(--color-brand-500)" }}
                    >
                      CollinJin2029@u.northwestern.edu
                    </a>
                    .
                  </p>
                )}
              </div>
            ))}

            <hr style={{ borderColor: "#EEEEF7" }} />

            <p className="text-xs text-slate-400 text-center">
              &copy; {new Date().getFullYear()} Summer Select · All rights reserved
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Summer Select &copy; {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}
