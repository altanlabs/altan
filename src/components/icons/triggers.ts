import { IPlayer, ITrigger } from '@lordicon/element';

/**
 * Custom trigger that combines "In" behavior (appear when in viewport)
 * and "LoopOnHover" behavior (loop when hovered).
 */
export class AppearThenHoverLoop implements ITrigger {
  private playTimeout: NodeJS.Timeout | null = null;
  private intersectionObserver: IntersectionObserver | undefined;
  private played: boolean = false;
  private mouseIn: boolean = false;

  constructor(
    protected player: IPlayer,
    protected element: HTMLElement,
    protected targetElement: HTMLElement,
  ) {
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  // Handles hover enter (start looping)
  private onMouseEnter(): void {
    this.mouseIn = true;

    if (!this.player.isPlaying) {
      this.loopAnimation();
    }
  }

  // Handles hover leave (stop looping)
  private onMouseLeave(): void {
    this.mouseIn = false;

    this.resetPlayDelayTimer();
  }

  // Lifecycle: Trigger connected to the DOM
  onConnected(): void {
    // Set up IntersectionObserver for "In" behavior
    const callback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.playOnce();
          this.resetIntersectionObserver(); // Stop observing after first play
        }
      });
    };

    this.intersectionObserver = new IntersectionObserver(callback);
    this.intersectionObserver.observe(this.element);

    // Set up event listeners for hover behavior
    this.targetElement.addEventListener('mouseenter', this.onMouseEnter);
    this.targetElement.addEventListener('mouseleave', this.onMouseLeave);
  }

  // Lifecycle: Trigger disconnected from the DOM
  onDisconnected(): void {
    this.resetIntersectionObserver();
    this.resetPlayDelayTimer();

    this.targetElement.removeEventListener('mouseenter', this.onMouseEnter);
    this.targetElement.removeEventListener('mouseleave', this.onMouseLeave);
  }

  // Handles the "In" behavior (play once when in viewport)
  private playOnce(): void {
    if (this.played) return;

    this.played = true;

    if (this.delay > 0) {
      this.playTimeout = setTimeout(() => {
        this.player.playFromBeginning();
      }, this.delay);
    } else {
      this.player.playFromBeginning();
    }
  }

  // Plays the animation in a loop if hovered
  private loopAnimation(): void {
    if (!this.mouseIn) return;

    this.resetPlayDelayTimer();

    if (this.delay > 0) {
      this.playTimeout = setTimeout(() => {
        this.player.playFromBeginning();
      }, this.delay);
    } else {
      this.player.playFromBeginning();
    }
  }

  // Resets the IntersectionObserver
  private resetIntersectionObserver(): void {
    if (!this.intersectionObserver) return;

    this.intersectionObserver.unobserve(this.element);
    this.intersectionObserver = undefined;
  }

  // Resets the delay timer
  private resetPlayDelayTimer(): void {
    if (!this.playTimeout) return;

    clearTimeout(this.playTimeout);
    this.playTimeout = null;
  }

  // Gets the delay attribute from the element
  get delay(): number {
    const value = this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0;
    return Math.max(value, 0);
  }
}

