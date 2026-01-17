"use client";

import { SplitText } from "fetta/react";
import { animate, stagger } from "motion";

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
