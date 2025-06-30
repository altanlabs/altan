import { useRef, useState } from 'react';
import { STATUS, LIFECYCLE } from 'react-joyride';

import WalktourProgressBar from './walktour-progress-bar';

// ----------------------------------------------------------------------

export function useWalktour(props) {
  const helpers = useRef();

  const [run, setRun] = useState(!!props?.defaultRun);

  const [currentIndex, setCurrentIndex] = useState(0);

  const setHelpers = (storeHelpers) => {
    helpers.current = storeHelpers;
  };

  const onCallback = (data) => {
    const { status, index, lifecycle } = data;

    if (lifecycle === LIFECYCLE.TOOLTIP) {
      setCurrentIndex(index + 1);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setCurrentIndex(0);
    }
  };

  const steps = props.steps.map((step) => ({
    ...step,
    content: (
      <>
        {step.content}
        {props.showProgress && (
          <WalktourProgressBar
            currentStep={currentIndex}
            totalSteps={props.steps.length}
            onGoStep={(index) => helpers.current?.go(index)}
          />
        )}
      </>
    ),
  }));

  return {
    steps,
    run,
    setRun,
    onCallback,
    setHelpers,
  };
}
