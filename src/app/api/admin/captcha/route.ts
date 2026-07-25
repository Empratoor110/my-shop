import { NextResponse } from "next/server";
import { captchaStore } from "./store";

export async function GET() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

  captchaStore.set(token, answer);

  return NextResponse.json({
    token,
    question: `${num1} + ${num2} = ?`,
  });
}