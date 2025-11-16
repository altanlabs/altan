import CloseIcon from '@mui/icons-material/Close';
import {
  InputLabel,
  Stack,
  MenuItem,
  Box,
  ListItemText,
  Typography,
  TextField,
  FormControl,
  Select,
  Checkbox,
  useTheme,
  Fade,
  Button,
  Autocomplete,
  Chip,
  Modal,
  CircularProgress,
  IconButton,
  Drawer,
  CssBaseline,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import Iconify from '../../components/iconify';
import { onboardAccount } from '../../redux/slices/general/index.ts';

function Calendly({ open, onClose }) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  return (
    <Modal
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          marginTop: '100px',
          background: 'white',
          borderRadius: '2rem',
        }}
      >
        <IconButton
          style={{ position: 'absolute', right: 10, top: 10 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        {!isIframeLoaded && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </div>
        )}
        <iframe
          title="Altan Calendly"
          src="https://calendly.com/optimailab/30min"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '2rem' }}
          onLoad={() => setIsIframeLoaded(true)}
        />
      </div>
    </Modal>
  );
}

function PricingModal({ open, onClose }) {
  return (
    <Modal
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        style={{
          width: '100vw',
          height: '100vh',
          overflowY: 'auto',
          position: 'relative',
          marginTop: '100px',
          borderRadius: '2rem',
          padding: '5vw',
        }}
      >
        <Typography variant="h4">Get started absolutely free</Typography>
      </Paper>
    </Modal>
  );
}

const CustomCursor = ({ cursorPosition }) => (
  <div
    style={{
      position: 'absolute',
      top: cursorPosition.y + 'px',
      left: cursorPosition.x + 'px',
      transform: 'translate(-50%, -50%)',
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      pointerEvents: 'none',
    }}
  />
);

