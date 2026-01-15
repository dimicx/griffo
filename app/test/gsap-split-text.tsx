"use client";

import { SplitText } from "gsap/SplitText";
import { stagger, useAnimate } from "motion/react";
import { useEffect, useId, useRef } from "react";

export function GsapSplitText() {
  const [scope, animate] = useAnimate();
  const id = useId();
  const splitRef = useRef<SplitText | null>(null);

  useEffect(() => {
    let split: SplitText | null = null;

    const initSplit = async () => {
      if (!scope.current) return;

      // Cleanup previous split if it exists
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }

      // Create new split
      split = SplitText.create(scope.current.children[0], {
        type: "lines, chars",
        mask: "lines",
        autoSplit: true,
        linesClass: "split-line",
      });

      splitRef.current = split;

      if (split.lines.length > 0) {
        split.lines.forEach((line: HTMLElement) => {
          line.classList.add("will-change-transform");
          line.style.transform = "translateY(100%)";
        });
      }

      if (split.lines.length > 0) {
        await animate(
          split.lines,
          { y: ["100%", "0%"] },
          {
            duration: 1,
            ease: [0.23, 1, 0.32, 1],
            delay: stagger(0.05),
            // onComplete: () => {
            //   if (splitRef.current === split) {
            //     splitRef.current.revert();
            //     splitRef.current = null;
            //   }
            // },
          }
        );
      }
    };

    document.fonts.ready.then(initSplit);

    // Cleanup function
    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }
    };
  }, [animate, scope]);

  return (
    <div ref={scope}>
      <p className="text-lg leading-relaxed text-zinc-300">
        Create beautiful animations with just a few lines of code. Motion
        handles the complexity so you can focus on what matters most—building
        great user experiences that delight and engage.
      </p>
    </div>
  );
}
