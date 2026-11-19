"use client";

import { useEffect } from "react";

/**
 * Plays a soft typewriter click on every click anywhere on the page, from
 * /sound/click.wav. The bytes are fetched on mount and decoded on the first
 * click (browsers only allow audio from a user gesture), then replayed from a
 * shared buffer so rapid clicks overlap cleanly. Renders nothing.
 */
export function ClickSound() {
  useEffect(() => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    let ctx: AudioContext | null = null;
    let buffer: AudioBuffer | null = null;
    let bytes: ArrayBuffer | null = null;

    // Fetch the file bytes up front so the first click can decode and play at once.
    fetch("/sound/click.wav")
      .then((r) => r.arrayBuffer())
      .then((b) => (bytes = b))
      .catch(() => {});

    async function play() {
      try {
        ctx ??= new AC!();
        const c = ctx;
        if (c.state === "suspended") await c.resume();
        if (!buffer) {
          if (!bytes) return; // not fetched yet; a later click will sound
          buffer = await c.decodeAudioData(bytes.slice(0));
        }
        const src = c.createBufferSource();
        src.buffer = buffer;
        const gain = c.createGain();
        gain.gain.value = 0.6; // soft
        src.connect(gain).connect(c.destination);
        // The file has ~0.1s of silence before the click; skip it so the sound is
        // immediate on click instead of lagging (onset is ~104ms in).
        const LEAD_SILENCE = 0.095;
        src.start(0, Math.min(LEAD_SILENCE, buffer.duration));
      } catch {
        // Audio unavailable: ignore.
      }
    }

    window.addEventListener("pointerdown", play);

    // Shrink the plus-cursor's legs while the button is held, so it reads as a press.
    // A class on <html> swaps to a smaller-plus cursor (see globals.css).
    const press = () => document.documentElement.classList.add("cursor-press");
    const release = () => document.documentElement.classList.remove("cursor-press");
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);

    return () => {
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  return null;
}
