"use client";

import { useEffect, useRef } from "react";
import { splitText, type SplitTextResult } from "fetta";
import { SplitText } from "fetta/react";
import { animate, stagger } from "motion";
import gsap from "gsap";

export function BasicFadeIn() {
  return (
    <SplitText
      onSplit={({ words }) => {
        animate(
          words,
          { opacity: [0, 1], y: [20, 0] },
          { delay: stagger(0.05), duration: 0.5 },
        );
      }}
    >
      <h2 className="text-3xl font-bold my-0!">Fade in each word</h2>
    </SplitText>
  );
}

export function CharacterReveal() {
  return (
    <SplitText
      onSplit={({ chars }) => {
        animate(
          chars,
          { opacity: [0, 1], scale: [0.5, 1] },
          { delay: stagger(0.02), duration: 0.3 },
        );
      }}
    >
      <h2 className="text-3xl font-bold my-0!">Character by character</h2>
    </SplitText>
  );
}

export function LineByLine() {
  return (
    <SplitText
      onSplit={({ lines }) => {
        animate(
          lines,
          { opacity: [0, 1], x: [-20, 0] },
          { delay: stagger(0.1), duration: 0.6 },
        );
      }}
    >
      <p className="text-lg max-w-md text-center">
        This paragraph animates line by line. Each line slides in from the left.
      </p>
    </SplitText>
  );
}

export function ScrollTriggered() {
  return (
    <SplitText
      onSplit={({ words }) => {
        words.forEach((w) => (w.style.opacity = "0"));
      }}
      inView={{ amount: 0.5, once: true }}
      onInView={({ words }) =>
        animate(
          words,
          { opacity: [0, 1], y: [30, 0] },
          { delay: stagger(0.03) },
        )
      }
    >
      <h2 className="text-2xl font-bold my-0!">Reveals on scroll</h2>
    </SplitText>
  );
}

// Vanilla examples using splitText directly

export function BasicFadeInVanilla() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { words } = splitText(ref.current);
    animate(
      words,
      { opacity: [0, 1], y: [20, 0] },
      { delay: stagger(0.05), duration: 0.5 },
    );
  }, []);

  return (
    <h2 ref={ref} className="text-3xl font-bold my-0!">
      Fade in each word
    </h2>
  );
}

export function CharacterRevealVanilla() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { chars } = splitText(ref.current);
    animate(
      chars,
      { opacity: [0, 1], scale: [0.5, 1] },
      { delay: stagger(0.02), duration: 0.3 },
    );
  }, []);

  return (
    <h2 ref={ref} className="text-3xl font-bold my-0!">
      Character by character
    </h2>
  );
}

export function LineByLineVanilla() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { lines } = splitText(ref.current);
    animate(
      lines,
      { opacity: [0, 1], x: [-20, 0] },
      { delay: stagger(0.1), duration: 0.6 },
    );
  }, []);

  return (
    <p ref={ref} className="text-lg max-w-md text-center">
      This paragraph animates line by line. Each line slides in from the left.
    </p>
  );
}

export function AutoRevertVanilla() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { words } = splitText(ref.current);
    const animation = animate(
      words,
      { opacity: [0, 1], y: [20, 0] },
      { delay: stagger(0.05) },
    );
    splitText(ref.current, { revertOnComplete: animation.finished });
  }, []);

  return (
    <h2 ref={ref} className="text-3xl font-bold my-0!">
      Auto-revert after animation
    </h2>
  );
}

const RESPONSIVE_TEXT =
  "Resize the window to see this text re-split and animate again.";

export function ResponsiveSplitVanilla() {
  const ref = useRef<HTMLParagraphElement>(null);
  const resultRef = useRef<SplitTextResult | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Reset to original text before splitting (handles React StrictMode double-execution)
    ref.current.textContent = RESPONSIVE_TEXT;

    resultRef.current = splitText(ref.current, {
      autoSplit: true,
      onResize: ({ lines }) => {
        animate(
          lines,
          { opacity: [0, 1], y: [16, 0] },
          { delay: stagger(0.08), duration: 0.4 },
        );
      },
    });
    // Initial animation
    if (resultRef.current.lines) {
      animate(
        resultRef.current.lines,
        { opacity: [0, 1], y: [16, 0] },
        { delay: stagger(0.08), duration: 0.4 },
      );
    }
    return () => resultRef.current?.dispose();
  }, []);

  return (
    <p ref={ref} className="text-lg max-w-sm text-center">
      {RESPONSIVE_TEXT}
    </p>
  );
}

export function WithGSAPVanilla() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { words } = splitText(ref.current);
    gsap.from(words, {
      opacity: 0,
      y: 30,
      stagger: 0.05,
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  return (
    <h2 ref={ref} className="text-3xl font-bold my-0!">
      Animated with GSAP
    </h2>
  );
}
