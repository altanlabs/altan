import { Card, Typography } from '@mui/material';
import React, { memo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { format } from 'timeago.js';

interface Interface {
  [x: string]: string | undefined;
  id: string;
  label: string;
  deployment_url: string;
  cover_url?: string;
  last_modified_time?: string;
}

interface InterfaceCardProps {
  ui: Interface;
}

const InterfaceCard = ({ ui }: InterfaceCardProps): JSX.Element => {
  const history = useHistory();;

  const interfaceId = ui.id;

  const handleCardClick = useCallback((): void => {
    history.push(`/remix/${interfaceId}`);
  }, [interfaceId, history.push]);

  return (
    <Card
      className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-300"
      onClick={handleCardClick}
      sx={{
        bgcolor: 'rgb(32, 32, 32)',
        boxShadow: 'none',
        border: 'none',
      }}
    >
      <div className="w-full aspect-video bg-[#2a2a2a]">
        <img
          src={
            ui.cover_url ||
            'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7'
          }
          alt={ui.label}
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7';
          }}
        />
      </div>
      <div className="px-3 flex justify-between items-center">
        <Typography
          variant="body2"
          className="px-3 py-2 text-gray-200"
        >
          {ui.label}
        </Typography>
        {ui.last_modified_time && (
          <Typography
            variant="caption"
            className="text-gray-400"
          >
            {format(new Date(new Date(ui.last_modified_time).getTime() + 60 * 60 * 1000))}
          </Typography>
        )}
      </div>
    </Card>
  );
};

export default memo(InterfaceCard);
