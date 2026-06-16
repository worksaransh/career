"use client";

import React, { useEffect, useState, startTransition } from "react";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown, Settings, X, Check, Globe, Sparkles } from "lucide-react";
import { listAssessmentQuestions, upsertAssessmentQuestion, deleteAssessmentQuestion, reorderAssessmentQuestions } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Option {
  id: string;
  text: string;
  points: number;
}

interface Question {
  id?: string;
  text: string;
  category: string;
  order: number;
  options: any; // json array of Option
}

export default function AdminAssessmentsBuilderPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Question | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Options configuration inside modal
  const [optionList, setOptionList] = useState<Option[]>([]);
  const [newOptText, setNewOptText] = useState("");
  const [newOptPoints, setNewOptPoints] = useState(5);

  async function loadQuestions() {
    setLoading(true);
    try {
      const data = await listAssessmentQuestions();
      setQuestions(data as Question[]);
    } catch (err: any) {
      toast.error(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleOpenEdit = (q: Question) => {
    setEditing(q);
    const parsedOptions = Array.isArray(q.options) 
      ? (q.options as Option[]) 
      : typeof q.options === "string" 
        ? JSON.parse(q.options) 
        : [];
    setOptionList(parsedOptions);
    setNewOptText("");
    setNewOptPoints(5);
  };

  const handleAddOption = () => {
    if (!newOptText.trim()) return;
    const newOpt = {
      id: `opt-${Date.now()}`,
      text: newOptText.trim(),
      points: Number(newOptPoints),
    };
    setOptionList([...optionList, newOpt]);
    setNewOptText("");
  };

  const handleSaveQuestion = async () => {
    if (!editing) return;
    const toastId = toast.loading("Saving question...");
    try {
      const payload = {
        ...editing,
        options: optionList,
      };
      await upsertAssessmentQuestion(payload);
      toast.success("Question successfully saved!", { id: toastId });
      setEditing(null);
      loadQuestions();
    } catch (err: any) {
      toast.error(err.message || "Failed to save question", { id: toastId });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const toastId = toast.loading("Deleting question...");
    try {
      await deleteAssessmentQuestion(id);
      toast.success("Question deleted!", { id: toastId });
      loadQuestions();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question", { id: toastId });
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const list = [...questions];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap elements
    const temp = list[index];
    list[index] = list[targetIdx]!;
    list[targetIdx] = temp!;

    // Instantly update UI optimistically
    setQuestions(list);

    // Call server action to save new order database transaction
    const orderedIds = list.map((q) => q.id).filter(Boolean) as string[];
    try {
      await reorderAssessmentQuestions(orderedIds);
      toast.success("Question order updated!");
    } catch (err: any) {
      toast.error("Failed to persist question order");
      loadQuestions();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-foreground">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Evaluation Editor</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Assessment Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design AI-evaluation question paths, edit point scoring weights, translate options, and reorder fields.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language translation buttons */}
          <div className="inline-flex rounded-xl bg-card border border-border/80 p-1 shadow-sm text-xs font-semibold">
            {[
              { code: "en", label: "English" },
              { code: "hi", label: "Hindi (हिंदी)" },
              { code: "hng", label: "Hinglish" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  selectedLanguage === lang.code ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setEditing({
                text: "",
                category: "General",
                order: questions.length,
                options: [],
              });
              setOptionList([]);
              setNewOptText("");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/95 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            Loading assessment questions list...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl bg-card/20">
            No evaluation questions exist. Click "Add Question" to build your assessment.
          </div>
        ) : (
          questions.map((q, idx) => {
            const opts = Array.isArray(q.options) 
              ? q.options 
              : typeof q.options === "string" 
                ? JSON.parse(q.options) 
                : [];
            return (
              <div
                key={q.id || idx}
                className="relative overflow-hidden rounded-2xl border border-border/85 bg-card/45 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                      Order: {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Category: {q.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">
                    {selectedLanguage === "hi" ? `[Hindi] ${q.text} ?` : selectedLanguage === "hng" ? `[Hinglish] ${q.text} kya hai?` : q.text}
                  </h3>

                  {/* Options render */}
                  <div className="grid gap-2 grid-cols-2">
                    {opts.map((opt: any, oIdx: number) => (
                      <div key={opt.id || oIdx} className="flex items-center justify-between bg-accent/20 border border-border/40 rounded-xl px-3 py-1.5 text-xs text-muted-foreground font-medium">
                        <span className="truncate">{opt.text}</span>
                        <span className="font-mono text-primary font-bold">{opt.points}pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations and Reorder triggers */}
                <div className="inline-flex items-center gap-2 md:self-center">
                  {/* Reorder controls */}
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none shadow-sm transition-all"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === questions.length - 1}
                    className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none shadow-sm transition-all"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  {/* Edit/Delete */}
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground shadow-sm transition-all ml-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => q.id && handleDeleteQuestion(q.id)}
                    className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-destructive hover:border-destructive/40 shadow-sm transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-lg flex flex-col max-h-[90vh] text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-xl font-bold tracking-tight">
                {editing.id ? "Edit Assessment Question" : "Create Question"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto py-5 space-y-4 pr-1 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question Statement</label>
                <input
                  type="text"
                  placeholder="e.g. Do you enjoy writing and compiling software code?"
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category Category</label>
                <input
                  type="text"
                  placeholder="e.g. Technical / Engineering"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {/* Options builder */}
              <div className="space-y-3 pt-3 border-t border-border/80">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Question Options & Scoring</label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter choice answer label (e.g. Strongly Agree)..."
                    value={newOptText}
                    onChange={(e) => setNewOptText(e.target.value)}
                    className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={newOptPoints}
                    onChange={(e) => setNewOptPoints(Number(e.target.value))}
                    className="w-16 h-10 rounded-xl border border-border bg-background px-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                  <button
                    onClick={handleAddOption}
                    className="h-10 rounded-xl bg-primary text-primary-foreground px-4 text-xs font-semibold hover:bg-primary/95 transition-all"
                  >
                    Add
                  </button>
                </div>

                {/* Display option builder list */}
                <div className="space-y-2 border border-dashed border-border rounded-2xl p-3 min-h-[80px]">
                  {optionList.length === 0 ? (
                    <span className="text-xs text-muted-foreground block text-center py-4">No answers choices configured yet.</span>
                  ) : (
                    optionList.map((o) => (
                      <div key={o.id} className="flex items-center justify-between bg-accent/20 border border-border/40 rounded-xl px-3.5 py-2 text-xs">
                        <span className="font-semibold text-foreground">{o.text}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-primary font-bold">{o.points} pts</span>
                          <button
                            onClick={() => setOptionList(optionList.filter((x) => x.id !== o.id))}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuestion} variant="gradient">
                Save Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
