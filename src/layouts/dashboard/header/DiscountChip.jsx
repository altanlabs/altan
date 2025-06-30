import { Discount, Close } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { HoverBorderGradient } from '../../../components/aceternity/buttons/hover-border-gradient.tsx';

function calculateTimeLeft() {
  const difference = new Date('2025-03-01') - new Date();
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function DiscountChip() {
  const [openDialog, setOpenDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const copyPromoCode = () => {
    navigator.clipboard.writeText('EARLYBIRD20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeBlock = (value, label) => (
    <div className="bg-primary/10 p-2 rounded">
      <Typography variant="h6">{value}</Typography>
      <Typography variant="caption">{label}</Typography>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpenDialog(true)}
        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-full
          bg-gradient-to-r from-emerald-400/10 to-emerald-600/10
          text-emerald-400
          hover:from-emerald-400/20 hover:to-emerald-600/20
          transition-all duration-200 shadow-sm hover:shadow whitespace-nowrap"
      >
        <Discount sx={{ fontSize: 14 }} />
        <span>20% OFF FOREVER</span>
      </button>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">Exclusive Lifetime Deal 🎉</Typography>
          <IconButton
            onClick={() => setOpenDialog(false)}
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
            onClick={copyPromoCode}
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center mb-4 relative cursor-pointer"
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
              className={`absolute left-1/2 -translate-x-1/2 ${copied ? 'opacity-100' : 'opacity-0'} transition-opacity`}
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
            {timeBlock(timeLeft.days, 'Days')}
            {timeBlock(timeLeft.hours, 'Hours')}
            {timeBlock(timeLeft.minutes, 'Minutes')}
            {timeBlock(timeLeft.seconds, 'Seconds')}
          </div>

          <div className="flex justify-center my-8">
            <HoverBorderGradient
              containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-200/50 to-violet-200/50 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-300/20 dark:hover:shadow-indigo-500/20"
              as="button"
              className="transition-all duration-200 w-[160px] h-[45px] text-sm bg-white/80 dark:bg-black/20 text-black dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
              onClick={() => {
                setOpenDialog(false);
                navigate('/pricing');
              }}
            >
              Claim Offer Now
            </HoverBorderGradient>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
