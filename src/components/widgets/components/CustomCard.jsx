
import { Card, Stack, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

import WidgetRenderer from '../WidgetRenderer.jsx';
import RenderPreview from './extra/RenderPreview.tsx';

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3, 1),
  paddingLeft: '15px',
  paddingRight: '15px',
}));

const CustomCard = ({ widget }) => {
  const data = widget?.meta_data || {};
  const { elements = [] } = data;
  const theme = useTheme();
  const renderItem = (item, index) => {
    switch (item?.type) {
      case 'text':
        return <Typography key={index} variant={item.config.content.style.variant || 'h5'} color={item.config.content.style.color || 'inherit'} sx={{ ml: 1 }}>{item.config.content.text}</Typography>;
      case 'media':
        return (
          <RenderPreview
            key={index}
            file={{
              name: item.media.type.split('/').pop(),
              url: item.media.preview,
              type: item.media.name,
            }}
          />
        );
      case 'widget':
        return <WidgetRenderer key={index} message={item} />;
      default:
        return null;
    }
  };
  // console.log(elements)
  return (
    <StyledCard theme={theme}>
      <Stack>
        {elements.map((item, index) => renderItem(item, index))}
      </Stack>
    </StyledCard>
  );
};

export default CustomCard;
