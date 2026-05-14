"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function handleSignIn(email: string, password: string) {
  const supabase = supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function handleSignUp(email: string, password: string) {
  const supabase = supabaseServer();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
