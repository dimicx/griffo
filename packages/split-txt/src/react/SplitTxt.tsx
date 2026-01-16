import { splitTxt, SplitTxtResult } from "../core/splitTxt";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface SplitTxtOptions {
  type?:
    | "chars"
    | "words"
    | "lines"
    | "chars,words"
    | "words,lines"
    | "chars,lines"
    | "chars,words,lines";
  charClass?: string;
  wordClass?: string;
  lineClass?: string;
  propIndex?: boolean;
  willChange?: boolean;
}

interface InViewOptions {
  /** How much of the element must be visible (0-1). Default: 0 */
  amount?: number;
  /** Root margin for IntersectionObserver. Default: "0px" */
  margin?: string;
  /** Only trigger once. Default: false */
  once?: boolean;
}

/** Result passed to callbacks, includes revert for manual control */
export interface SplitTxtElements {
  chars: HTMLSpanElement[];
  words: HTMLSpanElement[];
  lines: HTMLSpanElement[];
  /** Revert to original HTML (manual control) */
  revert: () => void;
}

/** Animation object with finished promise (e.g., from motion's animate()) */
type AnimationWithFinished = { finished: Promise<unknown> };

/** Return type for callbacks - void, single animation, array of animations, or promise */
type CallbackReturn =
  | void
  | AnimationWithFinished
  | AnimationWithFinished[]
  | Promise<unknown>;

interface SplitTxtProps {
  children: ReactElement;
  /**
   * Called after text is split.
   * Return an animation or promise to enable revert (requires revertOnComplete).
   * If inView is enabled, this is called immediately but animation typically runs in onInView.
   */
  onSplit?: (result: SplitTxtElements) => CallbackReturn;
  /** Called when autoSplit triggers a re-split on resize */
  onResize?: (result: SplitTxtElements) => void;
  options?: SplitTxtOptions;
  autoSplit?: boolean;
  /** When true, reverts to original HTML after animation promise resolves */
  revertOnComplete?: boolean;
  /** Enable viewport detection. Pass true for defaults or InViewOptions for customization */
  inView?: boolean | InViewOptions;
  /** Called when element enters viewport. Return animation for revertOnComplete support */
  onInView?: (result: SplitTxtElements) => CallbackReturn;
  /** Called when element leaves viewport */
  onLeaveView?: (result: SplitTxtElements) => CallbackReturn;
}

/**
 * Normalize callback return to a promise.
 * Handles: Animation, Animation[], Promise, or void
 */
function normalizeToPromise(result: CallbackReturn): Promise<unknown> | null {
  if (!result) return null;

  // Array of animations
  if (Array.isArray(result)) {
    const promises = result.map((r) =>
      "finished" in r ? r.finished : Promise.resolve(r)
    );
    return Promise.all(promises);
  }

  // Single animation with finished property
  if (typeof result === "object" && "finished" in result) {
    return result.finished;
  }

  // Already a promise
  if (result instanceof Promise) {
    return result;
  }

  return null;
}

/**
 * React component wrapper for the splitTxt function.
 * Uses the optimized splitTxt that handles kerning compensation
 * and dash splitting in a single pass.
 */
