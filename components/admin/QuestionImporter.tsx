"use client";

import { useEffect, useRef, useState } from "react";
import {
  Copy, Check, ChevronDown, ChevronRight, Trash2, Upload,
  AlertCircle, CheckCircle, ToggleLeft, ToggleRight, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Question, QuestionType } from "@/types";
import { insertQuestions, getCustomQuestions, deleteCustomQuestion } from "@/app/actions/admin";
import { getOverridesMap, setQuestionActive } from "@/app/actions/questions";
import { ALL_QUESTIONS, CATALOG_TYPES } from "@/lib/quiz/bank";

// ------------------------------------------------------------------ //
//  Templates                                                          //
// ------------------------------------------------------------------ //

const TEMPLATES: Record<string, object> = {
  MCQ: { id: "mcq-new-1", type: "MCQ", theme: "Géographie", difficulty: "Facile", text: "Question ?", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "Option A" },
  TRUE_FALSE: { id: "tf-new-1", type: "TRUE_FALSE", theme: "Science", difficulty: "Facile", text: "Affirmation vraie ou fausse.", correctAnswer: true },
  INPUT: { id: "input-new-1", type: "INPUT", theme: "Géographie", difficulty: "Facile", text: "Question à réponse libre ?", correctAnswer: "Réponse" },
  SLIDER: { id: "slider-new-1", type: "SLIDER", theme: "Histoire", difficulty: "Moyen", text: "Estimation ?", min: 0, max: 2000, step: 1, unit: "", correctAnswer: 1000, tolerance: 50 },
  ANAGRAM: { id: "ana-new-1", type: "ANAGRAM", theme: "Géographie", difficulty: "Moyen", text: "Reconstituez ce mot.", anagramWord: "FRANCE", correctAnswer: "FRANCE" },
  WORD_GUESS: { id: "word-new-1", type: "WORD_GUESS", theme: "Nature", difficulty: "Moyen", text: "Indice sur le mot (5 lettres).", wordLength: 5, correctAnswer: "TIGRE" },
  MATH_PUZZLE: { id: "math-new-1", type: "MATH_PUZZLE", theme: "Mathématiques", difficulty: "Facile", text: "Quel est le résultat ?", equation: "5 + ? = 10", mathGrid: [3, 4, 5, 6, 7, 8], correctAnswer: "5" },
  REBUS: { id: "rebus-new-1", type: "REBUS", theme: "Logique", difficulty: "Moyen", text: "Déchiffrez ce rébus.", rebusEmojis: "🍎📱", correctAnswer: "Apple" },
  ODD_ONE_OUT: { id: "odd-new-1", type: "ODD_ONE_OUT", theme: "Nature", difficulty: "Facile", text: "Lequel est l'intrus ?", oddOneOutItems: [{ id: "1", content: "A", isOdd: false }, { id: "2", content: "B", isOdd: false }, { id: "3", content: "C (intrus)", isOdd: true }, { id: "4", content: "D", isOdd: false }], correctAnswer: "3" },
  ORDER: { id: "order-new-1", type: "ORDER", theme: "Science", difficulty: "Moyen", text: "Classez dans l'ordre.", items: [{ id: "a", content: "Premier" }, { id: "b", content: "Deuxième" }, { id: "c", content: "Troisième" }, { id: "d", content: "Quatrième" }], correctAnswer: ["a", "b", "c", "d"] },
  MATCHING: { id: "match-new-1", type: "MATCHING", theme: "Géographie", difficulty: "Facile", text: "Reliez les éléments.", pairs: [{ left: "France", right: "Paris" }, { left: "Espagne", right: "Madrid" }, { left: "Italie", right: "Rome" }, { left: "Japon", right: "Tokyo" }] },
  SORTING: { id: "sort-new-1", type: "SORTING", theme: "Nature", difficulty: "Moyen", text: "Classez dans les bons groupes.", groups: [{ id: "A", label: "Groupe A" }, { id: "B", label: "Groupe B" }], sortingItems: [{ id: "1", content: "Item 1", correctGroupId: "A" }, { id: "2", content: "Item 2", correctGroupId: "B" }, { id: "3", content: "Item 3", correctGroupId: "A" }, { id: "4", content: "Item 4", correctGroupId: "B" }, { id: "5", content: "Item 5", correctGroupId: "A" }] },
  HOLE_TEXT: { id: "hole-new-1", type: "HOLE_TEXT", theme: "Histoire", difficulty: "Moyen", text: "Complétez la phrase.", holeText: "La capitale de la France est {Paris} et son président est {Macron}." },
  BLIND_TEST: { id: "blind-new-1", type: "BLIND_TEST", theme: "Musique", difficulty: "Facile", text: "Quel est ce son ?", soundId: "doorbell", options: ["Sonnette", "Réveil", "Klaxon", "Sirène"], correctAnswer: "Sonnette", note: "soundId valides: doorbell, siren, alarm, phone, horn, laser" },
  IMAGE_MCQ: { id: "image-mcq-new-1", type: "IMAGE_MCQ", theme: "Géographie", difficulty: "Facile", text: "À quel pays appartient ce drapeau ?", imageUrl: "https://flagcdn.com/w640/fr.png", options: ["France", "Italie", "Espagne", "Portugal"], correctAnswer: "France" },
  CONNECTIONS: { id: "conn-new-1", type: "CONNECTIONS", theme: "Culture G", difficulty: "Moyen", text: "Créez 4 groupes de 4 mots liés.", connectionsGroups: [{ id: "A", label: "Groupe A", items: ["A1", "A2", "A3", "A4"] }, { id: "B", label: "Groupe B", items: ["B1", "B2", "B3", "B4"] }, { id: "C", label: "Groupe C", items: ["C1", "C2", "C3", "C4"] }, { id: "D", label: "Groupe D", items: ["D1", "D2", "D3", "D4"] }], correctAnswer: "COMPLEX_VALIDATION" },
  CHESS: { id: "chess-new-1", type: "CHESS", theme: "Stratégie Échecs", difficulty: "Moyen", text: "Mat en 1 : trouvez le coup.", fen: "6k1/3R4/6K1/8/8/8/8/8 w - - 0 1", correctAnswer: "D7-D8", note: "Utilisez lichess.org/analysis pour générer le FEN." },
  PIXEL_REVEAL: { id: "pix-new-1", type: "PIXEL_REVEAL", theme: "Nature", difficulty: "Moyen", text: "Devinez l'image !", pixelImage: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600", correctAnswer: "LION" },
  HOTSPOT: { id: "hotspot-new-1", type: "HOTSPOT", theme: "Science", difficulty: "Facile", text: "Cliquez sur la zone cible.", imageUrl: "https://...", hotspotTarget: { x: 50, y: 50, radius: 10 }, correctAnswer: { x: 50, y: 50 }, note: "x/y en % (0-100) de la largeur/hauteur de l'image." },
};

const TYPE_LABELS: Partial<Record<string, string>> = {
  MCQ: "QCM Classique", TRUE_FALSE: "Vrai / Faux", INPUT: "Saisie libre",
  SLIDER: "Curseur", ANAGRAM: "Anagramme", WORD_GUESS: "Wordle",
  MATH_PUZZLE: "Calcul", REBUS: "Rébus", ODD_ONE_OUT: "Intrus",
  ORDER: "Mise en ordre", MATCHING: "Association", SORTING: "Tri rapide",
  HOLE_TEXT: "Texte à trous", BLIND_TEST: "Blind Test", IMAGE_MCQ: "QCM Image",
  CONNECTIONS: "Connexions", CHESS: "Échecs", PIXEL_REVEAL: "Pixel Reveal",
  HOTSPOT: "Point & Click", DIFFERENCES: "7 Différences", PATTERN: "Pattern IQ",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "Facile": "bg-green-100 text-green-700",
  "Moyen": "bg-yellow-100 text-yellow-700",
  "Difficile": "bg-orange-100 text-orange-700",
  "Expert": "bg-red-100 text-red-700",
};

// ------------------------------------------------------------------ //
//  Shared utils                                                       //
// ------------------------------------------------------------------ //

function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors whitespace-nowrap"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? "Copié !" : label}
    </button>
  );
}

