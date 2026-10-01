import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/utils/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ESSAY_CHARS = 20_000;

const SYSTEM_PROMPT = `You are an expert STEM summer program admissions reviewer with years of experience reading applications for competitive programs (e.g. research-intensive and pre-college STEM programs).

You will receive:
1. REFERENCE DOCUMENTS: past essays and materials from real programs, which show what strong, specific, authentic writing looks like.
2. A STUDENT ESSAY: the draft to evaluate.

Use the reference documents as your benchmark. Compare the student's draft against them and give specific, actionable feedback. Quote short phrases from the student's essay when pointing out issues. Never rewrite the whole essay and never fabricate details about the student.

Format your response in Markdown with these sections:
## Overall Impression
A 2-3 sentence honest summary.
## Strengths
Bulleted, each tied to something concrete in the draft.
## Areas to Improve
Bulleted, ordered by impact. For each, explain the problem and exactly how to fix it, referencing the reference documents where useful.
## Suggested Next Steps
A short numbered list of concrete revisions to make in the next draft.`;

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey || !openaiKey) {
      const missing = [
        !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
        !supabaseKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        !openaiKey && "OPENAI_API_KEY",
      ].filter(Boolean);
      console.error(
        `[evaluate] Missing required environment variables: ${missing.join(", ")}`
      );
      return NextResponse.json(
        { error: "Server is not configured correctly." },
        { status: 500 }
      );
    }

    // This endpoint spends OpenAI credits, so require a signed-in user.
    const authClient = await supabaseServer();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const essay =
      typeof (body as { essay?: unknown })?.essay === "string"
        ? (body as { essay: string }).essay.trim()
        : "";

    if (!essay) {
      return NextResponse.json(
        { error: "An `essay` string is required." },
        { status: 400 }
      );
    }
    if (essay.length > MAX_ESSAY_CHARS) {
      return NextResponse.json(
        { error: `Essay is too long (max ${MAX_ESSAY_CHARS} characters).` },
        { status: 413 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Embed the student's essay.
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: essay,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Retrieve similar past essays.
    const { data: documents, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 3,
      }
    );

    if (matchError) {
      console.error("[evaluate] match_documents error:", matchError);
      return NextResponse.json(
        { error: "Failed to retrieve reference documents." },
        { status: 500 }
      );
    }

    // 3. Combine retrieved content into a single context string.
    const context = ((documents ?? []) as { content?: string }[])
      .map((d) => d.content)
      .filter((c): c is string => typeof c === "string" && c.length > 0)
      .map((c, i) => `--- Reference Document ${i + 1} ---\n${c}`)
      .join("\n\n");

    // 4. Generate feedback.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `REFERENCE DOCUMENTS:\n${
            context || "(No closely matching reference documents were found. Rely on your general expertise.)"
          }\n\nSTUDENT ESSAY:\n${essay}`,
        },
      ],
    });

    const feedback = completion.choices[0]?.message?.content;
    if (!feedback) {
      return NextResponse.json(
        { error: "The AI returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("[evaluate] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong while evaluating your essay." },
      { status: 500 }
    );
  }
}
