import * as react from 'react';
import { ReactElement } from 'react';
export { SplitTxtOptions, SplitTxtResult } from './index.js';

interface SplitTxtOptions {
    type?: "chars" | "words" | "lines" | "chars,words" | "words,lines" | "chars,lines" | "chars,words,lines";
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
interface SplitTxtElements {
    chars: HTMLSpanElement[];
    words: HTMLSpanElement[];
    lines: HTMLSpanElement[];
    /** Revert to original HTML (manual control) */
    revert: () => void;
}
/** Animation object with finished promise (e.g., from motion's animate()) */
type AnimationWithFinished = {
    finished: Promise<unknown>;
};
/** Return type for callbacks - void, single animation, array of animations, or promise */
type CallbackReturn = void | AnimationWithFinished | AnimationWithFinished[] | Promise<unknown>;
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
 * React component wrapper for the splitTxt function.
 * Uses the optimized splitTxt that handles kerning compensation
 * and dash splitting in a single pass.
 */
declare const SplitTxt: react.ForwardRefExoticComponent<SplitTxtProps & react.RefAttributes<HTMLDivElement>>;

export { SplitTxt, type SplitTxtElements };
