OLD PLAN BELOW (COMPLETED)

Previous work: Robustness improvements

function segmentGraphemes(text: string): string[] {
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
return [...segmenter.segment(text)].map(s => s.segment);
}

Changes:

- Update measureOriginalText() to use grapheme segmentation
- Handle multi-codepoint emojis correctly
- Test with: "Hello 👨‍👩‍👦 World 🎉✨"

  1.2 Fix line detection tolerance

File: app/split-text/splitText.ts (line ~237)

Replace hardcoded 5px with dynamic calculation:
const fontSize = parseFloat(getComputedStyle(element).fontSize);
const tolerance = Math.max(5, fontSize \* 0.3);

1.3 Add robust error handling

File: app/split-text/splitText.ts

Add validation at function entry:
export function splitText(element: HTMLElement, options?: SplitTextOptions): SplitResult {
// Validation
if (!(element instanceof HTMLElement)) {
throw new Error('splitText: element must be an HTMLElement');
}

const text = element.textContent?.trim();
if (!text) {
console.warn('splitText: element has no text content');
return { chars: [], words: [], lines: [], revert: () => {}, dispose: () => {} };
}

if (options?.autoSplit && !element.parentElement) {
console.warn('splitText: autoSplit requires a parent element');
}
// ... rest of function
}

Phase 2: Feature Additions

2.1 Add type option for selective splitting

File: app/split-text/splitText.ts

Update interface:
export interface SplitTextOptions {
type?: 'chars' | 'words' | 'lines' | 'chars,words' | 'words,lines' | 'chars,lines' | 'chars,words,lines';
// ... existing options
}

Implementation logic:

- Parse type string into flags: splitChars, splitWords, splitLines
- Default to 'chars,words,lines' (current behavior)
- Skip character measurement/creation when !splitChars
- Skip word spans when !splitWords (chars go directly in lines)
- Performance benefit: less DOM, less measurement

  2.2 Add prefers-reduced-motion awareness

File: app/split-text/splitText.ts

Add to options and result:
export interface SplitTextOptions {
// ... existing
}

export interface SplitResult {
// ... existing
prefersReducedMotion: boolean; // Expose for consumer to check
}

Implementation:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Add to return object for consumers to check

2.3 Add CSS custom property indices

File: app/split-text/splitText.ts

export interface SplitTextOptions {
propIndex?: boolean; // Adds --char-index, --word-index, --line-index
}

In span creation:
if (options.propIndex) {
charSpan.style.setProperty('--char-index', charIndex.toString());
wordSpan.style.setProperty('--word-index', wordIndex.toString());
lineSpan.style.setProperty('--line-index', lineIndex.toString());
}

2.4 Expose onResize in React component

File: app/split-text/index.tsx

Add prop:
interface SplitTextProps {
// ... existing
onResize?: (result: Omit<SplitResult, "revert" | "dispose">) => void;
}

Pass to core function when autoSplit is enabled.

2.5 Clean up unused splitBy option

File: app/split-text/splitText.ts

Either implement or remove from interface. Recommend removing since type serves the purpose.

Phase 3: Performance Optimizations

3.1 Skip unnecessary work based on type

- If type: 'lines' only: skip character measurement entirely
- If type: 'words,lines': skip kerning compensation (not needed for words)

  3.2 Increase debounce to 200ms

Match GSAP default, more stable for rapid resizes.

3.3 Add will-change hint option

export interface SplitTextOptions {
willChange?: boolean; // Adds will-change: transform, opacity to split elements
}

---

Files to Modify
┌─────────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ File │ Changes │
├─────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ app/split-text/splitText.ts │ Core fixes: grapheme, tolerance, errors, type option, propIndex │
├─────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ app/split-text/index.tsx │ Add onResize prop, pass through to core │
└─────────────────────────────┴─────────────────────────────────────────────────────────────────┘

---

Verification Plan

Manual Testing

1. Run npm run dev
2. Test on /comparison page - toggle both implementations
3. Test emoji text: Add test case with "Hello 👨‍👩‍👦 World 🎉"
4. Test different font sizes (12px, 48px, 96px) for line detection
5. Resize browser to test autoSplit
6. Check prefers-reduced-motion in browser devtools

Edge Cases to Test

- Empty element
- Single character
- Very long word (no spaces)
- Text with only emojis
- Text with em-dashes at start/end
- Rapid resize events

Performance Check

- Profile splitting 1000+ character text
- Verify no memory leaks with autoSplit (dispose properly)
