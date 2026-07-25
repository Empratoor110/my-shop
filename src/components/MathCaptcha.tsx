"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface MathCaptchaProps {
  onChange: (token: string, answer: string) => void;
}

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#059669", "#ea580c", "#0891b2"];

export default function MathCaptcha({ onChange }: MathCaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [spinning, setSpinning] = useState(false);

  const drawCaptcha = useCallback((text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // پس‌زمینه گرادیانت
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#eef2ff");
    gradient.addColorStop(1, "#f5f3ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // خط‌های نویز
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = COLORS[Math.floor(Math.random() * COLORS.length)] + "55";
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // نقطه‌های نویز
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)] + "40";
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // متن با چرخش و رنگ تصادفی برای هر کاراکتر
    const chars = text.split("");
    const charWidth = w / (chars.length + 1);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "bold 24px Arial, sans-serif";

    chars.forEach((ch, i) => {
      ctx.save();
      const x = charWidth * (i + 1);
      const y = h / 2 + (Math.random() * 8 - 4);
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 26 - 13) * (Math.PI / 180));
      ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)];
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, []);

  const fetchCaptcha = useCallback(async () => {
    setSpinning(true);
    try {
      const res = await fetch("/api/admin/captcha");
      const data = await res.json();
      setQuestion(data.question);
      setToken(data.token);
      setAnswer("");
      onChange(data.token, "");
    } finally {
      setTimeout(() => setSpinning(false), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  useEffect(() => {
    if (question) drawCaptcha(question);
  }, [question, drawCaptcha]);

  function handleAnswerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAnswer(e.target.value);
    onChange(token, e.target.value);
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-4">
      <label className="text-sm text-gray-600 mb-2 block">
        برای تأیید اینکه انسان هستید، حاصل عبارت را وارد کنید:
      </label>
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <canvas
          ref={canvasRef}
          width={110}
          height={44}
          className="rounded-lg shadow-inner border border-indigo-200 shrink-0"
        />
        <input
          type="number"
          placeholder="پاسخ"
          value={answer}
          onChange={handleAnswerChange}
          className="min-w-0 flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          dir="ltr"
        />
        <button
          type="button"
          onClick={fetchCaptcha}
          className={`shrink-0 text-indigo-400 hover:text-indigo-600 p-2 transition-transform duration-300 ${
            spinning ? "rotate-180" : ""
          }`}
          title="تغییر سؤال"
        >
          🔄
        </button>
      </div>
    </div>
  );
}
