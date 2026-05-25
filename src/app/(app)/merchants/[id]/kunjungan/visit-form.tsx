"use client";

import { useActionState, useState, useTransition } from "react";
import {
  Loader2,
  PenLine,
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceTextarea } from "@/components/voice-textarea";
import {
  extractAction,
  saveVisitAction,
  type SaveVisitState,
} from "./actions";
import { VISIT_ACTIONS } from "@/lib/db/schema";
import { VISIT_ACTION_LABEL } from "@/lib/constants";
import type { ExtractedInsights } from "@/lib/gemini";

const initial: SaveVisitState = {};

const EMPTY: ExtractedInsights = {
  pain_points: [],
  current_bank: [],
  current_merchant_app: [],
  customer_needs: [],
  referrals: [],
  summary: "",
};

export function VisitForm({ merchantId }: { merchantId: string }) {
  const [state, formAction, saving] = useActionState(saveVisitAction, initial);
  const [notes, setNotes] = useState("");
  const [extracting, startExtract] = useTransition();
  const [extracted, setExtracted] = useState<ExtractedInsights | null>(null);

  function runExtract() {
    if (!notes.trim()) {
      toast.error("Tulis dulu catatannya.");
      return;
    }
    startExtract(async () => {
      try {
        const result = await extractAction(notes);
        setExtracted(result);
        const total =
          result.pain_points.length +
          result.current_bank.length +
          result.current_merchant_app.length +
          result.customer_needs.length +
          result.referrals.length;
        toast.success(
          total > 0
            ? `Berhasil ekstrak ${total} insight.`
            : "Catatan tersimpan; tidak ada insight spesifik ditemukan.",
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Gagal memanggil Gemini.",
        );
        setExtracted(EMPTY);
      }
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="merchantId" value={merchantId} />
      <input
        type="hidden"
        name="extracted"
        value={JSON.stringify(extracted ?? EMPTY)}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="action">Jenis aktivitas</Label>
            <Select name="action" defaultValue="survei">
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIT_ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {VISIT_ACTION_LABEL[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="flex items-center gap-1.5">
              <PenLine className="size-3.5" />
              Catatan kunjungan
              <span className="text-red-500">*</span>
            </Label>
            <VoiceTextarea
              name="notes"
              required
              value={notes}
              onChange={setNotes}
              rows={7}
              placeholder="Tulis atau dikte: kondisi merchant, bank yg dipakai, keluhan, kebutuhan, referral ke toko lain, dll."
            />
            <p className="text-xs text-slate-400 mt-4">
              Tap ikon mic untuk dikte (Bahasa Indonesia).
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={extracting || !notes.trim()}
            onClick={runExtract}
            className="w-full h-11 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {extracting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {extracting
              ? "Mengekstrak…"
              : extracted
                ? "Ekstrak ulang dengan Gemini"
                : "Ekstrak insight dengan Gemini"}
          </Button>
        </CardContent>
      </Card>

      {extracted && (
        <Card className="border-blue-100 bg-blue-50/40">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">
                Insight terdeteksi — bisa kamu edit
              </p>
            </div>

            {extracted.summary && (
              <div className="text-xs bg-white border border-blue-100 rounded-md p-2 italic text-slate-700">
                &ldquo;{extracted.summary}&rdquo;
              </div>
            )}

            <EditableChips
              label="Pain points"
              items={extracted.pain_points}
              onChange={(items) =>
                setExtracted({ ...extracted, pain_points: items })
              }
            />
            <EditableChips
              label="Bank yang dipakai"
              items={extracted.current_bank}
              onChange={(items) =>
                setExtracted({ ...extracted, current_bank: items })
              }
            />
            <EditableChips
              label="Merchant app saat ini"
              items={extracted.current_merchant_app}
              onChange={(items) =>
                setExtracted({ ...extracted, current_merchant_app: items })
              }
            />
            <EditableChips
              label="Kebutuhan customer"
              items={extracted.customer_needs}
              onChange={(items) =>
                setExtracted({ ...extracted, customer_needs: items })
              }
            />

            <EditableReferrals
              referrals={extracted.referrals}
              onChange={(refs) =>
                setExtracted({ ...extracted, referrals: refs })
              }
            />
          </CardContent>
        </Card>
      )}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2 text-center">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={saving}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {saving ? "Menyimpan…" : "Simpan kunjungan"}
      </Button>
      <p className="text-xs text-center text-slate-400">
        Bisa langsung simpan tanpa ekstrak — insight bisa diisi manual nanti.
      </p>
    </form>
  );
}

function EditableChips({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {items.length === 0 && (
          <span className="text-xs text-slate-400 italic">Belum ada</span>
        )}
        {items.map((item, i) => (
          <Badge
            key={i}
            variant="outline"
            className="bg-white text-xs font-normal pr-1"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="ml-1 size-4 inline-flex items-center justify-center rounded-full hover:bg-slate-100"
              aria-label={`Hapus ${item}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
          placeholder="Tambah…"
          className="h-8 text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (input.trim()) {
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function EditableReferrals({
  referrals,
  onChange,
}: {
  referrals: Array<{ name: string; note?: string }>;
  onChange: (next: Array<{ name: string; note?: string }>) => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1">
        Referral merchant lain
      </p>
      <div className="space-y-1 mb-2">
        {referrals.length === 0 && (
          <span className="text-xs text-slate-400 italic">Belum ada</span>
        )}
        {referrals.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-md px-2 py-1"
          >
            <div className="text-xs min-w-0">
              <p className="font-medium text-slate-800 truncate">{r.name}</p>
              {r.note && <p className="text-slate-500 truncate">{r.note}</p>}
            </div>
            <button
              type="button"
              onClick={() => onChange(referrals.filter((_, j) => j !== i))}
              className="size-6 shrink-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100"
              aria-label="Hapus"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama merchant"
          className="h-8 text-xs"
        />
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan singkat"
          className="h-8 text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (name.trim()) {
              onChange([
                ...referrals,
                { name: name.trim(), note: note.trim() || undefined },
              ]);
              setName("");
              setNote("");
            }
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
