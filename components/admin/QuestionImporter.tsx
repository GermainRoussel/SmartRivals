"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Trash2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Question, QuestionType } from "@/types";
import { insertQuestions, getCustomQuestions, deleteCustomQuestion } from "@/app/actions/admin";

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
  CHESS: { id: "chess-new-1", type: "CHESS", theme: "Stratégie Échecs", difficulty: "Moyen", text: "Mat en 1 : trouvez le coup.", fen: "6k1/3R4/6K1/8/8/8/8/8 w - - 0 1", correctAnswer: "D7-D8", note: "correctAnswer format: CASE-CASE (ex: D7-D8). Utilisez lichess.org/analysis pour générer le FEN." },
  PIXEL_REVEAL: { id: "pix-new-1", type: "PIXEL_REVEAL", theme: "Nature", difficulty: "Moyen", text: "Devinez l'image !", pixelImage: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600", correctAnswer: "LION" },
  HOTSPOT: { id: "hotspot-new-1", type: "HOTSPOT", theme: "Science", difficulty: "Facile", text: "Cliquez sur la zone cible.", imageUrl: "https://...", hotspotTarget: { x: 50, y: 50, radius: 10 }, correctAnswer: { x: 50, y: 50 }, note: "x/y en % (0-100) de la largeur/hauteur de l'image." },
};

const TYPE_LABELS: Partial<Record<string, string>> = {
  MCQ: "QCM Classique",
  TRUE_FALSE: "Vrai / Faux",
  INPUT: "Saisie libre",
  SLIDER: "Curseur",
  ANAGRAM: "Anagramme",
  WORD_GUESS: "Wordle",
  MATH_PUZZLE: "Calcul",
  REBUS: "Rébus",
  ODD_ONE_OUT: "Intrus",
  ORDER: "Mise en ordre",
  MATCHING: "Association",
  SORTING: "Tri rapide",
  HOLE_TEXT: "Texte à trous",
  BLIND_TEST: "Blind Test",
  IMAGE_MCQ: "QCM Image",
  CONNECTIONS: "Connexions",
  CHESS: "Échecs",
  PIXEL_REVEAL: "Pixel Reveal",
  HOTSPOT: "Point & Click",
};

// ------------------------------------------------------------------ //
//  Components                                                         //
// ------------------------------------------------------------------ //

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? "Copié !" : "Copier"}
    </button>
  );
}

function TemplatesPanel() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {Object.entries(TEMPLATES).map(([type, tpl]) => {
        const json = JSON.stringify(tpl, null, 2);
        const isOpen = open === type;
        return (
          <div key={type} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : type)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <span className="font-bold text-slate-700 text-sm">
                {TYPE_LABELS[type] ?? type}
                <span className="ml-2 text-xs text-slate-400 font-normal font-mono">{type}</span>
              </span>
              {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>
            {isOpen && (
              <div className="p-4 bg-white">
                <div className="flex justify-end mb-2">
                  <CopyButton text={json} />
                </div>
                <pre className="text-xs bg-slate-50 rounded-xl p-4 overflow-x-auto text-slate-700 leading-relaxed">
                  {json}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ImportPanel({ onImported }: { onImported: () => void }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Question[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function parse(raw: string) {
    setResult(null);
    setParseError(null);
    setParsed(null);
    if (!raw.trim()) return;
    try {
      const val = JSON.parse(raw);
      const arr: Question[] = Array.isArray(val) ? val : [val];
      if (arr.length === 0) { setParseError("JSON vide."); return; }
      for (const q of arr) {
        if (!q.id || !q.type || !q.text) {
          setParseError(`Champ manquant dans la question "${q.id ?? "?"}" — id, type et text sont requis.`);
          return;
        }
      }
      setParsed(arr);
    } catch (e) {
      setParseError(`JSON invalide : ${(e as Error).message}`);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      setText(raw);
      parse(raw);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed) return;
    setImporting(true);
    try {
      const res = await insertQuestions(parsed);
      setResult(res);
      if (res.inserted > 0) { setText(""); setParsed(null); onImported(); }
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} className="mr-2" /> Importer un fichier .json
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
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {parseError}
        </div>
      )}

      {parsed && !parseError && (
        <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-medium">
          ✅ {parsed.length} question{parsed.length > 1 ? "s" : ""} valide{parsed.length > 1 ? "s" : ""} détectée{parsed.length > 1 ? "s" : ""}
          {" : "}
          {parsed.map((q) => q.id).join(", ")}
        </div>
      )}

      {result && (
        <div className={`flex items-center gap-2 text-sm rounded-xl p-3 ${result.errors.length ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          <CheckCircle size={16} />
          {result.errors.length
            ? `Erreur : ${result.errors.join(", ")}`
            : `${result.inserted} question${result.inserted > 1 ? "s" : ""} insérée${result.inserted > 1 ? "s" : ""} avec succès !`}
        </div>
      )}

      <Button
        onClick={handleImport}
        disabled={!parsed || importing}
        className="w-full"
      >
        {importing ? "Insertion…" : `Insérer ${parsed ? `${parsed.length} question${parsed.length > 1 ? "s" : ""}` : ""}`}
      </Button>
    </div>
  );
}

function LibraryPanel({ questions, onDelete }: { questions: Question[]; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [openType, setOpenType] = useState<string | null>(null);

  const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
    acc[q.type] = [...(acc[q.type] ?? []), q];
    return acc;
  }, {});

  if (questions.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        Aucune question personnalisée pour l&apos;instant. Importez-en depuis l&apos;onglet "Importer".
      </p>
    );
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteCustomQuestion(id);
      onDelete(id);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([type, qs]) => {
        const isOpen = openType === type;
        return (
          <div key={type} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenType(isOpen ? null : type)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <span className="font-bold text-slate-700 text-sm">
                {TYPE_LABELS[type] ?? type}
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                  {qs.length}
                </span>
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
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={deleting === q.id}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                      title="Supprimer"
                    >
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

type Tab = "import" | "templates" | "library";

export function QuestionImporter() {
  const [tab, setTab] = useState<Tab>("import");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadQuestions() {
    setLoading(true);
    const qs = await getCustomQuestions();
    setQuestions(qs);
    setLoading(false);
  }

  useEffect(() => { loadQuestions(); }, []);

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "import", label: "Importer" },
    { key: "templates", label: "Modèles JSON" },
    { key: "library", label: "Bibliothèque", count: questions.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors relative -mb-px ${
              tab === t.key
                ? "bg-white border border-b-white border-slate-200 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div>
        {tab === "import" && (
          <ImportPanel
            onImported={() => { loadQuestions(); setTab("library"); }}
          />
        )}
        {tab === "templates" && <TemplatesPanel />}
        {tab === "library" && (
          loading
            ? <p className="text-slate-400 text-sm text-center py-8">Chargement…</p>
            : <LibraryPanel
                questions={questions}
                onDelete={(id) => setQuestions((qs) => qs.filter((q) => q.id !== id))}
              />
        )}
      </div>
    </div>
  );
}
