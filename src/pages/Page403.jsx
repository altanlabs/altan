import { Button, Typography } from '@mui/material';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

// @mui
// components
import { ForbiddenIllustration } from '../assets/illustrations';
import { MotionContainer, varBounce } from '../components/animate';
// assets

// ----------------------------------------------------------------------
export default function Page403() {
  return (
    <>
      <Helmet>
        <title> 403 Forbidden · Altan</title>
      </Helmet>

      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography
            variant="h3"
            paragraph
          >
            Access Denied 🚫
          </Typography>
        </m.div>

        {/* <m.div variants={varBounce().in}>
          <Box sx={{ width: '100%', mx: 'auto' }}>
            <Typography sx={{ color: 'text.secondary' }}>
                Looks like you've just discovered the ultra-secret, super-duper, hidden chamber of the "Access Denied" club. 🕵️‍♂️
                <br />
                Unfortunately, membership comes with a few restrictions, such as not being able to enter the page you're looking for. Bummer, right? 🤷‍♀️
                <br />
                But hey, don't worry! It's not all doom and gloom. Here's a joke to cheer you up: 🃏
                <br />
                Why don't scientists trust atoms? Because they make up everything! 🤣
                <br />
                Now, let's get you back on track! Simply click the "Back" button on your browser or use the navigation menu to find your way to a page that's a little more "Access Granted" and a little less "Top Secret." 🎉
                <br />
                Happy browsing, and remember: you're now a part of the "Access Denied" club – just don't tell anyone! 😉
            </Typography>
          </Box>
        </m.div> */}

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button
          component={RouterLink}
          to="/"
          size="large"
          variant="contained"
        >
          Go to Home
        </Button>
      </MotionContainer>
    </>
  );
}
