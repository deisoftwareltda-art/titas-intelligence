"use client";

import { Activity, ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  useEffect(() => { try { if (JSON.parse(localStorage.getItem("titas-session") ?? "{}").accessKey) router.replace("/dashboard"); } catch {} }, [router]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!email.includes("@") || password.length < 4) return setError("Informe um e-mail válido e senha com 4 caracteres.");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Não foi possível entrar.");
    localStorage.setItem("titas-session", JSON.stringify(payload)); window.location.assign("/dashboard");
  };
  return <main className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
    <section className="relative hidden overflow-hidden border-r border-[#30332f] bg-[#151815] p-14 lg:flex lg:flex-col"><div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#e8b923]/10 blur-3xl"/><div className="flex items-center gap-3 font-black"><div className="h-16 w-16 overflow-hidden rounded-xl bg-white" style={{ width: 64, height: 64, flex: "0 0 64px" }}><img src="/logo-titas.jpeg" alt="Escudo do Titãs Vôlei" width="64" height="64" style={{ display: "block", width: 64, height: 64, objectFit: "cover" }}/></div><span>TITÃS INTELLIGENCE</span></div><div className="my-auto max-w-xl"><div className="label mb-5 text-[#e8b923]">Performance & Scouting</div><h1 className="text-5xl font-black leading-[1.05]">Cada rali revela uma vantagem.</h1><p className="mt-6 text-lg leading-8 text-[#a3a39f]">Dados de jogo transformados em decisões claras para a comissão técnica do Titãs Vôlei.</p><div className="mt-10 grid grid-cols-3 gap-3">{[[Zap,"Registro rápido"],[BarChart3,"Leitura precisa"],[ShieldCheck,"Dados auditáveis"]].map(([Icon,label]) => { const I = Icon as typeof Zap; return <div key={String(label)} className="panel p-4"><I className="mb-3 text-[#e8b923]" size={20}/><div className="text-sm font-bold">{String(label)}</div></div>})}</div></div><div className="text-xs text-[#6f726e]">Titãs Vôlei · Garanhuns, Pernambuco</div></section>
    <section className="flex items-center justify-center p-6"><form onSubmit={submit} autoComplete="off" className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 lg:hidden"><div className="h-16 w-16 overflow-hidden rounded-xl bg-white" style={{ width: 64, height: 64, flex: "0 0 64px" }}><img src="/logo-titas.jpeg" alt="Escudo do Titãs Vôlei" width="64" height="64" style={{ display: "block", width: 64, height: 64, objectFit: "cover" }}/></div><div><div className="font-black">TITÃS INTELLIGENCE</div><div className="label text-[#e8b923]">Performance & Scouting</div></div></div><div className="label mb-3 text-[#e8b923]">Acesso restrito</div><h2 className="text-3xl font-black">Bem-vindo à quadra.</h2><p className="mb-8 mt-2 text-[#a3a39f]">Entre para acessar dados, partidas e scout.</p><label className="mb-2 block text-sm font-bold">E-mail</label><input className="input mb-5" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="off"/><label className="mb-2 block text-sm font-bold">Senha</label><input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="new-password"/>{error && <p className="mt-3 text-sm text-red-400">{error}</p>}<button className="btn-primary mt-6 flex w-full items-center justify-center gap-2">Entrar <ArrowRight size={18}/></button></form></section>
  </main>;
}




