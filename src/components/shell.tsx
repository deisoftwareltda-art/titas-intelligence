"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, CalendarDays, LayoutDashboard, LogOut, Menu, Shield, Swords, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/atletas", label: "Atletas", icon: Users },
  { href: "/adversarios", label: "Adversários", icon: Shield },
  { href: "/partidas", label: "Partidas", icon: CalendarDays },
  { href: "/scout", label: "Scout ao vivo", icon: Swords },
];

export function Shell({ children, title, eyebrow = "Temporada 2026" }: { children: React.ReactNode; title: string; eyebrow?: string }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  useEffect(() => { if (!localStorage.getItem("titas-session")) router.replace("/"); }, [router]);
  const logout = () => { localStorage.removeItem("titas-session"); router.replace("/"); };
  return <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
    <aside className={`${open ? "flex" : "hidden"} fixed inset-0 z-40 flex-col bg-[#111311] p-5 lg:static lg:flex lg:min-h-screen lg:border-r lg:border-[#30332f]`}>
      <div className="mb-10 flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-xl bg-white" style={{ width: 56, height: 56, flex: "0 0 56px" }}><img src="/logo-titas.jpeg" alt="Escudo do Titãs Vôlei" width="56" height="56" style={{ display: "block", width: 56, height: 56, objectFit: "cover" }}/></div><div><div className="text-lg font-black tracking-tight">TITÃS</div><div className="text-xs tracking-[.22em] text-[#a3a39f]">INTELLIGENCE</div></div></div><button className="lg:hidden" onClick={() => setOpen(false)}><X/></button></div>
      <nav className="space-y-2">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${pathname.startsWith(href) ? "bg-[#e8b923] text-[#111]" : "text-[#b9bbb7] hover:bg-[#202321] hover:text-white"}`}><Icon size={19}/>{label}</Link>)}</nav>
      <div className="mt-auto rounded-xl border border-[#30332f] p-4"><div className="text-sm font-bold">Comissão Técnica</div><div className="mb-3 text-xs text-[#a3a39f]">Administrador</div><button onClick={logout} className="flex items-center gap-2 text-sm text-[#a3a39f] hover:text-white"><LogOut size={16}/> Sair</button></div>
    </aside>
    <main className="min-w-0"><header className="flex h-20 items-center gap-4 border-b border-[#30332f] px-5 lg:px-8"><button className="lg:hidden" onClick={() => setOpen(true)}><Menu/></button><div><div className="label">{eyebrow}</div><h1 className="text-xl font-black lg:text-2xl">{title}</h1></div><div className="ml-auto hidden text-right sm:block"><div className="text-xs font-bold text-[#e8b923]">TITÃS VÔLEI</div><div className="text-xs text-[#a3a39f]">Garanhuns · PE</div></div></header><div className="p-5 lg:p-8">{children}</div></main>
  </div>;
}

