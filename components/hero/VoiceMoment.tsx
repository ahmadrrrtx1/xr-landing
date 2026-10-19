"use client";

/**
 * VoiceMoment — the one moment where you hear XR.
 *
 * The line is "Hey, I'm XR. I'll be available for you soon." The repo
 * ships the voice *code* (`src/voice/`) but no audio asset of its own,
 * so until the owner records the real line this plays a clearly
 * labelled placeholder track. The label is not a footnote — it is on
 * the button.
 *
 * The audio is analysed with the Web Audio API and the live level is
 * pushed to the energy field through an `xr:energy` window event, so
 * the avatar's field breathes with the voice rather than on a timer.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const SRC = "/media/placeholder-voice.mp3";

export default function VoiceMoment() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [level, setLevel] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.preload = "none";
    audioRef.current = audio;

    const onReady = () => setReady(true);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
      setLevel(0);
      window.dispatchEvent(new CustomEvent("xr:energy", { detail: { value: 0 } }));
    };
    audio.addEventListener("canplay", onReady);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      cancelAnimationFrame(rafRef.current);
      void ctxRef.current?.close();
    };
  }, []);

  const analyse = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    // Perceptual-ish curve: quiet speech should still move the field.
    const value = Math.min(1, rms * 3.4);
    setLevel(value);
    window.dispatchEvent(new CustomEvent("xr:energy", { detail: { value } }));
    rafRef.current = requestAnimationFrame(analyse);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.75;
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      }
      if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
      setEnded(false);
      await audio.play();
      setPlaying(true);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(analyse);
    } catch {
      setPlaying(false);
    }
  }, [analyse]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setLevel(0);
    cancelAnimationFrame(rafRef.current);
    window.dispatchEvent(new CustomEvent("xr:energy", { detail: { value: 0 } }));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playing ? stop : play}
          aria-pressed={playing}
          className="group inline-flex h-11 items-center gap-3 rounded-xl border border-[var(--color-line)] bg-ink/80 px-4 text-sm font-medium text-primary transition hover:border-[var(--color-line-accent)] hover:bg-raised"
        >
          <span
            aria-hidden="true"
            className="relative flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-line-accent)]"
          >
            {playing ? (
              <span className="block h-2.5 w-2.5 rounded-[2px] bg-accent" />
            ) : (
              <span className="ml-0.5 block h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-accent" />
            )}
          </span>
          {playing ? "Stop" : "Hear XR"}
        </button>

        {/* Level meter — decorative, the button carries the state. */}
        <div aria-hidden="true" className="flex h-6 items-end gap-[3px]">
          {Array.from({ length: 14 }).map((_, i) => {
            const active = playing && level > i / 16;
            return (
              <span
                key={i}
                className="w-[3px] rounded-full transition-[height,background-color] duration-150"
                style={{
                  height: `${active ? 6 + (i % 5) * 4 : 4}px`,
                  background: active ? "var(--color-accent)" : "var(--color-line)",
                }}
              />
            );
          })}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-tertiary">
        {ended
          ? "That was the placeholder voice line — the repo ships the voice code, not an audio asset. XR's own recording replaces it."
          : "Placeholder voice line. The repo ships the voice code, not an audio asset — XR's own recording replaces it."}
      </p>
    </div>
  );
}
