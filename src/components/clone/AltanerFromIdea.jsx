import { memo } from 'react';

/**
 * DEPRECATED: This component has been replaced by the bubble convergence animation in CompactLayout.
 *
 * The project creation flow now works as follows:
 * 1. User submits idea → redirects to /?idea=xyz
 * 2. CompactLayout detects ?idea= param and triggers bubble convergence animation
 * 3. Bubbles animate to center and merge into a pulsing sphere
 * 4. createAltaner API is called
 * 5. On success: sphere bursts and redirects to /project/{id}
 *
 * This file is kept for backwards compatibility but returns null.
 */
function AltanerFromIdea() {
  // This component is no longer used - animation handled by CompactLayout
  return null;
}

export default memo(AltanerFromIdea);
