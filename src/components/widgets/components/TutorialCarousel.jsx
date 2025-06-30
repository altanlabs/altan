// TutorialCarousel.js
import { Button, Typography } from '@mui/material';
import React, { useState } from 'react';

import Carousel from '../../../../../components/carousel';

const TutorialCarousel = ({ widget }) => {
  const data = widget.meta_data;
  const { steps, loop, auto_play, time_interval } = data;
  const [currentStep, setCurrentStep] = useState(0);

  const handleButtonClick = (action) => {
    switch (action) {
      case 'next':
        setCurrentStep((prev) => (prev + 1) % steps.length);
        break;
      case 'prev':
        setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
        break;
      case 'finish':
        // Implement finish logic here
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Typography variant="h6">Tutorial</Typography>
      <Carousel
        index={currentStep}
        loop={loop}
        autoPlay={auto_play}
        interval={time_interval}
      >
        {steps.map((step, index) => (
          <div key={index}>
            <img src={step.image_url} alt={step.step_title} />
            <Typography variant="h6">{step.step_title}</Typography>
            <Typography variant="body2">{step.step_description}</Typography>
            {step.buttons.map((button, btnIndex) => (
              <Button
                key={btnIndex}
                variant="contained"
                onClick={() => handleButtonClick(button.action)}
              >
                {button.label}
              </Button>
            ))}
          </div>
        ))}
      </Carousel>
    </>
  );
};

export default TutorialCarousel;
