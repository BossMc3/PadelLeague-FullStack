"use client";

import React from "react";
import { Team } from "@/types";

function nextPow2(n: number) {
  let p = 2;
  while (p < n) p *= 2;
  return p;
}

const CSS = `
/* wrapper */
.bk{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:24px 16px 28px;box-shadow:0 1px 5px rgba(0,0,0,.2);overflow-x:auto}
.bk-title{text-align:center;font-weight:800;font-size:1.05rem;color:#f1f5f9;margin-bottom:20px}
.bk-title span{color:#64748b;font-weight:500;font-size:.85rem}

/* body = left + center + right */
.bk-body{display:flex;align-items:stretch;justify-content:center}

/* each side */
.bk-left,.bk-right{display:flex}

/* round column */
.bk-round{display:flex;flex-direction:column}

/* match = one pair of boxes */
.bk-match{flex:1;display:flex;flex-direction:column;justify-content:space-around;position:relative;min-height:70px}

/* team box */
.bk-box{height:30px;width:140px;border:1.5px solid #475569;display:flex;align-items:center;padding:0 6px;font-size:.62rem;font-weight:600;color:#e2e8f0;background:#1e293b;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative;z-index:1}
.bk-box.empty{border-color:#334155;color:transparent;background:#0f172a}
.bk-box.right{justify-content:flex-end}

/* ─── LEFT side connectors ─── */
.bk-left .bk-match{padding-right:40px}

/* ] bracket shape */
.bk-left .bk-match::after{
  content:'';position:absolute;
  right:20px;top:calc(25% + 14px);bottom:calc(25% + 14px);
  width:20px;box-sizing:border-box;
  border-right:2px solid #475569;
  border-top:2px solid #475569;
  border-bottom:2px solid #475569}

/* horizontal stem */
.bk-left .bk-match::before{
  content:'';position:absolute;
  right:0;top:50%;transform:translateY(-1px);
  width:20px;height:2px;background:#475569}

/* ─── RIGHT side connectors ─── */
.bk-right .bk-match{padding-left:40px}

/* [ bracket shape (mirrored) */
.bk-right .bk-match::after{
  content:'';position:absolute;
  left:20px;top:calc(25% + 14px);bottom:calc(25% + 14px);
  width:20px;box-sizing:border-box;
  border-left:2px solid #475569;
  border-top:2px solid #475569;
  border-bottom:2px solid #475569}

/* horizontal stem */
.bk-right .bk-match::before{
  content:'';position:absolute;
  left:0;top:50%;transform:translateY(-1px);
  width:20px;height:2px;background:#475569}

/* center column */
.bk-center{display:flex;align-items:center;justify-content:center;min-width:50px;position:relative}
.bk-center-line{position:absolute;top:50%;left:0;right:0;height:2px;background:#475569;transform:translateY(-1px)}

/* champion */
.bk-champ{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px}
.bk-champ-bar{width:110px;height:2px;background:#475569;border-radius:2px}
.bk-champ-label{font-weight:800;font-style:italic;font-size:1rem;color:#f1f5f9;letter-spacing:.05em}
`;

function Round({
  matchCount,
  labels,
  side,
}: {
  matchCount: number;
  labels?: string[];
  side: "left" | "right";
}) {
  return (
    <div className="bk-round">
      {Array.from({ length: matchCount }, (_, mi) => {
        const top = labels ? labels[mi * 2] ?? "" : "";
        const bot = labels ? labels[mi * 2 + 1] ?? "" : "";
        const hasTop = top !== "";
        const hasBot = bot !== "";

        return (
          <div className="bk-match" key={mi}>
            <div className={`bk-box${!hasTop ? " empty" : ""}${side === "right" ? " right" : ""}`}>
              {hasTop ? top : "\u00A0"}
            </div>
            <div className={`bk-box${!hasBot ? " empty" : ""}${side === "right" ? " right" : ""}`}>
              {hasBot ? bot : "\u00A0"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TournamentBracket({
  teams,
  championName,
}: {
  teams: Team[];
  championName?: string | null;
}) {
  if (teams.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", border: "2px dashed #1e293b", borderRadius: 14, color: "#64748b" }}>
        No teams yet — bracket appears once teams join.
      </div>
    );
  }

  const size = nextPow2(teams.length);
  const half = size / 2;
  const nRounds = Math.log2(half);
  const names = teams.map((t) => t.name);
  while (names.length < size) names.push("TBD");

  const leftNames = names.slice(0, half);
  const rightNames = names.slice(half);

  // Build round data per side
  function makeRounds(sideNames: string[]) {
    const rounds: { matchCount: number; labels?: string[] }[] = [];
    for (let r = 0; r < nRounds; r++) {
      const mc = half / Math.pow(2, r + 1);
      if (r === 0) {
        const labs: string[] = [];
        for (let i = 0; i < sideNames.length; i++) labs.push(sideNames[i]);
        rounds.push({ matchCount: mc, labels: labs });
      } else {
        rounds.push({ matchCount: mc });
      }
    }
    return rounds;
  }

  const leftRounds = makeRounds(leftNames);
  const rightRounds = makeRounds(rightNames);

  // Right side: reverse order so outermost (team names) is on the far right
  const rightOrdered = [...rightRounds].reverse();

  const minH = (half / 2) * 80;

  return (
    <div className="bk">
      <style>{CSS}</style>
      <div className="bk-title">
        Tournament Bracket <span>({teams.length} team{teams.length !== 1 ? "s" : ""})</span>
      </div>
      <div className="bk-body" style={{ minHeight: minH }}>
        {/* Left side */}
        <div className="bk-left">
          {leftRounds.map((r, i) => (
            <Round key={i} matchCount={r.matchCount} labels={r.labels} side="left" />
          ))}
        </div>

        {/* Center */}
        <div className="bk-center">
          <div className="bk-center-line" />
        </div>

        {/* Right side (reversed) */}
        <div className="bk-right">
          {rightOrdered.map((r, i) => (
            <Round key={i} matchCount={r.matchCount} labels={r.labels} side="right" />
          ))}
        </div>
      </div>

      <div className="bk-champ">
        <span style={{ fontSize: "1.4rem" }}>🏆</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div className="bk-champ-bar" />
          <span className="bk-champ-label">{championName ? `Champion: ${championName}` : "Champion"}</span>
          <div className="bk-champ-bar" />
        </div>
        <span style={{ fontSize: "1.4rem" }}>🏆</span>
      </div>
    </div>
  );
}