export const SplitTxt = forwardRef<HTMLDivElement, SplitTxtProps>(
  function SplitTxt(
    {
      children,
      onSplit,
      onResize,
      options,
      autoSplit = false,
      revertOnComplete = false,
      inView,
      onInView,
      onLeaveView,
    },
    forwardedRef
  ) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge internal ref with forwarded ref
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );
  const [childElement, setChildElement] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  // Stable refs for callbacks and options
  const onSplitRef = useRef(onSplit);
  const onResizeRef = useRef(onResize);
  const optionsRef = useRef(options);
  const revertOnCompleteRef = useRef(revertOnComplete);
  const inViewRef = useRef(inView);
  const onInViewRef = useRef(onInView);
  const onLeaveViewRef = useRef(onLeaveView);

  useLayoutEffect(() => {
    onSplitRef.current = onSplit;
    onResizeRef.current = onResize;
    optionsRef.current = options;
    revertOnCompleteRef.current = revertOnComplete;
    inViewRef.current = inView;
    onInViewRef.current = onInView;
    onLeaveViewRef.current = onLeaveView;
  });

  // Refs for tracking state
  const hasSplitRef = useRef(false);
  const hasRevertedRef = useRef(false);
  const revertFnRef = useRef<(() => void) | null>(null);
  const splitResultRef = useRef<SplitTxtElements | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredOnceRef = useRef(false);

  const childRefCallback = useCallback((node: HTMLElement | null) => {
    setChildElement(node);
  }, []);

  // Initial split
  useEffect(() => {
    if (!childElement) return;
    if (hasSplitRef.current) return;

    let isMounted = true;

    document.fonts.ready.then(() => {
      if (!isMounted || hasSplitRef.current) return;
      if (!containerRef.current) return;

      // Use core splitTxt with autoSplit feature
      const result = splitTxt(childElement, {
        ...optionsRef.current,
        autoSplit,
        onResize: (resizeResult) => {
          // Update stored result with new elements but same revert
          const newSplitTxtElements: SplitTxtElements = {
            chars: resizeResult.chars,
            words: resizeResult.words,
            lines: resizeResult.lines,
            revert: result.revert,
          };
          splitResultRef.current = newSplitTxtElements;
          onResizeRef.current?.(newSplitTxtElements);
        },
      });

      // Store dispose function
      revertFnRef.current = result.dispose;

      hasSplitRef.current = true;

      // Create result object with revert exposed
      const splitElements: SplitTxtElements = {
        chars: result.chars,
        words: result.words,
        lines: result.lines,
        revert: result.revert,
      };
      splitResultRef.current = splitElements;

      // Reveal after split
      containerRef.current.style.visibility = "visible";

      // Call onSplit if provided
      if (onSplitRef.current) {
        const callbackResult = onSplitRef.current(splitElements);

        // Handle revertOnComplete for onSplit (only when inView is NOT enabled)
        if (!inViewRef.current && revertOnCompleteRef.current) {
          const promise = normalizeToPromise(callbackResult);
          if (promise) {
            promise.then(() => {
              if (!isMounted || hasRevertedRef.current) return;
              result.revert();
              hasRevertedRef.current = true;
            });
          } else if (callbackResult === undefined) {
            // No warning if onSplit didn't return anything - user might be setting up state
          } else {
            console.warn(
              "SplitTxt: revertOnComplete is enabled but onSplit did not return an animation or promise."
            );
          }
        }
      }

      // Set up IntersectionObserver if inView is enabled
      if (inViewRef.current && containerRef.current) {
        const inViewOptions =
          typeof inViewRef.current === "object" ? inViewRef.current : {};
        const threshold = inViewOptions.amount ?? 0;
        const rootMargin = inViewOptions.margin ?? "0px";

        observerRef.current = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;

            const isOnce =
              typeof inViewRef.current === "object" && inViewRef.current.once;

            if (entry.isIntersecting) {
              if (isOnce && hasTriggeredOnceRef.current) return;
              hasTriggeredOnceRef.current = true;
              setIsInView(true);
            } else {
              if (!isOnce) {
                setIsInView(false);
              }
            }
          },
          { threshold, rootMargin }
        );

        observerRef.current.observe(containerRef.current);
      }
    });

    return () => {
      isMounted = false;
      // Cleanup observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      // Cleanup on unmount
      if (revertFnRef.current) {
        revertFnRef.current();
      }
    };
  }, [childElement, autoSplit]);

  // Handle isInView changes
  useEffect(() => {
    if (!splitResultRef.current) return;
    if (hasRevertedRef.current) return;

    if (isInView && onInViewRef.current) {
      const callbackResult = onInViewRef.current(splitResultRef.current);
      const promise = normalizeToPromise(callbackResult);

      if (revertOnCompleteRef.current && promise) {
        promise.then(() => {
          if (hasRevertedRef.current) return;
          splitResultRef.current?.revert();
          hasRevertedRef.current = true;
        });
      }
    } else if (!isInView && onLeaveViewRef.current && splitResultRef.current) {
      onLeaveViewRef.current(splitResultRef.current);
    }
  }, [isInView]);

  if (!isValidElement(children)) {
    console.error("SplitTxt: children must be a single valid React element");
    return null;
  }

  const clonedChild = cloneElement(children, {
    ref: childRefCallback,
  } as Record<string, unknown>);

  return (
    <div
      ref={mergedRef}
      style={{ visibility: "hidden", position: "relative" }}
    >
      {clonedChild}
    </div>
  );
  }
);
