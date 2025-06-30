import { Player } from '@lottiefiles/react-lottie-player';
import React, { useState } from 'react';

const iconList = [
  'clock_scheduled',
  'custom_code',
  'flow',
  'form',
  'foundry',
  'hub_network',
  'iterator',
  'lightning',
  'magnifier',
  'plus_circle',
  'project_management',
  'router_exclusive',
  'router_inclusive',
  'webhook_response',
  'map',
  'runway-airport-airplane',
  'octopus',
  'whatsapp',
];

const IconPlayer = ({ height = '100px', width = '100px' }) => {
  const [selectedIcon, setSelectedIcon] = useState('');
  const handleIconChange = (event) => {
    setSelectedIcon(event.target.value);
  };
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '1000px' }}
    >
      <select
        onChange={handleIconChange}
        value={selectedIcon}
      >
        {iconList.map((icon) => (
          <option
            key={icon}
            value={icon}
          >
            {icon}
          </option>
        ))}
      </select>
      {selectedIcon && (
        <Player
          src={`/assets/icons/animated/${selectedIcon}.json`}
          className="player"
          loop
          autoplay
          style={{ height: height, width: width }}
        />
      )}
    </div>
  );
};

export default IconPlayer;
