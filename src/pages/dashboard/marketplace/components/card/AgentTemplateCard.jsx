import { Avatar } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../../../components/iconify';

const AgentTemplateCard = ({ template }) => {
  const history = useHistory();;
  const name = template.name || template.public_name || 'Unnamed Agent';
  const avatarUrl = template.parent?.avatar_url || '/assets/default-avatar.png';
  const llmInfo = template.parent?.llm_config?.provider
    ? `${template.parent.llm_config.provider} / ${template.parent.llm_config.model_id}`
    : 'Unknown model';
  const remixCount = template.remix_count || Math.floor(Math.random() * 5000) + 100;

  const handleClick = () => {
    history.push(`/template/${template.id}`);
  };

  return (
    <div
      className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 cursor-pointer"
      onClick={handleClick}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl" />
      </div>

      <div className="relative p-6 flex flex-col items-center text-center">
        {/* Agent Avatar with Glow Effect */}
        <div className="relative mb-4 group-hover:scale-105 transition-transform">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
          <Avatar
            src={avatarUrl}
            alt={name}
            sx={{
              width: 80,
              height: 80,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
            onError={(e) => {
              e.target.src = '/assets/default-avatar.png';
            }}
          />
          {/* Online Indicator */}
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
        </div>

        {/* Agent Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">{name}</h3>

        {/* Model Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{llmInfo}</div>

        {/* Stats & Price */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Iconify
              icon="carbon:fork"
              width={16}
            />
            <span>{remixCount.toLocaleString()} uses</span>
          </div>

          {template?.price !== undefined && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                template.price > 0
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              }`}
            >
              {template.price > 0
                ? `€${(template.price / 100).toFixed(0)}`
                : 'Free'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AgentTemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
};

export default AgentTemplateCard;
