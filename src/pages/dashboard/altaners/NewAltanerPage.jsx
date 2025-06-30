/* eslint-disable react/display-name */
import { Stack, Typography, Box, useTheme, CircularProgress } from '@mui/material';
import { m } from 'framer-motion';
import { debounce } from 'lodash';
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { HoverBorderGradient } from '../../../components/aceternity/buttons/hover-border-gradient';
import { TextShimmer } from '../../../components/aceternity/text/text-shimmer';
import WavyBackground from '../../../components/aceternity/wavy-background';
import FormParameter from '../../../components/tools/form/FormParameter';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { CompactLayout } from '../../../layouts/dashboard';
import { createAltaner } from '../../../redux/slices/altaners';
import formatData from '../../../utils/formatData';

const AltanerSchema = {
  title: 'Altaner',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'Give your Altaner a memorable name that reflects its purpose',
    },
    // category: {
    //   type: "string",
    //   description: "Select the primary function of your Altaner",
    //   enum: ["Sales", "Marketing", "Customer Support", "Operations", "Other"],
    // },
    // goal: {
    //   type: "string",
    //   description: "Define the key objective your Altaner will help achieve",
    // },
    description: {
      type: 'string',
      title: 'What do you want your app to do?',
      description: 'Provide a detailed description of how your Altaner will work',
    },
    icon_url: {
      type: 'string',
      description: "Choose an icon that best represents your Altaner's function",
      'x-component': 'IconAutocomplete',
    },
  },
};

const useDisabled = ({ required }) => {
  const [disabled, setDisabled] = useState(true);
  const {
    formState: { isDirty },
    watch,
  } = useFormContext();
  const values = watch();

  const disabledHandler = useCallback(
    debounce((isDirty, values) => {
      setDisabled(!isDirty || !required.every((k) => values[k]?.trim()));
    }, 500),
    [],
  );

  useEffect(() => {
    disabledHandler(isDirty, values);
  }, [values, isDirty, disabledHandler]);

  return disabled;
};

const CreateAltanerButton = memo(() => {
  const navigate = useNavigate();
  const { handleSubmit } = useFormContext();
  const disabled = useDisabled({ required: AltanerSchema.required });
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      if (!Object.keys(data).length) return;

      dispatchWithFeedback(createAltaner(formatData(data, AltanerSchema.properties)), {
        useSnackbar: true,
        successMessage: 'Altaner created successfully',
        errorMessage: 'Could not create altaner',
      }).then((newAltaner) => {
        navigate(`/altaners/${newAltaner.id}`, { replace: true });
      });
    }),
    [dispatchWithFeedback, navigate],
  );

  return (
    <HoverBorderGradient
      containerClassName={`group relative rounded-full p-[1px] bg-gradient-to-r 
        ${
          disabled
            ? 'from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
            : 'from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20'
        }`}
      as="button"
      className={`transition-all duration-200 w-[185px] h-[40px] text-sm 
        ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
        } 
        flex items-center justify-center font-medium rounded-full`}
      onClick={onSubmit}
      disabled={disabled || isSubmitting}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {isSubmitting && (
          <CircularProgress
            size={16}
            color="inherit"
          />
        )}
        <Typography>Create Altaner</Typography>
      </Stack>
    </HoverBorderGradient>
  );
});

const CardOption = ({ image, title, description, onClick, features = [] }) => (
  <m.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full"
    style={{ width: '340px' }}
  >
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        height: '100%',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Box
        component="img"
        src={image}
        alt={title}
        sx={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          p: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{ flex: 1 }}
        >
          {description}
        </Typography>
        {/* {features.length > 0 && (
          <Stack spacing={1}>
            {features.map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                {feature}
              </Typography>
            ))}
          </Stack>
        )} */}
      </Box>
    </Box>
  </m.div>
);

