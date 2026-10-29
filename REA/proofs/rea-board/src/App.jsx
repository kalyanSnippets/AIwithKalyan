import React, { useEffect, useMemo, useRef, useState } from "react";

const KEY = "rea-board-v1";
const LABELS = { coral: "#E8775F", amber: "#E9B44C", green: "#5FB87A", blue: "#5B8DEF", violet: "#9B7BEA" };
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

const seed = () => ({
  nextCard: 6,
  columns: [
    { id: "c1", title: "To Do", cards: [
      { id: "RB-1", title: "Plan the launch", labels: ["coral"], due: day(-2), checklist: [{ t: "Pick a date", d: true }, { t: "Draft the announcement", d: false }, { t: "Book the video slot", d: false }], notes: "Keep it small and clear." },
      { id: "RB-2", title: "Design the board logo", labels: ["violet"], due: day(4), checklist: [], notes: "" },
    ] },
    { id: "c2", title: "Doing", cards: [
      { id: "RB-3", title: "Write the docs", labels: ["blue", "green"], due: day(2), checklist: [{ t: "Setup page", d: true }, { t: "Usage page", d: true }, { t: "FAQ", d: false }], notes: "" },
    ] },
    { id: "c3", title: "Done", cards: [
      { id: "RB-4", title: "Pick a name", labels: ["amber"], due: "", checklist: [], notes: "REA Board" },
      { id: "RB-5", title: "Set up the repo", labels: ["green"], due: "", checklist: [{ t: "Create repo", d: true }, { t: "Add readme", d: true }], notes: "" },
    ] },
  ],
});

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); } };
const isOverdue = (c) => c.due && c.due < day(0);
const progress = (c) => (c.checklist.length ? Math.round((c.checklist.filter((i) => i.d).length / c.checklist.length) * 100) : null);

export default function App() {
  const [board, setBoard] = useState(load);
  const [openId, setOpenId] = useState(null);
  const [drag, setDrag] = useState(null);          // { cardId }
  const [over, setOver] = useState(null);          // { col, index }
  const [renaming, setRenaming] = useState(null);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(board)), [board]);

  const open = useMemo(() => board.columns.flatMap((c) => c.cards).find((c) => c.id === openId) || null, [board, openId]);
  const update = (fn) => setBoard((b) => { const n = structuredClone(b); fn(n); return n; });
  const findCard = (n, id) => { for (const col of n.columns) { const i = col.cards.findIndex((c) => c.id === id); if (i >= 0) return { col, i }; } };

  const addColumn = () => update((n) => n.columns.push({ id: "c" + Date.now(), title: "New column", cards: [] }));
  const renameColumn = (id, title) => update((n) => { n.columns.find((c) => c.id === id).title = title || "Untitled"; });
  const deleteColumn = (id) => update((n) => { n.columns = n.columns.filter((c) => c.id !== id); });
  const addCard = (colId, title) => update((n) => { if (!title.trim()) return; n.columns.find((c) => c.id === colId).cards.push({ id: "RB-" + n.nextCard++, title: title.trim(), labels: [], due: "", checklist: [], notes: "" }); });
  const patchCard = (id, patch) => update((n) => { const f = findCard(n, id); if (f) Object.assign(f.col.cards[f.i], patch); });
  const deleteCard = (id) => { update((n) => { const f = findCard(n, id); if (f) f.col.cards.splice(f.i, 1); }); setOpenId(null); };
  const move = (cardId, toCol, index) => update((n) => {
    const f = findCard(n, cardId); if (!f) return;
    const [card] = f.col.cards.splice(f.i, 1);
    const col = n.columns.find((c) => c.id === toCol);
    let at = index; if (f.col.id === toCol && f.i < index) at -= 1;
    col.cards.splice(Math.max(0, Math.min(at, col.cards.length)), 0, card);
  });

  const onDragOverCol = (e, col) => {
    e.preventDefault();
    const els = [...e.currentTarget.querySelectorAll("[data-card]")].filter((el) => el.dataset.card !== drag?.cardId);
    let index = col.cards.filter((c) => c.id !== drag?.cardId).length;
    for (let i = 0; i < els.length; i++) { const r = els[i].getBoundingClientRect(); if (e.clientY < r.top + r.height / 2) { index = i; break; } }
    // translate "index among the others" back to an index in the full list
    const others = col.cards.filter((c) => c.id !== drag?.cardId);
    const target = others[index]; const full = target ? col.cards.findIndex((c) => c.id === target.id) : col.cards.length;
    setOver({ col: col.id, index: full });
  };
  const onDrop = (e, col) => { e.preventDefault(); if (drag && over) move(drag.cardId, col.id, over.index); setDrag(null); setOver(null); };

  return (
    <div className="app">
      <header><div className="brand"><span className="dot" />REA Board</div><div className="hint">Saved in this browser only</div></header>
      <main className="board">
        {board.columns.map((col) => (
          <section key={col.id} className={"col" + (over?.col === col.id ? " over" : "")} data-col={col.id}
            onDragOver={(e) => onDragOverCol(e, col)} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }} onDrop={(e) => onDrop(e, col)}>
            <div className="colhead">
              {renaming === col.id ? (
                <input autoFocus defaultValue={col.title} onBlur={(e) => { renameColumn(col.id, e.target.value); setRenaming(null); }} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
              ) : (<h2 onDoubleClick={() => setRenaming(col.id)} title="Double-click to rename">{col.title}<span className="count">{col.cards.length}</span></h2>)}
              <div className="colbtns"><button title="Rename column" aria-label="Rename column" onClick={() => setRenaming(col.id)}>✎</button><button title="Delete column" aria-label="Delete column" onClick={() => deleteColumn(col.id)}>✕</button></div>
            </div>
            <div className="cards">
              {col.cards.map((c, i) => (
                <React.Fragment key={c.id}>
                  {over?.col === col.id && over.index === i && drag && <div className="drop" />}
                  <article data-card={c.id} className={"card" + (drag?.cardId === c.id ? " dragging" : "")} draggable
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); setDrag({ cardId: c.id }); }}
                    onDragEnd={() => { setDrag(null); setOver(null); }} onClick={() => setOpenId(c.id)}>
                    {c.labels.length > 0 && <div className="labels">{c.labels.map((l) => <i key={l} style={{ background: LABELS[l] }} />)}</div>}
                    <div className="ctitle">{c.title}</div>
                    <div className="meta">
                      <span className="cid">{c.id}</span>
                      {c.due && <span className={"due" + (isOverdue(c) ? " overdue" : "")}>{isOverdue(c) ? "Overdue · " : ""}{c.due}</span>}
                      {progress(c) !== null && <span className="chk">{c.checklist.filter((x) => x.d).length}/{c.checklist.length}</span>}
                    </div>
                    {progress(c) !== null && <div className="bar"><div style={{ width: progress(c) + "%" }} /></div>}
                  </article>
                </React.Fragment>
              ))}
              {over?.col === col.id && over.index >= col.cards.length && drag && <div className="drop" />}
            </div>
            <AddCard onAdd={(t) => addCard(col.id, t)} />
          </section>
        ))}
        <button className="addcol" onClick={addColumn}>+ Add column</button>
      </main>
      {open && <Panel card={open} onClose={() => setOpenId(null)} onPatch={(p) => patchCard(open.id, p)} onDelete={() => deleteCard(open.id)} />}
    </div>
  );
}

