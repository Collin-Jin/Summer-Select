"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

function getAuthFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function handleSignIn(formData: FormData) {
  const { email, password } = getAuthFields(formData);
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function handleSignUp(formData: FormData) {
  const { email, password } = getAuthFields(formData);
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Supabase returns 400 with messages like "User already registered".
    const msg = error.message.toLowerCase();
    if (msg.includes("already") && msg.includes("registered")) {
      return { error: "That email is already registered. Please sign in instead." };
    }
    if (msg.includes("duplicate")) {
      return { error: "That email is already registered. Please sign in instead." };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}
