import { AnimatePresence } from 'framer-motion';
import { memo } from 'react';

import AltanLogo from '../../../components/loaders/AltanLogo.jsx';

const AssemblingWorkflow = ({
  open,
  message,
  // icon,
  // height = 150,
  // width = 150,
}) => (
  <AnimatePresence>
    {!!open && (
      <AltanLogo
        wrapped
        messages={message}
        showProgress
      />
    )}
  </AnimatePresence>
);

export default memo(AssemblingWorkflow);
