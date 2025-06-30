import { Box, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
// @mui

// components
import Markdown from '../components/markdown';

const mardownContent = `
# Our Values

At Altan, our commitment is not only to the responsible and ethical application of AI, but also to fostering innovation and pushing the boundaries of the possible. We believe that through our collective efforts, we can harness the power of AI, creating a better world for everyone.

\`\`\`python
for day in life:
    optimai *= 1.01
\`\`\`


## Safe AI
At Altan, we are aware of the potential for unintended consequences and the perpetuation of bias or discrimination through AI if not handled with care. This knowledge fuels our commitment to the development and utilization of AI solutions that are both safe and reliable. Our rigorous testing methods and strong collaboration with clients ensures the responsible and ethical deployment of our AI systems.

## Ethical AI
Our belief is that all AI development and usage must align with ethical principles. To this end, we adhere to the highest standards of ethics, prioritizing transparency and accountability in our operations. Our AI solutions reflect not only our core values but also those of our clients. We engage with AI ethics experts and constantly revise our policies and procedures, placing us at the cutting edge of ethical AI development.

## Innovation
Altan is deeply invested in fostering innovation and exploring the outer limits of AI potential. Through our heavy investment in research and development, we devise advanced AI solutions that empower our clients to reach their objectives. By collaborating with academia, industry leaders, and other organizations, we ensure our position at the vanguard of AI innovation.

## Partnership
We uphold the notion that collaboration is essential for the realization of safe and ethical AI. Understanding the unique needs and objectives of our clients is a priority, helping us to tailor our AI solutions accordingly. Beyond our client relationships, we also form partnerships within the AI community to exchange knowledge and expertise, further promoting the development of secure and ethical AI technologies.

`;

export default function Values() {
  return (
    <>
      <Helmet>
        <title> Values · Altan</title>
      </Helmet>
      <Box
        sx={{
          pt: 6,
          pb: 1,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
        }}
      >
        <Container>
          <Markdown children={mardownContent} />
        </Container>
      </Box>
    </>
  );
}
