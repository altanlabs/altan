import { applyPatch } from 'diff';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector, dispatch } from 'react-redux';

import AcceptRejectToolbar from './AcceptRejectToolbar';
import BaseMonacoEditor from './BaseMonacoEditor';
import BinaryFilePlaceholder from './BinaryFilePlaceholder';
import EditorErrorBoundary from './EditorErrorBoundary';
import {
  selectFileContent,
  updateFileContent,
  // Maybe you also have something like selectFileDiff
} from '../../../../../redux/slices/codeEditor';
import { getLanguage, isBinaryFile } from '../../utils/editor';

/* ------------------------------------------
 * 7) A new "CodeDiffEditor" for inline diffs
 *    with Accept/Reject All
 * ----------------------------------------*/
const CodeDiffEditor = ({
  filePath,
  diffString, // unified diff string
}) => {
  // 1. The "modified" content is what's in Redux
  const modifiedContent = useSelector((state) => selectFileContent(state, filePath));

  // 2. The "original" content is computed by reversing the patch
  let originalContent = '';
  try {
    // Make sure `diffString` is a valid unified diff,
    // and `modifiedContent` is correct text for applyPatch
    originalContent = applyPatch(modifiedContent, diffString, { reverse: true });
  } catch (err) {
    console.error('Error applying reversed diff:', err);
    // fallback if something fails
    originalContent = modifiedContent;
  }

  // 3. Handlers for "Accept All" and "Reject All"
  //    - "Accept All" => keep the modified content
  //    - "Reject All" => revert to the original content
  const handleAcceptAll = () => {
    // We basically do nothing because the store is already the "modified" version
    console.log('All changes accepted');
  };

  const handleRejectAll = () => {
    // Revert to original
    dispatch(updateFileContent({ path: filePath, content: originalContent }));
    console.log('All changes rejected -> store set to original');
  };

  // 4. Render the inline diff editor + the Accept/Reject toolbar
  if (isBinaryFile(filePath)) {
    return <BinaryFilePlaceholder filePath={filePath} />;
  }

  return (
    <EditorErrorBoundary>
      <div className="flex flex-col w-full h-full">
        <AcceptRejectToolbar
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
        />

        <div className="flex-1">
          <BaseMonacoEditor
            editorType="diff"
            originalValue={originalContent}
            modifiedValue={modifiedContent}
            language={getLanguage(filePath)}
            filePath={filePath}
            readOnly={false} // allow editing if you want
            height="100%"
          />
        </div>
      </div>
    </EditorErrorBoundary>
  );
};

CodeDiffEditor.propTypes = {
  filePath: PropTypes.string.isRequired,
  diffString: PropTypes.string.isRequired,
};

export default memo(CodeDiffEditor);