const OnboardingView = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: '',
    areas: [],
  });

  const onboardingMethods = useForm({
    defaultValues: {
      goal: '',
      areas: [],
    },
  });

  const steps = [
    {
      title: '¡Bienvenido a Altan!',
      subtitle: 'Vamos a ayudarte a encontrar la plantilla perfecta',
      content: (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6">App Creator</h1>
            <TextShimmer className="text-3xl md:text-4xl font-light text-neutral-600 dark:text-neutral-300">
              Create a full-stack app without any coding experience and make a real impact.
            </TextShimmer>
          </m.div>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <HoverBorderGradient
              containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20"
              as="button"
              className="transition-all duration-300 w-[220px] h-[48px] text-base bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
              onClick={() => setStep(1)}
            >
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                Get Started
              </Typography>
            </HoverBorderGradient>
          </m.div>
        </m.div>
      ),
    },
    {
      title: 'What is your main goal?',
      subtitle: 'Tell us what you would like to achieve with Altan',
      content: (
        <FormProvider {...onboardingMethods}>
          <Box sx={{ maxWidth: 600, width: '100%', mx: 'auto' }}>
            <FormParameter
              fieldKey="goal"
              schema={{
                type: 'string',
                description: 'Describe your main goal',
              }}
              value={answers.goal}
              onChange={(value) => {
                setAnswers((prev) => ({ ...prev, goal: value }));
                onboardingMethods.setValue('goal', value);
              }}
              multiline
              rows={4}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              mt={4}
            >
              <HoverBorderGradient
                containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20"
                as="button"
                className="transition-all duration-200 w-[185px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                onClick={() => setStep(0)}
              >
                <Typography>Back</Typography>
              </HoverBorderGradient>
              <HoverBorderGradient
                containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20"
                as="button"
                className="transition-all duration-200 w-[185px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                onClick={() => setStep(2)}
                disabled={!answers.goal}
              >
                <Typography>Next</Typography>
              </HoverBorderGradient>
            </Stack>
          </Box>
        </FormProvider>
      ),
    },
    {
      title: 'Which areas would you like to automate?',
      subtitle: '',
      content: (
        <FormProvider {...onboardingMethods}>
          <Box sx={{ maxWidth: 600, width: '100%', mx: 'auto' }}>
            <FormParameter
              fieldKey="areas"
              schema={{
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'Sales',
                    'Marketing',
                    'Customer Support',
                    'Billing',
                    'Operations',
                    'Human Resources',
                  ],
                },
              }}
              value={answers.areas}
              onChange={(value) => {
                setAnswers((prev) => ({ ...prev, areas: value }));
                onboardingMethods.setValue('areas', value);
              }}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              mt={4}
            >
              <HoverBorderGradient
                containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20"
                as="button"
                className="transition-all duration-200 w-[185px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                onClick={() => setStep(1)}
              >
                <Typography>Back</Typography>
              </HoverBorderGradient>
              <HoverBorderGradient
                containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20"
                as="button"
                className="transition-all duration-200 w-[185px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                onClick={onComplete}
                disabled={!answers.areas.length}
              >
                <Typography>Finish</Typography>
              </HoverBorderGradient>
            </Stack>
          </Box>
        </FormProvider>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
      }}
    >
      {step === 0 ? (
        steps[0].content
      ) : (
        <>
          <h1 className="text-6xl font-medium mb-2">{steps[step].title}</h1>
          <Typography
            variant="h6"
            align="center"
          >
            {steps[step].subtitle}
          </Typography>
          {steps[step].content}
        </>
      )}
    </Box>
  );
};

const NewAltanerPage = () => {
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(searchParams.get('isNewUser') === 'true');
  const theme = useTheme();
  const methods = useForm({ defaultValues: {} });
  const [step, setStep] = useState('menu');

  const handleCreateFromScratch = () => setStep('form');
  const handleExploreMarketplace = () => window.open('/marketplace?mode=altaner', '_blank');
  const handleFindCreator = () =>
    window.open('https://app.altan.ai/form/8f528c5f-219c-4388-8851-906317b41904', '_blank');

  const renderForm = useMemo(
    () => (
      <Stack
        spacing={3}
        sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}
      >
        {Object.entries(AltanerSchema.properties).map(([key, fieldSchema]) => (
          <FormParameter
            key={key}
            fieldKey={key}
            name={key}
            schema={fieldSchema}
            required={AltanerSchema.required.includes(key)}
          />
        ))}
      </Stack>
    ),
    [],
  );

  const cardOptions = [
    {
      image:
        'https://cdn.dribbble.com/userupload/12372368/file/original-3196d7187230779e6a305af4fd3df5f9.jpg?resize=1504x1128',
      title: 'Start from scratch',
      description: 'Build your perfect App with our intuitive builder',
      features: ['Full customization control', 'AI-powered suggestions', 'Ready-to-use templates'],
      onClick: handleCreateFromScratch,
    },
    {
      image: '/assets/images/creators/marketplace.png',
      title: 'Explore marketplace',
      description: 'Browse and customize existing App templates',
      onClick: handleExploreMarketplace,
    },
    {
      image:
        theme.palette.mode === 'light'
          ? '/assets/images/creators/creatorsDark.png'
          : '/assets/images/creators/creatorsLight.png',
      title: 'Find Creator',
      description: 'Collaborate with expert creators for custom solutions',
      onClick: handleFindCreator,
    },
  ];

  const waveColors = ['#38BDF8', '#818CF8', '#E5E7EB', '#D1D5DB', '#9CA3AF'];

  if (showOnboarding) {
    return (
      <CompactLayout noPadding>
        <WavyBackground
          colors={waveColors}
          waveWidth={9}
          waveOpacity={0.3}
          frequency={0.3}
          amplitude={400}
        >
          <OnboardingView onComplete={() => setShowOnboarding(false)} />
        </WavyBackground>
      </CompactLayout>
    );
  }

  return (
    <CompactLayout noPadding>
      <FormProvider {...methods}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              py: 6,
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <TextShimmer className="text-center text-3xl font-medium">
              {step === 'menu'
                ? 'How would you like to create your Altaner?'
                : 'Customize Your Altaner'}
            </TextShimmer>

            {step === 'menu' ? (
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={4}
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: '100%',
                  maxWidth: 1200,
                  px: 3,
                  minHeight: { xs: 'auto', md: '400px' },
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {cardOptions.map((card, index) => (
                  <CardOption
                    key={index}
                    {...card}
                  />
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 800,
                  mx: 'auto',
                  px: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {renderForm}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  mt={4}
                  sx={{ width: '100%' }}
                >
                  <HoverBorderGradient
                    containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-100/50 to-violet-100/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-indigo-500/20"
                    as="button"
                    className="transition-all duration-200 w-[185px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-gray-600 dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                    onClick={() => setStep('menu')}
                  >
                    <Typography>Back</Typography>
                  </HoverBorderGradient>
                  <CreateAltanerButton />
                </Stack>
              </Box>
            )}
          </Box>
        </m.div>
      </FormProvider>
    </CompactLayout>
  );
};

export default memo(NewAltanerPage);
