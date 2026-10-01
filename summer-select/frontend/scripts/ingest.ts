import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error("Missing environment variables. Check your .env.local file!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function main() {
  console.log("Reading essays from data/essays.json...");
  const filePath = path.join(process.cwd(), 'essaydata', 'essays.json');
  const essays = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const essay of essays) {
    console.log(`Generating embedding for: ${essay.program}...`);
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: essay.content,
    });
    
    const embedding = embeddingResponse.data[0].embedding;

    console.log(`Saving to Supabase...`);
    
    const { error } = await supabase
      .from('program_documents')
      .insert({
        content: essay.content,
        metadata: { program: essay.program, prompt: essay.prompt },
        embedding: embedding
      });

    if (error) {
        console.error("Error inserting:", error);
    } else {
        console.log(`Successfully saved ${essay.program}!`);
    }
  }
  console.log("Ingestion complete!");
}

main();