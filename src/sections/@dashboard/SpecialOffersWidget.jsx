import { CardGiftcard, Close, ContentCopy } from '@mui/icons-material';
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

import Iconify from '../../components/iconify';
import { selectAccountId } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';

const SpecialOffersWidget = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openLifetimeDialog, setOpenLifetimeDialog] = useState(false);
  const accountId = useSelector(selectAccountId);
  const [copied, setCopied] = useState(false);
  const [promoCodeCopied, setPromoCodeCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const history = useHistory();;

  function calculateTimeLeft() {
    const difference = new Date('2025-03-01') - new Date();
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPromoCode = () => {
    navigator.clipboard.writeText('EARLYBIRD20');
    setPromoCodeCopied(true);
    setTimeout(() => setPromoCodeCopied(false), 2000);
  };

  const rewards = [
    {
      icon: (
        <Iconify
          icon="mdi:discord"
          className="text-2xl"
        />
      ),
      title: 'Join our Discord server',
      credits: 50,
      link: 'https://discord.gg/2zPbKuukgx',
    },
    {
      icon: (
        <Iconify
          icon="mdi:linkedin"
          className="text-2xl"
        />
      ),
      title: 'Follow us on LinkedIn',
      credits: 25,
      link: 'https://www.linkedin.com/company/altanlabs',
    },
    {
      icon: (
        <Iconify
          icon="mdi:instagram"
          className="text-2xl"
        />
      ),
      title: 'Follow us on Instagram',
      credits: 25,
      link: 'https://www.instagram.com/altanlabs/',
    },
    {
      icon: (
        <Iconify
          icon="mdi:facebook"
          className="text-2xl"
        />
      ),
      title: 'Follow us on Facebook',
      credits: 25,
      link: 'https://www.facebook.com/altanlabs',
    },
    {
      icon: (
        <Iconify
          icon="ri:twitter-x-line"
          className="text-2xl"
        />
      ),
      title: 'Follow us on X',
      credits: 25,
      link: 'https://x.com/altan_ai',
    },
  ];

  const handleRewardClick = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div>
      <Typography
        variant="h6"
        className="font-semibold mb-4"
      >
        Special Offers
      </Typography>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div
          onClick={() => setOpenDialog(true)}
          className="dark:bg-[#1C1C1C] dark:hover:bg-[#252525] bg-white hover:bg-gray-50 transition-all duration-200 rounded-xl p-6 cursor-pointer shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-start gap-4">
            <div className="text-primary text-2xl">
              <CardGiftcard />
            </div>
            <div className="flex flex-col">
              <Typography className="font-semibold text-lg">Get Free Credits</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-1"
              >
                Complete tasks to earn credits
              </Typography>
            </div>
          </div>
        </div>

        <div
          onClick={() => history.push('/referrals')}
          className="dark:bg-[#1C1C1C] dark:hover:bg-[#252525] bg-white hover:bg-gray-50 transition-all duration-200 rounded-xl p-6 cursor-pointer shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-start gap-4">
            <div className="text-purple-500 text-2xl">
              <Iconify icon="mdi:account-multiple-plus" />
            </div>
            <div className="flex flex-col">
              <Typography className="font-semibold text-lg">Refer & Earn</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-1"
              >
                Get 20% subscription credits per referral
              </Typography>
            </div>
          </div>
        </div>
        {/*
        <div
          onClick={() => setOpenLifetimeDialog(true)}
          className="relative rounded-xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          style={{
            background: 'linear-gradient(45deg, rgba(0,0,0,0.97), rgba(0,0,0,0.95))',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10" />

          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 opacity-20 animate-border" />

          <div className="relative flex items-start gap-4">
            <div className="text-green-400 text-2xl">
              <Discount />
            </div>
            <div className="flex flex-col">
              <Typography className="font-semibold text-lg text-white">
                Limited Time Offer! 🎉
              </Typography>
              <Typography
                variant="body2"
                className="text-green-400 font-medium mt-1"
              >
                20% discount forever
              </Typography>
              <Typography
                variant="caption"
                className="text-gray-400 mt-2 font-mono"
              >
                Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </Typography>
            </div>
          </div>
        </div> */}
      </div>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">Earn Free Credits</Typography>
          <IconButton
            onClick={() => setOpenDialog(false)}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert
            severity="info"
            className="mb-4"
          >
            To redeem your credits, please post your Account ID and completed tasks in our Discord's
            #rewards channel.
          </Alert>

          <div className="mb-4 relative">
            <TextField
              fullWidth
              label="Your Workspace ID"
              value={accountId}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopyAccountId}>
                    <ContentCopy />
                  </IconButton>
                ),
              }}
            />
            {copied && (
              <Typography
                variant="caption"
                color="primary"
                className="absolute -bottom-5 left-0"
              >
                Copied to clipboard!
              </Typography>
            )}
          </div>

          <List>
            {rewards.map((reward) => (
              <ListItem
                key={reward.title}
                button
                onClick={() => handleRewardClick(reward.link)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mb-2"
              >
                <ListItemIcon className="text-primary">{reward.icon}</ListItemIcon>
                <ListItemText
                  primary={reward.title}
                  secondary={`Earn ${reward.credits} credits`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* <Dialog
        open={openLifetimeDialog}
        onClose={() => setOpenLifetimeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">Exclusive Lifetime Deal 🎉</Typography>
          <IconButton
            onClick={() => setOpenLifetimeDialog(false)}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className="pb-8">
          <Alert
            severity="success"
            className="mb-4"
          >
            Get 20% OFF on any plan FOREVER with code:
          </Alert>

          <div
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center mb-4 relative cursor-pointer"
            onClick={handleCopyPromoCode}
          >
            <Typography
              variant="h5"
              className="font-mono font-bold"
            >
              EARLYBIRD20
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              className={`absolute left-1/2 -translate-x-1/2 ${promoCodeCopied ? 'opacity-100' : 'opacity-0'} transition-opacity`}
            >
              Copied!
            </Typography>
          </div>

          <Typography
            variant="body2"
            color="text.secondary"
            className="mb-4"
          >
            Don't miss out! This offer expires on March 1st, 2025
          </Typography>

          <div className="grid grid-cols-4 gap-2 text-center mb-4">
            <div className="bg-primary/10 p-2 rounded">
              <Typography variant="h6">{timeLeft.days}</Typography>
              <Typography variant="caption">Days</Typography>
            </div>
            <div className="bg-primary/10 p-2 rounded">
              <Typography variant="h6">{timeLeft.hours}</Typography>
              <Typography variant="caption">Hours</Typography>
            </div>
            <div className="bg-primary/10 p-2 rounded">
              <Typography variant="h6">{timeLeft.minutes}</Typography>
              <Typography variant="caption">Minutes</Typography>
            </div>
            <div className="bg-primary/10 p-2 rounded">
              <Typography variant="h6">{timeLeft.seconds}</Typography>
              <Typography variant="caption">Seconds</Typography>
            </div>
          </div>

          <div className="flex justify-center my-8">
            <HoverBorderGradient
              containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-200/50 to-violet-200/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-300/20 dark:hover:shadow-indigo-500/20"
              as="button"
              className="transition-all duration-200 w-[160px] h-[45px] text-sm bg-white/80 dark:bg-black/20 text-black dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
              onClick={() => {
                setOpenLifetimeDialog(false);
                history.push('/pricing');
              }}
            >
              Claim Offer Now
            </HoverBorderGradient>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default SpecialOffersWidget;
