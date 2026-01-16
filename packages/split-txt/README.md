# split-txt

A text splitting library with built-in kerning compensation for smooth text animations.

## Features

- **Kerning Compensation** - Maintains original character spacing after splitting
- **Responsive AutoSplit** - Re-splits on container resize
- **Auto-Revert** - Restore original HTML after animations
- **Line Detection** - Automatically groups words into lines
- **Special Characters** - Smart handling of em-dashes and en-dashes
- **Built-in InView** - Viewport detection with `inView`, `onInView`, `onLeaveView` props
- **TypeScript** - Full type definitions included
- **Framework Agnostic** - Use with vanilla JS or React

## Installation

```bash
npm install split-txt
```

## Usage

### Vanilla JavaScript

```typescript
import { splitTxt } from 'split-txt';
import { animate, stagger } from 'motion';

const element = document.querySelector('h1');
const result = splitTxt(element);

animate(
  result.words,
  { opacity: [0, 1], y: [20, 0] },
  { delay: stagger(0.05) }
);
```

### React

```tsx
import { SplitTxt } from 'split-txt/react';
import { animate, stagger } from 'motion';

function MyComponent() {
  return (
    <SplitTxt
      onSplit={({ words }) => {
        animate(
          words,
          { opacity: [0, 1], y: [20, 0] },
          { delay: stagger(0.05) }
        );
      }}
    >
      <h1>Animated Text</h1>
    </SplitTxt>
  );
}
```

## API

### splitTxt(element, options?)

Split text in an HTML element into characters, words, and/or lines.

```typescript
const result = splitTxt(element, {
  type: 'chars,words,lines', // What to split into
  charClass: 'split-char',   // Class for character spans
  wordClass: 'split-word',   // Class for word spans
  lineClass: 'split-line',   // Class for line spans
  autoSplit: false,          // Re-split on container resize
  onResize: (result) => {},  // Callback after re-split
  revertOnComplete: promise, // Auto-revert when promise resolves
  propIndex: false,          // Add --char-index CSS variables
  willChange: false,         // Add will-change hint
});

// Result
result.chars;  // HTMLSpanElement[]
result.words;  // HTMLSpanElement[]
result.lines;  // HTMLSpanElement[]
result.revert();  // Restore original HTML
result.dispose(); // Cleanup observers
```

### SplitTxt (React)

React component wrapper with automatic lifecycle management.

```tsx
<SplitTxt
  // Called after text is split
  onSplit={({ chars, words, lines, revert }) => {
    // Set initial state, run animations
    // Return animation for revertOnComplete support
    return animate(words, { opacity: [0, 1] });
  }}
  // Called when autoSplit triggers a re-split
  onResize={({ chars, words, lines, revert }) => {}}
  // Split options
  options={{
    type: 'chars,words,lines',
    charClass: 'split-char',
    wordClass: 'split-word',
    lineClass: 'split-line',
    propIndex: false,
    willChange: false,
  }}
  // Re-split on container resize
  autoSplit={false}
  // Revert after animation completes
  revertOnComplete={false}
  // Viewport detection (built-in IntersectionObserver)
  inView={false}  // or { amount: 0.5, margin: '0px', once: true }
  // Called when element enters viewport
  onInView={({ chars, words, lines, revert }) => {
    return animate(words, { opacity: [0, 1] });
  }}
  // Called when element leaves viewport
  onLeaveView={({ chars, words, lines, revert }) => {
    animate(words, { opacity: 0 });
  }}
>
  <h1>Text to split</h1>
</SplitTxt>
```

**Callback result types:**
- All callbacks receive `{ chars, words, lines, revert }` where `revert()` restores original HTML
- Return an animation (with `.finished` promise) or array of animations for `revertOnComplete` support
- When `revertOnComplete` is enabled with `inView`, revert triggers after `onInView` animation completes

## Common Patterns

### Responsive Text

```typescript
// Vanilla
const result = splitTxt(element, {
  autoSplit: true,
  onResize: ({ lines }) => {
    animate(lines, { opacity: [0, 1] });
  }
});

// Cleanup when done
result.dispose();
```

```tsx
// React
<SplitTxt
  autoSplit
  onSplit={({ lines }) => {
    animate(lines, { opacity: [0, 1] });
  }}
  onResize={({ lines }) => {
    // Re-animate on resize
    animate(lines, { opacity: [0, 1] });
  }}
>
  <p>Responsive paragraph</p>
</SplitTxt>
```

### Auto-Revert After Animation

```typescript
// Vanilla
const animation = animate(words, { opacity: [0, 1] });
splitTxt(element, {
  revertOnComplete: animation.finished
});
```

```tsx
// React
<SplitTxt
  revertOnComplete
  onSplit={({ words }) => {
    return animate(words, { opacity: [0, 1] }).finished;
  }}
>
  <h1>Text</h1>
</SplitTxt>
```

### Scroll-Triggered Animation (React)

Using the built-in `inView` prop - no hooks needed:

```tsx
<SplitTxt
  onSplit={({ words }) => {
    // Set initial hidden state
    words.forEach(w => w.style.opacity = '0');
  }}
  inView={{ amount: 0.5, once: true }}
  onInView={({ words }) =>
    animate(words, { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.05) })
  }
>
  <p>This animates when scrolled into view</p>
</SplitTxt>
```

### Enter/Leave Animations

```tsx
<SplitTxt
  onSplit={({ words }) => {
    words.forEach(w => w.style.opacity = '0');
  }}
  inView={{ amount: 0.3 }}
  onInView={({ words }) =>
    animate(words, { opacity: [0, 1], scale: [0.8, 1] }, { delay: stagger(0.05) })
  }
  onLeaveView={({ words }) =>
    animate(words, { opacity: 0, scale: 0.8 }, { duration: 0.3 })
  }
>
  <p>Watch me fade in and out as you scroll!</p>
</SplitTxt>
```

### Manual Revert Control

```tsx
<SplitTxt
  inView={{ once: true }}
  onSplit={({ words }) => {
    words.forEach(w => w.style.opacity = '0');
  }}
  onInView={({ words, revert }) => {
    animate(words, { opacity: 1 }).finished.then(() => {
      // Revert after 2 seconds
      setTimeout(revert, 2000);
    });
  }}
>
  <p>Text reverts after animation</p>
</SplitTxt>
```

## How It Works

1. **Measures** original character positions using Range API
2. **Splits** text into nested spans (lines > words > chars)
3. **Compensates** for kerning by applying CSS margins
4. **Detects** lines based on Y-position clustering
5. **Observes** (optional) for responsive re-splitting
6. **Reverts** (optional) after animations complete

## Browser Support

Requires modern browser features:
- `ResizeObserver`
- `Intl.Segmenter`
- `Range.getBoundingClientRect()`

All evergreen browsers are supported (Chrome, Firefox, Safari, Edge).

## License

MIT
