import { Card, CardHeader } from '@mui/material';
import { memo } from 'react';

const HelperMethodTooltipCard = ({ method }) => {
  return (
    <Card
      sx={{
        padding: 0,
      }}
    >
      <CardHeader
        title={
          <span>
            <b>
              {`${method.name}(${[...method.args.map((arg) => arg.type), ...method.kwargs.map((kwarg) => `[${kwarg.name} <${kwarg.type}>]`)].join(', ')})`}
            </b>
            {` <${method.returnType}>`}
          </span>
        }
        titleTypographyProps={{
          variant: 'caption',
        }}
        subheader={method.description}
        subheaderTypographyProps={{
          variant: 'caption',
        }}
        sx={{
          padding: 1,
        }}
      />
      {/* <CardContent>

      </CardContent> */}
    </Card>
  );
};

export default memo(HelperMethodTooltipCard);
