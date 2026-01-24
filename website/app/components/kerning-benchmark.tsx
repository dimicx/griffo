"use client";

import { useState, useRef, useCallback } from "react";

interface BenchmarkResult {
  name: string;
  ops: number;
  mean: number;
  samples: number;
}

// DOM-based kerning measurement (sequential - OLD implementation)
function measureKerningDOMSequential(
  element: HTMLElement,
  chars: string[]
): Map<number, number> {
  const kerningMap = new Map<number, number>();
  if (chars.length < 2) return kerningMap;

  const measurer = document.createElement("span");
  measurer.style.cssText = `position: absolute; visibility: hidden; white-space: pre;`;

  const styles = getComputedStyle(element);
  measurer.style.font = styles.font;
  measurer.style.letterSpacing = styles.letterSpacing;
  measurer.style.wordSpacing = styles.wordSpacing;
  measurer.style.fontKerning = styles.fontKerning;
  measurer.style.fontVariantLigatures = "none";

  // @ts-expect-error - webkit property
  const webkitSmoothing = styles.webkitFontSmoothing;
  // @ts-expect-error - moz property
  const mozSmoothing = styles.MozOsxFontSmoothing;
  if (webkitSmoothing) {
    // @ts-expect-error - webkit property
    measurer.style.webkitFontSmoothing = webkitSmoothing;
  }
  if (mozSmoothing) {
    // @ts-expect-error - moz property
    measurer.style.MozOsxFontSmoothing = mozSmoothing;
  }

  element.appendChild(measurer);

  for (let i = 0; i < chars.length - 1; i++) {
    const char1 = chars[i];
    const char2 = chars[i + 1];
    const pair = char1 + char2;

    measurer.textContent = pair;
    const pairWidth = measurer.getBoundingClientRect().width;

    measurer.textContent = char1;
    const char1Width = measurer.getBoundingClientRect().width;

    measurer.textContent = char2;
    const char2Width = measurer.getBoundingClientRect().width;

    const kerning = pairWidth - char1Width - char2Width;
    if (Math.abs(kerning) > 0.01) {
      kerningMap.set(i + 1, kerning);
    }
  }

  element.removeChild(measurer);
  return kerningMap;
}

// DOM-based kerning measurement (optimized - NEW implementation)
// Deduplicates character measurements, still measures pairs individually
function measureKerningDOMOptimized(
  element: HTMLElement,
  chars: string[]
): Map<number, number> {
  const kerningMap = new Map<number, number>();
  if (chars.length < 2) return kerningMap;

  const measurer = document.createElement("span");
  measurer.style.cssText = `position: absolute; visibility: hidden; white-space: pre;`;

  const styles = getComputedStyle(element);
  measurer.style.font = styles.font;
  measurer.style.letterSpacing = styles.letterSpacing;
  measurer.style.wordSpacing = styles.wordSpacing;
  measurer.style.fontKerning = styles.fontKerning;
  measurer.style.fontVariantLigatures = "none";

  // @ts-expect-error - webkit property
  const webkitSmoothing = styles.webkitFontSmoothing;
  // @ts-expect-error - moz property
  const mozSmoothing = styles.MozOsxFontSmoothing;
  if (webkitSmoothing) {
    // @ts-expect-error - webkit property
    measurer.style.webkitFontSmoothing = webkitSmoothing;
  }
  if (mozSmoothing) {
    // @ts-expect-error - moz property
    measurer.style.MozOsxFontSmoothing = mozSmoothing;
  }

  element.appendChild(measurer);

  // Phase 1: Measure unique characters (deduplicated)
  const uniqueChars = new Set<string>(chars);
  const charWidths = new Map<string, number>();
  for (const char of uniqueChars) {
    measurer.textContent = char;
    charWidths.set(char, measurer.getBoundingClientRect().width);
  }

  // Phase 2: Measure pairs and calculate kerning
  for (let i = 0; i < chars.length - 1; i++) {
    const char1 = chars[i];
    const char2 = chars[i + 1];

    measurer.textContent = char1 + char2;
    const pairWidth = measurer.getBoundingClientRect().width;

    const char1Width = charWidths.get(char1)!;
    const char2Width = charWidths.get(char2)!;

    const kerning = pairWidth - char1Width - char2Width;
    if (Math.abs(kerning) > 0.01) {
      kerningMap.set(i + 1, kerning);
    }
  }

  element.removeChild(measurer);
  return kerningMap;
}

// Canvas-based kerning measurement (previous implementation)
function measureKerningCanvas(
  element: HTMLElement,
  chars: string[]
): Map<number, number> {
  const kerningMap = new Map<number, number>();
  if (chars.length < 2) return kerningMap;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const styles = getComputedStyle(element);
  ctx.font = styles.font;

  for (let i = 0; i < chars.length - 1; i++) {
    const char1 = chars[i];
    const char2 = chars[i + 1];
    const pair = char1 + char2;

    const pairWidth = ctx.measureText(pair).width;
    const char1Width = ctx.measureText(char1).width;
    const char2Width = ctx.measureText(char2).width;

    const kerning = pairWidth - char1Width - char2Width;
    if (Math.abs(kerning) > 0.01) {
      kerningMap.set(i + 1, kerning);
    }
  }

  return kerningMap;
}

