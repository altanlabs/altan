import { memo } from 'react';

/* ------------------------------------------
 * 5) "Accept / Reject" Toolbar (for diffs)
 * ----------------------------------------*/
function AcceptRejectToolbar({ onAcceptAll, onRejectAll }) {
  return (
    <div className="flex gap-2 p-2 bg-gray-800 text-white">
      <button
        className="px-3 py-1 rounded bg-green-700 hover:bg-green-600"
        onClick={onAcceptAll}
      >
        Accept All
      </button>
      <button
        className="px-3 py-1 rounded bg-red-700 hover:bg-red-600"
        onClick={onRejectAll}
      >
        Reject All
      </button>
    </div>
  );
}

export default memo(AcceptRejectToolbar);
