export function StatCard({ label, value, suffix, tone = "default" }: { label: string; value: string | number; suffix?: string; tone?: "default" | "good" | "bad" }) {
  return <div className="panel p-5"><div className="label mb-3">{label}</div><div className={`text-3xl font-black ${tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-red-400" : "text-white"}`}>{value}<span className="ml-1 text-base text-[#a3a39f]">{suffix}</span></div></div>;
}
export function Empty({ children }: { children: React.ReactNode }) { return <div className="panel p-10 text-center text-[#a3a39f]">{children}</div>; }

