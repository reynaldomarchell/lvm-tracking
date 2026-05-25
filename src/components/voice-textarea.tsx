"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Web Speech API types (vendor-prefixed, not in lib.dom.d.ts by default)
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceTextarea({
  name,
  defaultValue,
  placeholder,
  required,
  rows = 6,
  onChange,
  value,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  onChange?: (v: string) => void;
  value?: string;
}) {
  const [text, setText] = useState(value ?? defaultValue ?? "");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState<boolean>(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef<string>(text);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  // Sync from parent (controlled mode)
  useEffect(() => {
    if (value != null && value !== text) {
      setText(value);
      baseTextRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (next: string) => {
    setText(next);
    onChange?.(next);
  };

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recog = new Ctor();
    recog.lang = "id-ID";
    recog.continuous = true;
    recog.interimResults = true;

    baseTextRef.current = text.trim();
    recog.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const t = result[0].transcript;
        if (result.isFinal) final += t;
        else interim += t;
      }
      if (final) baseTextRef.current = `${baseTextRef.current} ${final}`.trim();
      update(`${baseTextRef.current} ${interim}`.trim());
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recog.start();
    recognitionRef.current = recog;
    setListening(true);
  };

  return (
    <div className="relative">
      <Textarea
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        value={text}
        onChange={(e) => update(e.target.value)}
        className="pr-12 text-base"
      />
      {supported && (
        <Button
          type="button"
          variant={listening ? "destructive" : "outline"}
          size="icon"
          className={cn(
            "absolute bottom-2 right-2 size-10 rounded-full shadow-md",
            listening && "animate-pulse",
          )}
          onClick={toggle}
          aria-label={listening ? "Berhenti merekam" : "Rekam suara"}
        >
          {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>
      )}
      {!supported && (
        <p className="absolute -bottom-5 right-0 text-[10px] text-slate-400">
          Voice input belum didukung di browser ini.
        </p>
      )}
    </div>
  );
}
