const rows = [
  { label: "Rede", zones: [4, 3, 2] },
  { label: "Fundo", zones: [5, 6, 1] },
];

export function SetterCourt({ rotation, setterName, onChange }: { rotation: number; setterName?: string; onChange: (position: number) => void }) {
  return <div className="mx-auto mt-4 w-full max-w-[280px]">
    <div className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#a3a39f]"><span>Rede</span><span className="h-[3px] flex-1 bg-[#e8b923]"/></div>
    <div className="rounded-lg border-2 border-[#d8c99b]/50 bg-[#315d4b] p-1 shadow-inner">
      {rows.map((row, rowIndex) => <div key={row.label} className={"grid grid-cols-3 "+(rowIndex === 0 ? "border-b border-white/30" : "")}>
        {row.zones.map(position => {
          const active = position === rotation;
          return <button type="button" key={position} onClick={() => onChange(position)} aria-label={"Levantador na posição P"+position} className={"relative m-0.5 flex min-h-14 flex-col items-center justify-center rounded border text-xs transition "+(active ? "border-[#e8b923] bg-[#e8b923] text-black shadow-lg" : "border-white/20 bg-black/10 text-white hover:bg-white/10")}>
            <span className="font-black">P{position}</span>
            {active && <span className="mt-0.5 max-w-full truncate px-1 text-[8px] font-bold">{setterName ?? "Levantador"}</span>}
          </button>;
        })}
      </div>)}
    </div>
    <div className="mt-1 text-center text-[9px] uppercase tracking-widest text-[#777]">Fundo da quadra</div>
  </div>;
}