// ------------------------------------------------------------------ //
//  Tab: Importer                                                      //
// ------------------------------------------------------------------ //

function ImportPanel({ prefillJson, onImported }: { prefillJson?: string; onImported: () => void }) {
  const [text, setText] = useState(prefillJson ?? "");
  const [parsed, setParsed] = useState<Question[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefillJson) { setText(prefillJson); parse(prefillJson); }
  }, [prefillJson]);

  function parse(raw: string) {
    setResult(null); setParseError(null); setParsed(null);
    if (!raw.trim()) return;
    try {
      const val = JSON.parse(raw);
      const arr: Question[] = Array.isArray(val) ? val : [val];
      if (arr.length === 0) { setParseError("JSON vide."); return; }
      for (const q of arr) {
        if (!q.id || !q.type || !q.text) {
          setParseError(`Champ manquant dans "${q.id ?? "?"}" — id, type et text requis.`);
          return;
        }
      }
      setParsed(arr);
    } catch (e) { setParseError(`JSON invalide : ${(e as Error).message}`); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const raw = ev.target?.result as string; setText(raw); parse(raw); };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed) return;
    setImporting(true);
    try {
      const res = await insertQuestions(parsed);
      setResult(res);
      if (res.inserted > 0) { setText(""); setParsed(null); onImported(); }
    } finally { setImporting(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} className="mr-2" /> Importer .json
        </Button>
        <span className="text-slate-400 text-sm">ou coller ci-dessous</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); parse(e.target.value); }}
        placeholder={'[\n  { "id": "...", "type": "MCQ", ... }\n]'}
        className="w-full h-56 font-mono text-xs p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
      />
      {parseError && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {parseError}
        </div>
      )}
      {parsed && !parseError && (
        <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-medium">
          ✅ {parsed.length} question{parsed.length > 1 ? "s" : ""} valide{parsed.length > 1 ? "s" : ""} : {parsed.map((q) => q.id).join(", ")}
        </div>
      )}
      {result && (
        <div className={`flex items-center gap-2 text-sm rounded-xl p-3 ${result.errors.length ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          <CheckCircle size={16} />
          {result.errors.length ? `Erreur : ${result.errors.join(", ")}` : `${result.inserted} question${result.inserted > 1 ? "s" : ""} insérée${result.inserted > 1 ? "s" : ""} !`}
        </div>
      )}
      <Button onClick={handleImport} disabled={!parsed || importing} className="w-full">
        {importing ? "Insertion…" : `Insérer ${parsed ? `${parsed.length} question${parsed.length > 1 ? "s" : ""}` : ""}`}
      </Button>
    </div>
  );
}

// ------------------------------------------------------------------ //
//  Tab: Modèles JSON                                                  //
// ------------------------------------------------------------------ //

function TemplatesPanel() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {Object.entries(TEMPLATES).map(([type, tpl]) => {
        const json = JSON.stringify(tpl, null, 2);
        const isOpen = open === type;
        return (
          <div key={type} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : type)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <span className="font-bold text-slate-700 text-sm">
                {TYPE_LABELS[type] ?? type}
                <span className="ml-2 text-xs text-slate-400 font-normal font-mono">{type}</span>
              </span>
              {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>
            {isOpen && (
              <div className="p-4 bg-white">
                <div className="flex justify-end mb-2"><CopyButton text={json} /></div>
                <pre className="text-xs bg-slate-50 rounded-xl p-4 overflow-x-auto text-slate-700 leading-relaxed">{json}</pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ //
//  Tab: Bibliothèque (all bank questions)                             //
// ------------------------------------------------------------------ //

const BANK_IDS = new Set(ALL_QUESTIONS.map((q) => q.id));

function BankLibraryPanel({ onModify }: { onModify: (json: string) => void }) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  // Map of in-code question IDs that have been overridden by a DB version.
  const [modifiedMap, setModifiedMap] = useState<Map<string, Question>>(new Map());
  const [toggling, setToggling] = useState<string | null>(null);
  const [openType, setOpenType] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverridesMap(), getCustomQuestions()]).then(([ov, customQs]) => {
      setOverrides(ov);
      setModifiedMap(new Map(customQs.filter((q) => BANK_IDS.has(q.id)).map((q) => [q.id, q])));
      setLoading(false);
    });
  }, []);

  async function toggle(id: string) {
    const current = overrides[id] ?? true;
    const next = !current;
    setToggling(id);
    setOverrides((o) => ({ ...o, [id]: next }));
    try { await setQuestionActive(id, next); }
    catch { setOverrides((o) => ({ ...o, [id]: current })); }
    finally { setToggling(null); }
  }

  const grouped: Partial<Record<QuestionType, Question[]>> = {};
  for (const type of CATALOG_TYPES) {
    const qs = ALL_QUESTIONS.filter((q) => q.type === type);
    if (qs.length > 0) grouped[type] = qs;
  }

  const lc = search.toLowerCase();
  const totalActive = ALL_QUESTIONS.filter((q) => (overrides[q.id] ?? true)).length;

  if (loading) return <p className="text-slate-400 text-sm text-center py-8">Chargement…</p>;

  return (
    <div className="space-y-4">
      {/* Stats + search */}
      <div className="flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une question…"
          className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {totalActive} / {ALL_QUESTIONS.length} actives
        </span>
      </div>

      {/* Accordions by type */}
      {Object.entries(grouped).map(([type, qs]) => {
        const filtered = lc
          ? qs!.filter((q) => q.text.toLowerCase().includes(lc) || q.id.toLowerCase().includes(lc))
          : qs!;
        if (filtered.length === 0) return null;

        const activeCount = filtered.filter((q) => overrides[q.id] ?? true).length;
        const isOpen = openType === type || (lc.length > 0);

        return (
          <div key={type} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => !lc && setOpenType(isOpen && openType === type ? null : type)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                {TYPE_LABELS[type] ?? type}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                  {activeCount}/{filtered.length}
                </span>
              </span>
              {!lc && (isOpen && openType === type
                ? <ChevronDown size={16} className="text-slate-400" />
                : <ChevronRight size={16} className="text-slate-400" />)}
            </button>

            {(isOpen && (openType === type || lc.length > 0)) && (
              <div className="divide-y divide-slate-50">
                {filtered.map((q) => {
                  const active = overrides[q.id] ?? true;
                  // Use the DB-modified version if it exists, else the in-code version.
                  const displayQ = modifiedMap.get(q.id) ?? q;
                  const isModified = modifiedMap.has(q.id);
                  const json = JSON.stringify(displayQ, null, 2);
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-opacity ${active ? "" : "opacity-40"}`}
                    >
                      {/* Toggle */}
                      <button
                        onClick={() => toggle(q.id)}
                        disabled={toggling === q.id}
                        title={active ? "Désactiver" : "Activer"}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        {active
                          ? <ToggleRight size={22} className="text-blue-500" />
                          : <ToggleLeft size={22} />}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 leading-snug">{displayQ.text}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-400">{displayQ.id}</span>
                          <span className="text-[10px] text-slate-400">{displayQ.theme}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[displayQ.difficulty] ?? "bg-slate-100 text-slate-500"}`}>
                            {displayQ.difficulty}
                          </span>
                          {isModified && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              modifiée
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0">
                        <CopyButton text={json} label="JSON" />
                        <button
                          onClick={() => onModify(json)}
                          title="Modifier"
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 transition-colors"
                        >
                          <Pencil size={12} /> Modifier
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ //
//  Tab: Questions ajoutées (custom DB questions)                      //
// ------------------------------------------------------------------ //

function CustomQuestionsPanel({ questions: allQuestions, onDelete }: { questions: Question[]; onDelete: (id: string) => void }) {
  // Overrides (same ID as an in-code question) are shown in Bibliothèque, not here.
  const questions = allQuestions.filter((q) => !BANK_IDS.has(q.id));
  const [deleting, setDeleting] = useState<string | null>(null);
  const [openType, setOpenType] = useState<string | null>(null);

  const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
    acc[q.type] = [...(acc[q.type] ?? []), q];
    return acc;
  }, {});

  if (questions.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        Aucune question ajoutée. Importez-en depuis l&apos;onglet &quot;Importer&quot;.
      </p>
    );
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try { await deleteCustomQuestion(id); onDelete(id); }
    finally { setDeleting(null); }
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([type, qs]) => {
        const isOpen = openType === type;
        return (
          <div key={type} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button onClick={() => setOpenType(isOpen ? null : type)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <span className="font-bold text-slate-700 text-sm">
                {TYPE_LABELS[type] ?? type}
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">{qs.length}</span>
              </span>
              {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>
            {isOpen && (
              <div className="divide-y divide-slate-50">
                {qs.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{q.text}</p>
                      <p className="text-xs text-slate-400 font-mono">{q.id} · {q.theme} · {q.difficulty}</p>
                    </div>
                    <button onClick={() => handleDelete(q.id)} disabled={deleting === q.id}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ //
//  Main component                                                     //
// ------------------------------------------------------------------ //

type Tab = "import" | "templates" | "bank" | "custom";

export function QuestionImporter() {
  const [tab, setTab] = useState<Tab>("bank");
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [prefillJson, setPrefillJson] = useState<string | undefined>(undefined);

  async function loadCustom() {
    setLoadingCustom(true);
    const qs = await getCustomQuestions();
    setCustomQuestions(qs);
    setLoadingCustom(false);
  }

  useEffect(() => { loadCustom(); }, []);

  function handleModify(json: string) {
    setPrefillJson(json);
    setTab("import");
  }

  const newQuestionsCount = customQuestions.filter((q) => !BANK_IDS.has(q.id)).length;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "bank", label: "Bibliothèque", badge: ALL_QUESTIONS.length },
    { key: "custom", label: "Questions ajoutées", badge: newQuestionsCount || undefined },
    { key: "import", label: "Importer" },
    { key: "templates", label: "Modèles JSON" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors -mb-px ${
              tab === t.key
                ? "bg-white border border-b-white border-slate-200 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div>
        {tab === "bank" && <BankLibraryPanel onModify={handleModify} />}
        {tab === "custom" && (
          loadingCustom
            ? <p className="text-slate-400 text-sm text-center py-8">Chargement…</p>
            : <CustomQuestionsPanel
                questions={customQuestions}
                onDelete={(id) => setCustomQuestions((qs) => qs.filter((q) => q.id !== id))}
              />
        )}
        {tab === "import" && (
          <ImportPanel
            key={prefillJson}
            prefillJson={prefillJson}
            onImported={() => { loadCustom(); setTab("custom"); setPrefillJson(undefined); }}
          />
        )}
        {tab === "templates" && <TemplatesPanel />}
      </div>
    </div>
  );
}
