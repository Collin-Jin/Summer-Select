"use client";

import { useState, FormEvent } from "react";
import { handleSignIn, handleSignUp } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent, action: "signIn" | "signUp") => {
    e.preventDefault();
    setError(null);

    const result =
      action === "signIn"
        ? await handleSignIn(email, password)
        : await handleSignUp(email, password);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="w-[48%] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={(e) => onSubmit(e, "signIn")}
            >
              Sign In
            </button>
            <button
              type="submit"
              className="w-[48%] px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={(e) => onSubmit(e, "signUp")}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
