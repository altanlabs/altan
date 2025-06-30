import { BoltOutlined, TableChart, Apps, SmartToy } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StartFromScratchCard = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="dark:bg-[#1C1C1C] dark:hover:bg-[#252525] bg-[#f5f5f5] hover:bg-[#eeeeee] transition-colors duration-200 rounded-lg p-4 cursor-pointer"
  >
    <div className="flex items-start gap-3">
      <div className="text-primary">{icon}</div>
      <div className="flex flex-col">
        <Typography className="font-medium">{title}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {description}
        </Typography>
      </div>
    </div>
  </div>
);

const ShortcutsWidget = () => {
  const navigate = useNavigate();

  const scratchOptions = [
    {
      icon: <SmartToy />,
      title: 'AI Agents',
      description: 'AI-powered chatbot',
      path: '/agents',
    },
    {
      icon: <BoltOutlined />,
      title: 'Flows',
      description: 'Automated workflows',
      path: '/flows',
    },
    {
      icon: <TableChart />,
      title: 'Databases',
      description: 'Spreadsheet-like database',
      path: '/bases',
    },
    {
      icon: <Apps />,
      title: 'Interfaces',
      description: 'Apps, forms, and pages',
      path: '/interfaces',
    },
  ];

  return (
    <div>
      <Typography
        variant="h6"
        className="font-semibold mb-4"
      >
        Products
      </Typography>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {scratchOptions.map((option) => (
          <StartFromScratchCard
            key={option.title}
            {...option}
            onClick={() => navigate(option.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default ShortcutsWidget;
