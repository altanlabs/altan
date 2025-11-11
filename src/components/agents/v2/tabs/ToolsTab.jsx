import PropTypes from 'prop-types';
import { memo } from 'react';

import { Space } from '../../../../sections/@dashboard/spaces';

function ToolsTab({ agentData, onFieldChange }) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Space component with proper overflow handling */}
      <div className="flex-1 overflow-hidden">
        <Space
          navigate={() => console.log('navigated')}
          spaceId={agentData?.space_id}
          isPreview
        />
      </div>
    </div>
  );
}

ToolsTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(ToolsTab);