// Range API-based measurement (original implementation)
function measureKerningRange(
  element: HTMLElement,
  chars: string[]
): Map<number, number> {
  const kerningMap = new Map<number, number>();
  if (chars.length < 2) return kerningMap;

  const textNode = document.createTextNode(chars.join(""));
  const wrapper = document.createElement("span");
  wrapper.style.cssText = `position: absolute; visibility: hidden; white-space: pre;`;

  const styles = getComputedStyle(element);
  wrapper.style.font = styles.font;
  wrapper.style.letterSpacing = styles.letterSpacing;
  wrapper.style.fontKerning = styles.fontKerning;
  wrapper.style.fontVariantLigatures = "none";

  wrapper.appendChild(textNode);
  element.appendChild(wrapper);

  const range = document.createRange();
  let offset = 0;

  for (let i = 0; i < chars.length - 1; i++) {
    // Measure first char width
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + chars[i].length);
    const char1Rect = range.getBoundingClientRect();

    // Measure second char position
    range.setStart(textNode, offset + chars[i].length);
    range.setEnd(textNode, offset + chars[i].length + chars[i + 1].length);
    const char2Rect = range.getBoundingClientRect();

    // Kerning = gap between char1 end and char2 start
    const kerning = char2Rect.left - char1Rect.right;

    if (Math.abs(kerning) > 0.01) {
      kerningMap.set(i + 1, kerning);
    }

    offset += chars[i].length;
  }

  element.removeChild(wrapper);
  return kerningMap;
}

function runBenchmark(
  fn: () => void,
  iterations: number = 1000
): { ops: number; mean: number; samples: number } {
  // Warmup
  for (let i = 0; i < 10; i++) fn();

  const times: number[] = [];
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    fn();
    times.push(performance.now() - t0);
  }

  const total = performance.now() - start;
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const ops = Math.round(1000 / mean);

  return { ops, mean, samples: iterations };
}

export function KerningBenchmark() {
  const [results, setResults] = useState<{
    short: BenchmarkResult[];
    medium: BenchmarkResult[];
    long: BenchmarkResult[];
  } | null>(null);
  const [running, setRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const runBenchmarks = useCallback(() => {
    if (!containerRef.current) return;
    setRunning(true);

    // Use requestAnimationFrame to allow UI to update
    requestAnimationFrame(() => {
      const element = containerRef.current!;

      const shortText = "Hello World";
      const mediumText =
        "The quick brown fox jumps over the lazy dog. Typography matters.";
      const longText =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

      const runForText = (text: string): BenchmarkResult[] => {
        const chars = [...text];

        const domOptimizedResult = runBenchmark(() =>
          measureKerningDOMOptimized(element, chars)
        );
        const domSequentialResult = runBenchmark(() =>
          measureKerningDOMSequential(element, chars)
        );
        const canvasResult = runBenchmark(() =>
          measureKerningCanvas(element, chars)
        );
        const rangeResult = runBenchmark(() =>
          measureKerningRange(element, chars)
        );

        return [
          { name: "DOM optimized (current)", ...domOptimizedResult },
          { name: "DOM sequential (old)", ...domSequentialResult },
          { name: "Canvas-based", ...canvasResult },
          { name: "Range API", ...rangeResult },
        ];
      };

      const shortResults = runForText(shortText);
      const mediumResults = runForText(mediumText);
      const longResults = runForText(longText);

      setResults({
        short: shortResults,
        medium: mediumResults,
        long: longResults,
      });
      setRunning(false);
    });
  }, []);

  return (
    <div className="my-8 space-y-6">
      <div
        ref={containerRef}
        className="p-4 border rounded-lg bg-background"
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
        }}
      >
        <p className="text-muted-foreground text-sm mb-4">
          Benchmark container (text measurement happens here)
        </p>

        <button
          onClick={runBenchmarks}
          disabled={running}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {running ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          <BenchmarkTable title="Short text (11 chars)" results={results.short} />
          <BenchmarkTable title="Medium text (64 chars)" results={results.medium} />
          <BenchmarkTable title="Long text (192 chars)" results={results.long} />
        </div>
      )}
    </div>
  );
}

function BenchmarkTable({
  title,
  results,
}: {
  title: string;
  results: BenchmarkResult[];
}) {
  const fastest = Math.max(...results.map((r) => r.ops));

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-2 font-medium">{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-2">Method</th>
            <th className="text-right px-4 py-2">ops/sec</th>
            <th className="text-right px-4 py-2">mean (ms)</th>
            <th className="text-right px-4 py-2">relative</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">
                {result.name}
                {result.ops === fastest && (
                  <span className="ml-2 text-green-600 text-xs">fastest</span>
                )}
              </td>
              <td className="text-right px-4 py-2 font-mono">
                {result.ops.toLocaleString()}
              </td>
              <td className="text-right px-4 py-2 font-mono">
                {result.mean.toFixed(4)}
              </td>
              <td className="text-right px-4 py-2 font-mono">
                {result.ops === fastest
                  ? "1.00x"
                  : `${(result.ops / fastest).toFixed(2)}x`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
