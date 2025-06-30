import { defineElement, Element } from '@lordicon/element';
import lottie from 'lottie-web';

import { AppearThenHoverLoop } from './triggers.ts';

// Register your new trigger under a custom name, e.g., "appear-hover-loop"

let workerInstance = null;
let referenceCount = 0;

export const getLottieWorker = () => {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('./lottieWorker.js', import.meta.url), { type: 'module' });
    Element.defineTrigger('appear-hover-loop', AppearThenHoverLoop);

    defineElement(lottie.loadAnimation);
  }
  referenceCount += 1; // Increment reference count
  return workerInstance;
};

export const releaseLottieWorker = () => {
  if (workerInstance) {
    referenceCount -= 1; // Decrement reference count
    if (referenceCount <= 0) {
      workerInstance.terminate();
      workerInstance = null;
      referenceCount = 0; // Reset count
    }
  }
};