function AddCard({ onAdd }) {
  const [v, setV] = useState(""); const [on, setOn] = useState(false);
  if (!on) return <button className="addcard" onClick={() => setOn(true)}>+ Add a card</button>;
  return <div className="addform"><input autoFocus placeholder="Card title" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onAdd(v); setV(""); setOn(false); } if (e.key === "Escape") setOn(false); }} /><button onClick={() => { onAdd(v); setV(""); setOn(false); }}>Add</button></div>;
}

function Panel({ card, onClose, onPatch, onDelete }) {
  const [item, setItem] = useState(""); const p = progress(card);
  return (
    <aside className="panel" onClick={(e) => e.stopPropagation()}>
      <div className="phead"><span className="cid">{card.id}</span><button aria-label="Close" onClick={onClose}>✕</button></div>
      <input className="ptitle" value={card.title} onChange={(e) => onPatch({ title: e.target.value })} />
      <label>Labels</label>
      <div className="lab">{Object.entries(LABELS).map(([k, v]) => <button key={k} aria-label={"label " + k} className={card.labels.includes(k) ? "on" : ""} style={{ background: v }} onClick={() => onPatch({ labels: card.labels.includes(k) ? card.labels.filter((x) => x !== k) : [...card.labels, k] })} />)}</div>
      <label>Due date {isOverdue(card) && <span className="due overdue">Overdue</span>}</label>
      <input type="date" value={card.due} onChange={(e) => onPatch({ due: e.target.value })} />
      <label>Checklist {p !== null && <span className="chk">{p}%</span>}</label>
      {p !== null && <div className="bar big"><div style={{ width: p + "%" }} /></div>}
      {card.checklist.map((c, i) => <div className="ck" key={i}><input type="checkbox" checked={c.d} onChange={() => onPatch({ checklist: card.checklist.map((x, j) => (j === i ? { ...x, d: !x.d } : x)) })} /><span className={c.d ? "done" : ""}>{c.t}</span><button aria-label="Remove item" onClick={() => onPatch({ checklist: card.checklist.filter((_, j) => j !== i) })}>✕</button></div>)}
      <div className="addform"><input placeholder="Add checklist item" value={item} onChange={(e) => setItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && item.trim()) { onPatch({ checklist: [...card.checklist, { t: item.trim(), d: false }] }); setItem(""); } }} /></div>
      <label>Notes</label>
      <textarea value={card.notes} onChange={(e) => onPatch({ notes: e.target.value })} />
      <button className="del" onClick={onDelete}>Delete card</button>
    </aside>
  );
}
