"use client";

import { animate, stagger } from "motion";
import { SplitText } from "../split-text";
import { GsapSplitText } from "./gsap-split-text";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-8 py-24 font-sans">
      <div className="mx-auto max-w-4xl space-y-16">
        <h1 className="text-4xl font-bold text-white">
          SplitText Robustness Tests
        </h1>

        {/* GSAP SplitText */}
        <GsapSplitText />

        {/* Test 1: Emoji handling */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            1. Emoji & Grapheme Clusters
          </h2>
          <p className="text-sm text-zinc-500">
            Tests Intl.Segmenter - should handle multi-codepoint emojis
            correctly
          </p>
          <SplitText
            onSplit={({ chars }) => {
              animate(
                chars,
                { opacity: [0, 1], y: [10, 0] },
                { delay: stagger(0.05) }
              );
            }}
          >
            <p className="text-2xl text-zinc-300">
              Hello 👨‍👩‍👦 World 🎉✨ Testing emojis! 🚀
            </p>
          </SplitText>
        </section>

        {/* Test 2: Em-dash wrapping */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            2. Em-dash Wrapping
          </h2>
          <p className="text-sm text-zinc-500">
            Should wrap naturally after em-dashes
          </p>
          <div className="max-w-md">
            <SplitText
              autoSplit
              onSplit={({ lines }) => {
                animate(
                  lines,
                  { opacity: [0, 1], x: [-30, 0] },
                  { delay: stagger(0.1) }
                );
              }}
            >
              <p className="text-lg leading-relaxed text-zinc-300">
                This is a test—and it should work—with proper wrapping at
                various widths.
              </p>
            </SplitText>
          </div>
        </section>

        {/* Test 3: Different font sizes (line tolerance) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            3. Dynamic Line Detection
          </h2>
          <p className="text-sm text-zinc-500">
            Tests dynamic tolerance based on font size
          </p>
          <SplitText
            onSplit={({ lines }) => {
              animate(
                lines,
                { opacity: [0, 1], y: [20, 0] },
                { delay: stagger(0.15) }
              );
            }}
          >
            <p className="text-6xl font-bold leading-tight text-zinc-200">
              Large Text Should Wrap Correctly
            </p>
          </SplitText>
        </section>

        {/* Test 4: CSS Custom Properties */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            4. CSS Custom Properties (propIndex)
          </h2>
          <p className="text-sm text-zinc-500">
            Each char should have --char-index CSS variable
          </p>
          <SplitText
            options={{ propIndex: true }}
            onSplit={({ chars }) => {
              // Animate using CSS variables
              chars.forEach((char) => {
                const index = parseInt(
                  char.style.getPropertyValue("--char-index") || "0"
                );
                char.style.transitionDelay = `${index * 0.03}s`;
              });
              animate(
                chars,
                { opacity: [0, 1], scale: [0.5, 1] },
                { duration: 0.5 }
              );
            }}
          >
            <p className="text-2xl text-zinc-300">Custom Properties Test</p>
          </SplitText>
        </section>

        {/* Test 5: will-change optimization */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            5. Performance Hints (will-change)
          </h2>
          <p className="text-sm text-zinc-500">
            Elements should have will-change: transform, opacity
          </p>
          <SplitText
            options={{ willChange: true }}
            onSplit={({ words }) => {
              animate(
                words,
                { opacity: [0, 1], rotate: [-5, 0] },
                { delay: stagger(0.04) }
              );
            }}
          >
            <p className="text-xl text-zinc-300">
              Optimized for smooth animations
            </p>
          </SplitText>
        </section>

        {/* Test 6: prefers-reduced-motion */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            6. Accessibility (prefers-reduced-motion)
          </h2>
          <p className="text-sm text-zinc-500">
            Check browser DevTools: System Preferences → Reduce Motion
          </p>
          <SplitText
            onSplit={({ words, prefersReducedMotion }) => {
              if (prefersReducedMotion) {
                // Instant, no animation
                words.forEach((w) => (w.style.opacity = "1"));
              } else {
                // Smooth animation
                animate(words, { opacity: [0, 1] }, { delay: stagger(0.05) });
              }
            }}
          >
            <p className="text-xl text-zinc-300">
              Respects user motion preferences
            </p>
          </SplitText>
        </section>

        {/* Test 7: Empty edge case */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            7. Edge Cases
          </h2>
          <p className="text-sm text-zinc-500">
            Single character, very long word, etc.
          </p>
          <div className="space-y-2">
            <SplitText
              onSplit={({ chars }) => {
                animate(chars, { opacity: [0, 1] });
              }}
            >
              <p className="text-lg text-zinc-300">A</p>
            </SplitText>
            <SplitText
              onSplit={({ chars }) => {
                animate(chars, { opacity: [0, 1] }, { delay: stagger(0.01) });
              }}
            >
              <p className="text-lg text-zinc-300">
                Supercalifragilisticexpialidocious
              </p>
            </SplitText>
          </div>
        </section>

        {/* Test 8: AutoSplit with onResize */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">
            8. AutoSplit with onResize Callback
          </h2>
          <p className="text-sm text-zinc-500">
            Resize window to trigger re-split with callback
          </p>
          <div className="max-w-lg">
            <SplitText
              autoSplit
              onSplit={({ lines }) => {
                console.log("Initial split:", lines.length, "lines");
                animate(lines, { opacity: [0, 1] }, { delay: stagger(0.1) });
              }}
              onResize={({ lines }) => {
                console.log("Re-split:", lines.length, "lines");
              }}
            >
              <p className="text-lg leading-relaxed text-zinc-300">
                This text will re-split when you resize the browser window.
                Watch the console to see the onResize callback fire. The
                debounce is now 200ms for better stability.
              </p>
            </SplitText>
          </div>
        </section>

        {/* Test 9: Type Option - Selective Splitting */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-emerald-400">
              9. Type Option - Selective Splitting (NEW!)
            </h2>
            <p className="text-sm text-zinc-500">
              Split by chars, words, or lines - or any combination
            </p>
          </div>

          {/* Default: All types */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              Default: chars + words + lines
            </h3>
            <p className="text-xs text-zinc-600">
              Full splitting with char-level animation
            </p>
            <SplitText
              onSplit={({ chars }) => {
                animate(
                  chars,
                  { opacity: [0, 1], y: [10, 0] },
                  { delay: stagger(0.02) }
                );
              }}
            >
              <p
                className="text-3xl text-zinc-200"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Beautiful typography matters
              </p>
            </SplitText>
          </div>

          {/* Words + Lines only */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              Words + Lines Only
            </h3>
            <p className="text-xs text-zinc-600">
              Skip char splitting - ligatures remain enabled, better performance
            </p>
            <SplitText
              options={{ type: "words,lines" }}
              onSplit={({ words }) => {
                animate(
                  words,
                  { opacity: [0, 1], scale: [0.9, 1] },
                  { delay: stagger(0.05) }
                );
              }}
            >
              <p
                className="text-3xl text-zinc-200"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Beautiful typography matters
              </p>
            </SplitText>
          </div>

          {/* Lines only */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">Lines Only</h3>
            <p className="text-xs text-zinc-600">
              Maximum performance - only line detection
            </p>
            <div className="max-w-md">
              <SplitText
                options={{ type: "lines" }}
                onSplit={({ lines }) => {
                  animate(
                    lines,
                    { opacity: [0, 1], x: [-20, 0] },
                    { delay: stagger(0.1) }
                  );
                }}
              >
                <p className="text-lg leading-relaxed text-zinc-300">
                  This text splits into lines only, perfect for simple
                  line-by-line animations without the overhead of character
                  splitting.
                </p>
              </SplitText>
            </div>
          </div>

          {/* Reference (unsplit) */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              Reference (Unsplit)
            </h3>
            <p className="text-xs text-zinc-600">
              Original text for comparison
            </p>
            <p
              className="text-3xl text-zinc-200"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Beautiful typography matters
            </p>
          </div>

          <div className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-400">
            <p className="font-semibold text-white">How it works:</p>
            <ul className="mt-2 space-y-1">
              <li>
                • <code>type: &quot;chars,words,lines&quot;</code> (default) -
                Full splitting with all features
              </li>
              <li>
                • <code>type: &quot;words,lines&quot;</code> - Skips char
                splitting for better performance
              </li>
              <li>
                • <code>type: &quot;lines&quot;</code> - Only line detection,
                maximum performance
              </li>
              <li>
                • <strong>Ligatures:</strong> Auto-disabled when splitting
                chars, enabled when not
              </li>
              <li>
                • Notice ligatures (fi, ff, tt) in &quot;words,lines&quot; vs
                default
              </li>
            </ul>
          </div>
        </section>

        {/* Test 10: All 7 Type Combinations - Performance Optimization Test */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-emerald-400">
              10. All 7 Type Combinations - Performance Test
            </h2>
            <p className="text-sm text-zinc-500">
              Testing optimized splitting - no unnecessary word spans created
            </p>
          </div>

          {/* 1. chars only */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              1. type: &quot;chars&quot;
            </h3>
            <p className="text-xs text-zinc-600">
              Returns char spans only (word spans created internally for spacing)
            </p>
            <SplitText
              options={{ type: "chars" }}
              onSplit={({ chars, words, lines }) => {
                console.log("chars only:", {
                  chars: chars.length,
                  words: words.length,
                  lines: lines.length,
                });
                animate(chars, { opacity: [0, 1] }, { delay: stagger(0.01) });
              }}
            >
              <p className="text-xl text-zinc-200">Hello World</p>
            </SplitText>
          </div>

          {/* 2. words only */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              2. type: &quot;words&quot;
            </h3>
            <p className="text-xs text-zinc-600">
              Word spans with text content, no char spans
            </p>
            <SplitText
              options={{ type: "words" }}
              onSplit={({ chars, words, lines }) => {
                console.log("words only:", {
                  chars: chars.length,
                  words: words.length,
                  lines: lines.length,
                });
                animate(words, { opacity: [0, 1] }, { delay: stagger(0.05) });
              }}
            >
              <p className="text-xl text-zinc-200">Hello World Testing</p>
            </SplitText>
          </div>

          {/* 3. lines only */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              3. type: &quot;lines&quot;
            </h3>
            <p className="text-xs text-zinc-600">
              Line spans with text nodes, no word or char spans (optimized!)
            </p>
            <div className="max-w-sm">
              <SplitText
                options={{ type: "lines" }}
                onSplit={({ chars, words, lines }) => {
                  console.log("lines only:", {
                    chars: chars.length,
                    words: words.length,
                    lines: lines.length,
                  });
                  animate(lines, { opacity: [0, 1] }, { delay: stagger(0.1) });
                }}
              >
                <p className="text-lg leading-relaxed text-zinc-200">
                  This text should wrap into multiple lines for testing line
                  detection without unnecessary word spans.
                </p>
              </SplitText>
            </div>
          </div>

          {/* 4. chars,words */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              4. type: &quot;chars,words&quot;
            </h3>
            <p className="text-xs text-zinc-600">
              Word spans containing char spans, no lines
            </p>
            <SplitText
              options={{ type: "chars,words" }}
              onSplit={({ chars, words, lines }) => {
                console.log("chars,words:", {
                  chars: chars.length,
                  words: words.length,
                  lines: lines.length,
                });
                animate(
                  words,
                  { opacity: [0, 1], scale: [0.9, 1] },
                  { delay: stagger(0.05) }
                );
              }}
            >
              <p className="text-xl text-zinc-200">Hello World</p>
            </SplitText>
          </div>

          {/* 5. words,lines */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              5. type: &quot;words,lines&quot;
            </h3>
            <p className="text-xs text-zinc-600">
              Line spans containing word spans, no char spans
            </p>
            <div className="max-w-sm">
              <SplitText
                options={{ type: "words,lines" }}
                onSplit={({ chars, words, lines }) => {
                  console.log("words,lines:", {
                    chars: chars.length,
                    words: words.length,
                    lines: lines.length,
                  });
                  animate(words, { opacity: [0, 1] }, { delay: stagger(0.04) });
                }}
              >
                <p className="text-lg leading-relaxed text-zinc-200">
                  This text should wrap into multiple lines with word spans
                  inside line spans.
                </p>
              </SplitText>
            </div>
          </div>

          {/* 6. chars,lines */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              6. type: &quot;chars,lines&quot;
            </h3>
            <p className="text-xs text-zinc-600">
              Returns char + line spans (word spans created internally for spacing)
            </p>
            <div className="max-w-sm">
              <SplitText
                options={{ type: "chars,lines" }}
                onSplit={({ chars, words, lines }) => {
                  console.log("chars,lines:", {
                    chars: chars.length,
                    words: words.length,
                    lines: lines.length,
                  });
                  animate(chars, { opacity: [0, 1] }, { delay: stagger(0.02) });
                }}
              >
                <p className="text-lg leading-relaxed text-zinc-200">
                  This text should wrap into multiple lines with char spans
                  directly inside line spans.
                </p>
              </SplitText>
            </div>
          </div>

          {/* 7. chars,words,lines (default) */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-400">
              7. type: &quot;chars,words,lines&quot; (default)
            </h3>
            <p className="text-xs text-zinc-600">
              Full hierarchy: line spans → word spans → char spans
            </p>
            <div className="max-w-sm">
              <SplitText
                onSplit={({ chars, words, lines }) => {
                  console.log("chars,words,lines:", {
                    chars: chars.length,
                    words: words.length,
                    lines: lines.length,
                  });
                  animate(chars, { opacity: [0, 1] }, { delay: stagger(0.01) });
                }}
              >
                <p className="text-lg leading-relaxed text-zinc-200">
                  This text should have the complete hierarchy with all three
                  split types.
                </p>
              </SplitText>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-400">
            <p className="font-semibold text-white">
              How it works:
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                • When splitting <strong>chars</strong>, word spans are created internally for proper spacing
              </li>
              <li>
                • Only the requested types are returned in the result arrays
              </li>
              <li>
                • <code>type: &quot;chars&quot;</code> returns chars only (words array is empty)
              </li>
              <li>
                • <code>type: &quot;chars,lines&quot;</code> returns chars + lines (words array is empty)
              </li>
              <li>
                • <strong>Optimized:</strong> type: &quot;lines&quot; (text nodes only, no char/word spans)
              </li>
              <li>• Check console logs to see result counts</li>
            </ul>
          </div>
        </section>

        <div className="border-t border-zinc-800 pt-8">
          <p className="text-center text-sm text-zinc-500">
            Open browser DevTools Console to see warnings and logs
          </p>
        </div>
      </div>
    </div>
  );
}
