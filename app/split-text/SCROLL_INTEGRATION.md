# Scroll & InView Integration Guide

Complete guide for integrating SplitText with Motion's scroll and viewport detection features.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [React Patterns](#react-patterns)
3. [Vanilla JS Patterns](#vanilla-js-patterns)
4. [Best Practices](#best-practices)
5. [Common Pitfalls](#common-pitfalls)

## Quick Reference

### When to Use What

| Use Case | React | Vanilla JS |
|----------|-------|------------|
| Trigger once when visible | `useInView` + colocate in `onSplit` | `inView` callback |
| Re-animate on visibility | `useInView` + `useEffect` + ref | `inView` with cleanup |
| Scroll-linked (parallax) | `useScroll` + `useEffect` + ref | `scroll` callback |
| With responsive text | Store in ref, re-setup on resize | Use `onResize` callback |

### Storage Strategy

**✅ Use State with useEffect** - Recommended for scroll animations:
```tsx
// React - proper pattern for useInView
const [words, setWords] = useState([]);

useEffect(() => {
  if (isInView && words.length > 0) {
    animate(words, { opacity: [0, 1] });
  }
}, [isInView, words]);

// In onSplit: set initial styles, then store
onSplit={({ words }) => {
  words.forEach(w => w.style.opacity = "0");
  setWords(words);
}}
```

**📦 Use Ref** - For scroll-linked animations:
```tsx
// React - when directly manipulating styles
const wordsRef = useRef(null);
```

**❌ Avoid Colocating** - Won't react to isInView changes:
```tsx
// DON'T DO THIS with useInView
<SplitText onSplit={({ words }) => {
  if (isInView) animate(words, { opacity: [0, 1] });
}}>
// onSplit runs once, can't respond to isInView changes
```

## React Patterns

### Pattern 1: Animate Once When Visible (useEffect Pattern)

**Best for:** Simple "reveal on scroll" animations that trigger once.

```tsx
import { SplitText } from './split-text';
import { animate, stagger } from 'motion';
import { useInView } from 'motion/react';
import { useRef, useEffect, useState } from 'react';

function AnimateOnView() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,    // Only trigger once
    amount: 0.5    // 50% visible
  });
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (isInView && words.length > 0) {
      animate(
        words,
        { opacity: [0, 1], y: [20, 0] },
        { delay: stagger(0.05) }
      );
    }
  }, [isInView, words]);

  return (
    <div ref={ref}>
      <SplitText
        onSplit={({ words }) => {
          // Set initial styles to prevent flash
          words.forEach(word => {
            word.style.opacity = "0";
            word.style.transform = "translateY(20px)";
          });
          setWords(words);
        }}
      >
        <h1>Reveals when scrolled into view</h1>
      </SplitText>
    </div>
  );
}
```

**Why this pattern:**
- `useEffect` watches for `isInView` changes
- Initial styles prevent flash before animation
- Clean separation of concerns

### Pattern 2: Re-animate on Each View

**Best for:** Animations that should replay when element enters viewport multiple times.

```tsx
function ReanimateOnView() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.3 }); // No "once" - tracks visibility
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (words.length === 0) return;

    if (isInView) {
      animate(
        words,
        { opacity: [0, 1], scale: [0.8, 1] },
        { delay: stagger(0.05) }
      );
    } else {
      // Animate out when leaving viewport
      animate(words, { opacity: 0, scale: 0.8 }, { duration: 0.3 });
    }
  }, [isInView, words]); // Re-run when visibility changes

  return (
    <div ref={containerRef}>
      <SplitText
        onSplit={({ words }) => {
          // Set initial hidden state
          words.forEach(word => {
            word.style.opacity = "0";
            word.style.transform = "scale(0.8)";
          });
          setWords(words);
        }}
      >
        <h1>Re-animates each time visible</h1>
      </SplitText>
    </div>
  );
}
```

**Why this pattern:**
- Animations trigger on both enter and leave
- Initial styles prevent flash
- Clean effect dependencies

### Pattern 3: Scroll-Linked Animation

**Best for:** Parallax effects, scroll-driven reveals, progress-based animations.

```tsx
import { useScroll } from 'motion/react';

function ScrollLinked() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const wordsRef = useRef(null);

  useEffect(() => {
    if (!wordsRef.current) return;

    // Subscribe to scroll progress changes
    return scrollYProgress.on("change", (progress) => {
      wordsRef.current.forEach((word, i) => {
        // Stagger based on index
        const wordProgress = Math.max(0, progress - (i * 0.05));
        word.style.opacity = wordProgress;
        word.style.transform = `translateY(${(1 - wordProgress) * 20}px)`;
      });
    });
  }, [scrollYProgress]);

  return (
    <div ref={ref} style={{ height: '200vh' }}>
      <SplitText
        onSplit={({ words }) => {
          wordsRef.current = words;
        }}
      >
        <h1>Animates as you scroll</h1>
      </SplitText>
    </div>
  );
}
```

### Pattern 4: With AutoSplit

**Best for:** Responsive layouts where text reflows.

```tsx
function ResponsiveScrollReveal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (isInView && words.length > 0) {
      animate(words, { opacity: [0, 1] }, { delay: stagger(0.03) });
    }
  }, [isInView, words]);

  return (
    <div ref={ref}>
      <SplitText
        autoSplit // Re-splits on resize
        onSplit={({ words }) => {
          // Set initial state
          words.forEach(word => word.style.opacity = "0");
          setWords(words);
        }}
        onResize={({ words }) => {
          // IMPORTANT: Also set initial state on resize!
          words.forEach(word => word.style.opacity = "0");
          setWords(words);
        }}
      >
        <p className="text-lg">
          This text re-splits responsively and re-animates
          when scrolled into view after resize.
        </p>
      </SplitText>
    </div>
  );
}
```

**Critical for AutoSplit:**
- Set initial styles in **both** `onSplit` and `onResize`
- Without this, text flashes after resize

## Vanilla JS Patterns

### Pattern 1: Basic InView Trigger

```typescript
import { splitText } from './splitText';
import { inView } from 'motion';
import { animate, stagger } from 'motion';

const element = document.querySelector('[data-animate]');
const result = splitText(element);

// Fires once when element enters viewport
inView(
  element,
  () => {
    animate(
      result.words,
      { opacity: [0, 1], y: [20, 0] },
      { delay: stagger(0.05) }
    );
  },
  { amount: 0.5 }
);
```

### Pattern 2: Enter/Leave Animations

```typescript
const element = document.querySelector('[data-animate]');
const result = splitText(element);

inView(
  element,
  () => {
    // Enter animation
    animate(
      result.words,
      { opacity: [0, 1], scale: [0.8, 1] },
      { delay: stagger(0.05) }
    );

    // Return cleanup for leave animation
    return () => {
      animate(
        result.words,
        { opacity: 0, scale: 0.8 },
        { duration: 0.3 }
      );
    };
  },
  { amount: 0.3 }
);
```

### Pattern 3: Scroll-Linked

```typescript
import { scroll } from 'motion';

const element = document.querySelector('[data-scroll]');
const result = splitText(element);

scroll(
  ({ y }) => {
    result.words.forEach((word, i) => {
      const progress = Math.max(0, Math.min(1, y.progress - (i * 0.05)));
      word.style.opacity = progress.toString();
      word.style.transform = `translateY(${(1 - progress) * 20}px)`;
    });
  },
  {
    target: element,
    offset: ["start end", "end start"]
  }
);
```

### Pattern 4: AutoSplit with InView Re-setup

```typescript
const element = document.querySelector('[data-split]');

function setupInView(words: HTMLSpanElement[]) {
  inView(
    element,
    () => {
      animate(
        words,
        { opacity: [0, 1] },
        { delay: stagger(0.03) }
      );
    },
    { amount: 0.5 }
  );
}

const result = splitText(element, {
  autoSplit: true,
  onResize: ({ words }) => {
    // Re-setup inView when text re-splits
    setupInView(words);
  }
});

// Initial setup
setupInView(result.words);

// Cleanup
window.addEventListener('beforeunload', () => {
  result.dispose();
});
```

## Best Practices

### ✅ DO: Set Initial Styles to Prevent Flash

**Critical for scroll animations!**

```tsx
// React
<SplitText
  onSplit={({ words }) => {
    // Set initial styles FIRST
    words.forEach(word => {
      word.style.opacity = "0";
      word.style.transform = "translateY(20px)";
    });
    setWords(words);
  }}
>

// Vanilla
const result = splitText(element);
result.words.forEach(word => {
  word.style.opacity = "0";
});
inView(element, () => {
  animate(result.words, { opacity: [0, 1] });
});
```

### ✅ DO: Use State + useEffect for InView (React)

```tsx
const [words, setWords] = useState([]);

useEffect(() => {
  if (isInView && words.length > 0) {
    animate(words, { opacity: [0, 1] });
  }
}, [isInView, words]);
```

### ✅ DO: Use Refs for Scroll-Linked Animations (React)

```tsx
const wordsRef = useRef(null); // No re-renders

useEffect(() => {
  if (!wordsRef.current) return;

  return scrollYProgress.on("change", (progress) => {
    wordsRef.current.forEach(word => {
      word.style.opacity = progress;
    });
  });
}, [scrollYProgress]);
```

### ✅ DO: Cleanup AutoSplit Resources

```tsx
// React - automatic cleanup on unmount
useEffect(() => {
  return () => result.dispose();
}, []);

// Vanilla - manual cleanup
window.addEventListener('beforeunload', () => {
  result.dispose();
});
```

### ❌ DON'T: Skip Setting Initial Styles

```tsx
// ❌ BAD - text will flash before animation
<SplitText onSplit={({ words }) => setWords(words)}>

// ✅ GOOD - set initial styles first
<SplitText onSplit={({ words }) => {
  words.forEach(w => w.style.opacity = "0");
  setWords(words);
}}>
```

### ❌ DON'T: Split Before Fonts Load

```tsx
// ❌ BAD - fonts may not be loaded
const result = splitText(element);

// ✅ GOOD - wait for fonts
document.fonts.ready.then(() => {
  const result = splitText(element);
});

// ✅ GOOD - React component handles this automatically
<SplitText onSplit={...}>
```

### ❌ DON'T: Forget to Dispose AutoSplit

```tsx
// ❌ BAD - memory leak!
const result = splitText(element, { autoSplit: true });

// ✅ GOOD - cleanup
const result = splitText(element, { autoSplit: true });
window.addEventListener('beforeunload', () => {
  result.dispose();
});
```

## Common Pitfalls

### Pitfall 1: Text Flashes Before Animation (FOUC)

**Problem:**
Text is visible before the animation runs when scrolling into view, creating a "flash of unstyled content":

```tsx
function InViewExample() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (isInView && words.length > 0) {
      // Text is already visible by the time animation runs!
      animate(words, { opacity: [0, 1] });
    }
  }, [isInView, words]);

  return (
    <div ref={ref}>
      <SplitText onSplit={({ words }) => setWords(words)}>
        <p>This text flashes before animating!</p>
      </SplitText>
    </div>
  );
}
```

**Why it happens:**
1. Split elements are created with default `opacity: 1`
2. Element becomes visible immediately after splitting
3. `useInView` detects visibility
4. Animation tries to tween from `[0, 1]` but element is already at `1`

**Solution:** Set initial styles in `onSplit` to match animation start values:

```tsx
function InViewExample() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (isInView && words.length > 0) {
      animate(words, { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.05) });
    }
  }, [isInView, words]);

  return (
    <div ref={ref}>
      <SplitText
        onSplit={({ words }) => {
          // ✅ Set initial styles BEFORE storing
          words.forEach(word => {
            word.style.opacity = "0";
            word.style.transform = "translateY(20px)";
          });
          setWords(words);
        }}
      >
        <p>This text starts hidden, then animates smoothly!</p>
      </SplitText>
    </div>
  );
}
```

**Key principle:** Initial styles must match the **first value** in the animation array:
- `opacity: [0, 1]` → set `style.opacity = "0"`
- `y: [20, 0]` → set `style.transform = "translateY(20px)"`
- `scale: [0.8, 1]` → set `style.transform = "scale(0.8)"`
- `rotateY: [90, 0]` → set `style.transform = "rotateY(90deg)"`
- `filter: ['blur(4px)', 'blur(0px)']` → set `style.filter = "blur(4px)"`

**With multiple transforms:**
```tsx
onSplit={({ words }) => {
  words.forEach(word => {
    word.style.opacity = "0";
    word.style.transform = "translateY(20px) scale(0.8)";
  });
  setWords(words);
}}
```

**With AutoSplit - set initial state in BOTH handlers:**
```tsx
<SplitText
  autoSplit
  onSplit={({ words }) => {
    words.forEach(word => word.style.opacity = "0");
    setWords(words);
  }}
  onResize={({ words }) => {
    // Also set on resize!
    words.forEach(word => word.style.opacity = "0");
    setWords(words);
  }}
>
```

### Pitfall 2: Animation Doesn't Trigger

**Problem:**
```tsx
// isInView is false when onSplit runs
const isInView = useInView(ref);

<div ref={ref}>
  <SplitText onSplit={({ words }) => {
    if (isInView) animate(words, { opacity: [0, 1] });
  }}>
```

**Solution:** Use `once: true` or check timing:
```tsx
const isInView = useInView(ref, { once: true });
// OR use useEffect pattern for re-animation
```

### Pitfall 2: Scroll Animation Stutters

**Problem:**
```tsx
// Creating new animations on every scroll update
scroll(({ y }) => {
  animate(words, { opacity: y.progress }); // BAD!
});
```

**Solution:** Update styles directly:
```tsx
scroll(({ y }) => {
  words.forEach(word => {
    word.style.opacity = y.progress; // GOOD!
  });
});
```

### Pitfall 3: AutoSplit Breaking InView

**Problem:**
```typescript
// inView only set up once, but words array changes on resize
inView(element, () => {
  animate(result.words, { opacity: [0, 1] });
});

const result = splitText(element, { autoSplit: true });
```

**Solution:** Re-setup in onResize:
```typescript
const result = splitText(element, {
  autoSplit: true,
  onResize: ({ words }) => {
    setupInView(words); // Re-setup!
  }
});
```

## InView Options Reference

```typescript
inView(element, callback, {
  // How much of element must be visible
  amount: 0.5,           // 0-1 or "some" | "all"

  // Root element for intersection
  root: document.querySelector('#container'),

  // Margin around viewport
  margin: "0px 0px -100px 0px"
});

// React
useInView(ref, {
  once: true,            // Only fire callback once
  amount: 0.5,
  root: containerRef,
  margin: "0px"
});
```

## Scroll Options Reference

```typescript
scroll(callback, {
  // Target element to track
  target: element,

  // Offset points [start, end]
  offset: ["start end", "end start"],
  // "start end" = target start hits viewport end
  // "end start" = target end hits viewport start

  // Axis to track
  axis: "y" // or "x"
});

// React
useScroll({
  target: ref,
  offset: ["start end", "end start"],
  axis: "y"
});
```

## Resources

- [Motion InView Docs](https://motion.dev/docs/inview)
- [Motion Scroll Docs](https://motion.dev/docs/scroll)
- [React useInView Docs](https://motion.dev/docs/react-use-in-view)
- [React useScroll Docs](https://motion.dev/docs/react-use-scroll)
- [Core API Documentation](./CORE_API.md)
- [React API Documentation](./REACT_API.md)
