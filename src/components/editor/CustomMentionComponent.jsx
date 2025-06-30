import { Tooltip } from '@mui/material';
import { forwardRef } from 'react';

const CustomMentionComponent = forwardRef(({ trigger, value, data, ...other }, ref) => {
  return (
    <Tooltip
      title={
        <>
          <p>
            Trigger: <code>{trigger}</code>
          </p>
          <p>
            Value: <code>{value}</code>
          </p>
          {data?.id && (
            <p>
              ID: <code>{data.id}</code>
            </p>
          )}
        </>
      }
      arrow
    >
      <span {...other} ref={ref}>
        {value}
      </span>
    </Tooltip>
  );
});

export default CustomMentionComponent;
