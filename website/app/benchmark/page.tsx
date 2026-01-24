import { KerningBenchmark } from "../components/kerning-benchmark";

export default function BenchmarkPage() {
  return (
    <main className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Kerning Measurement Benchmark</h1>
      <p className="text-muted-foreground mb-8">
        Compare performance of different kerning measurement approaches across
        browsers.
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
        <h2>Methods Compared</h2>
        <ul>
          <li>
            <strong>DOM optimized (current)</strong> — Deduplicates character
            measurements (each unique char measured once), then measures pairs.
            Inherits all styles including font-smoothing.
          </li>
          <li>
            <strong>DOM sequential (old)</strong> — Measures char1, char2, and
            pair for every pair (no deduplication). Accurate but slower.
          </li>
          <li>
            <strong>Canvas-based</strong> — Uses{" "}
            <code>CanvasRenderingContext2D.measureText()</code>. Cannot inherit{" "}
            <code>-webkit-font-smoothing</code>.
          </li>
          <li>
            <strong>Range API</strong> — Uses{" "}
            <code>Range.getBoundingClientRect()</code> on text nodes. Safari
            historically returns integer values.
          </li>
        </ul>
      </div>

      <KerningBenchmark />

      <div className="prose prose-neutral dark:prose-invert max-w-none mt-8">
        <h2>Notes</h2>
        <ul>
          <li>Each method runs 1000 iterations after a 10-iteration warmup</li>
          <li>
            Performance varies by browser — try in Chrome, Firefox, and Safari
          </li>
          <li>
            DOM-based is chosen for accuracy (Safari font-smoothing support),
            not speed
          </li>
        </ul>
      </div>
    </main>
  );
}