function Simulation({ appId, websiteUrl, handleBookDemoClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hasError, setHasError] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isPricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    console.log(hasError);
    if (!hasError) {
      setTimer(
        setTimeout(() => {
          setHasError(true);
        }, 3000),
      );
    }

    return () => {
      clearTimeout(timer);
    };
  }, [hasError]);

  const handleIframeLoad = () => {
    clearTimeout(timer);
  };

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://app.altan.ai/jssnippet/cbsnippet.js';
    script.async = true;
    script.id = appId;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const screenShot = `https://api.apiflash.com/v1/urltoimage?access_key=5959a6c9ee854438829115981b351c3c&wait_until=page_loaded&url=${websiteUrl}`;

  return (
    <>
      <CssBaseline />
      {isMobile && (
        <IconButton onClick={toggleDrawer}>
          <Iconify icon="material-symbols:menu" />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          style: {
            width: '20%',
            minWidth: '300px',
          },
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          padding={2}
        >
          <Typography
            variant="h3"
            sx={{ m: 1 }}
          >
            {' '}
            App Simulation
          </Typography>
          <Stack sx={{ mt: 2, mb: 2 }}>
            <Button
              startIcon={<Iconify icon="solar:calendar-bold" />}
              size="large"
              variant="soft"
              color="inherit"
              onClick={handleBookDemoClick}
              sx={{ zIndex: 999, mb: 1 }}
            >
              Book a free demo
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Iconify icon="majesticons:rocket-3-start" />}
              onClick={() => setPricingOpen(true)}
            >
              Start free trial
            </Button>
          </Stack>
          <Paper
            variant="filled"
            sx={{ background: theme.palette.background.neutral, p: 2 }}
          >
            <Typography>
              <Iconify
                icon="ion:warning"
                sx={{ mr: 1, color: 'yellow' }}
              />
              This is a simulation of how your AI will look like on your website. The AI is just a
              template and won't be able to answer questions well until you train it.
            </Typography>
          </Paper>
          <Paper
            variant="filled"
            sx={{ background: theme.palette.background.neutral, p: 2, mt: 2 }}
          >
            <Typography variant="h6">What can you do inside the platform?</Typography>
            <Typography variant="body">
              Inside the platform, you gain control over conversations, have the flexibility to
              adjust layouts and themes, and refine the AI's logic for an optimal fit. Additionally,
              integrate with top channels and tools to maximize your AI's potential.
            </Typography>
          </Paper>
          <Paper
            variant="filled"
            sx={{ background: theme.palette.background.neutral, p: 2, mt: 2 }}
          >
            <Typography variant="h6">What happens next?</Typography>
            <Typography variant="body">
              Start the 7-day free trial and get full access to our platform. Customize your AI to
              fit your business needs and test its capabilities risk-free.
            </Typography>
          </Paper>
        </Box>
      </Drawer>

      <div
        style={{
          width: isMobile && !drawerOpen ? '100%' : '80%',
          marginLeft: isMobile ? 0 : '20%',
        }}
      >
        <img
          src={screenShot}
          alt="Website Screenshot"
          style={{
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <PricingModal
        open={isPricingOpen}
        onClose={() => setPricingOpen(false)}
      />
    </>
  );
}

export default function Onboarding() {
  const { user } = useAuthContext();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [demoApp, setDemoApp] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState(null);
  const [simulation, setSimulation] = useState(false);

  const storySteps = [
    {
      title: `Welcome, ${user?.first_name}.`,
      subtitle: "Let's get you started",
      text: 'Tap to explore',
    },
    {
      title: 'Our mission is to help you build what you imagine with AI.',
      subtitle: 'Tap to discover how',
      text: '',
    },
    { title: 'Unlocking AI for Everyone.', subtitle: 'Tap to begin your project.', text: '' },
    {
      title: 'Company',
      subtitle: 'Tell us about your company',
      inputLabel: 'The name of your company',
      inputType: 'text',
      inputKey: 'name',
    },
    {
      title: 'Website',
      subtitle: 'Where can we find you online?',
      inputLabel: 'https://yourcompany.com',
      inputType: 'text',
      inputKey: 'company_website',
    },
    {
      title: 'Channels',
      subtitle: 'How do you communicate with your users?',
      inputType: 'multiselect',
      inputKey: 'channels',
      options: ['Web', 'eMail', 'Meta', 'WhatsApp'],
    },
    {
      title: 'Industry',
      subtitle: 'Select an industry',
      inputType: 'select',
      inputKey: 'industry',
      options: ['Retail', 'Software', 'Healthcare', 'Services', 'Other'],
    },
    {
      title: '',
      subtitle: 'Lastly, how did you hear about us?',
      inputType: 'multiselect',
      inputKey: 'referral',
      options: ['Instagram', 'eMail', 'LinkedIn', 'SEO', 'Word of mouth', 'Other'],
    },
    {
      title: '',
      subtitle: 'Book a Demo',
      text: 'Secure a demo slot with an Altan specialist',
      finalStep: true,
    },
  ];

  const [formData, setFormData] = useState({});

  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setCursorPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleClick = () => {
    const currentInputKey = storySteps[step].inputKey;

    if (currentInputKey && !formData[currentInputKey]) {
      return;
    }

    if (step === 7) {
      dispatchFormData();
    }
    if (step < storySteps.length - 1) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const dispatchFormData = async () => {
    console.log(formData);
    setWebsiteUrl(formData.company_website);
    try {
      const app_id = await dispatch(onboardAccount(formData));
      setDemoApp(app_id);
    } catch (error) {
      console.error('Error dispatching form data:', error);
    }
  };

  const handleBookDemoClick = (e) => {
    e.stopPropagation();
    setOpen(true);
  };

  const renderInputField = (step) => {
    const stopPropagation = (event) => {
      event.stopPropagation();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    switch (step.inputType) {
      case 'text':
        return (
          <TextField
            variant="outlined"
            placeholder={step.inputLabel}
            value={formData[step.inputKey] || ''}
            onChange={(e) => handleInputChange(step.inputKey, e.target.value)}
            onClick={stopPropagation}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        );
      case 'select':
        return (
          <FormControl
            variant="outlined"
            onClick={stopPropagation}
            onKeyDown={handleKeyDown}
          >
            <InputLabel>{step.subtitle}</InputLabel>
            <Select
              value={formData[step.inputKey] || []}
              onChange={(e) => handleInputChange(step.inputKey, e.target.value)}
              renderValue={(selected) => selected}
            >
              {step.options.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                >
                  <Checkbox checked={formData[step.inputKey]?.includes(option) || false} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'multiselect':
        return (
          <Autocomplete
            multiple
            id="chip-autocomplete"
            options={step.options}
            value={formData[step.inputKey] || []}
            onChange={(event, newValue) => {
              event.stopPropagation();
              handleInputChange(step.inputKey, newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={step.subtitle}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="filled"
                  label={option}
                  {...getTagProps({ index })}
                  onClick={(e) => e.stopPropagation()}
                />
              ))
            }
          />
        );

      default:
        return null;
    }
  };

  const handleBack = (event) => {
    event.stopPropagation(); // Stop event propagation
    if (step > 0) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <>
      <Helmet title="Altan | Onboarding" />
      <Calendly
        open={open}
        onClose={() => setOpen(false)}
      />

      {!(!!demoApp && simulation) ? (
        <Box
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.65)', // Black overlay with 50% opacity
              zIndex: 1,
            }}
          />
          <video
            autoPlay
            muted
            loop={false}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
            }}
            src="https://uploads-ssl.webflow.com/64026c1203118141852162e5/641b38f69c57d7f0c5a85655_XD_Line_032223-transcode.mp4"
          />
          <CustomCursor cursorPosition={cursorPosition} />
          <Fade
            in
            timeout={1000}
          >
            <Stack
              sx={{ textAlign: 'center', zIndex: 1 }}
              spacing={1}
            >
              <Typography sx={{ fontSize: '9vw', lineHeight: 1 }}>
                {storySteps[step].title}
              </Typography>
              <Typography variant="h2">{storySteps[step].subtitle}</Typography>
              {renderInputField(storySteps[step])}
              <Typography variant="h5">{storySteps[step].text}</Typography>
              {step === 8 && (
                <Stack spacing={2}>
                  <Button
                    startIcon={<Iconify icon="solar:calendar-bold" />}
                    size="large"
                    variant="soft"
                    color="inherit"
                    onClick={handleBookDemoClick}
                    sx={{ zIndex: 999 }}
                  >
                    Book a free demo
                  </Button>
                  <Button
                    startIcon={<Iconify icon="majesticons:rocket-3-start" />}
                    size="large"
                    variant="soft"
                    color="primary"
                    onClick={() => setSimulation(true)}
                    sx={{ zIndex: 999 }}
                  >
                    Unlock your AI
                  </Button>
                </Stack>
              )}
            </Stack>
          </Fade>

          {step !== 0 && (
            <Button
              startIcon={<Iconify icon="ion:caret-back-outline" />}
              onClick={handleBack}
              sx={{ position: 'absolute', bottom: 20, left: 20, color: 'info', zIndex: 999 }}
            >
              Go back
            </Button>
          )}
        </Box>
      ) : (
        <Simulation
          appId={demoApp}
          websiteUrl={websiteUrl}
          handleBookDemoClick={handleBookDemoClick}
        />
      )}
    </>
  );
}
