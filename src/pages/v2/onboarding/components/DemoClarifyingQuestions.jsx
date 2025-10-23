import { m } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';

const DemoQuestionGroup = ({
  groupId,
  title,
  options,
  selectedValue,
  onSelect,
  delay,
}) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50"
    >
      <div className="text-xs font-medium text-gray-300 mb-2">{title}</div>
      <div className="space-y-1.5">
        {options.map((option, idx) => (
          <m.button
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + idx * 0.1 }}
            onClick={() => onSelect(groupId, option)}
            disabled={!!selectedValue}
            className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all ${
              selectedValue === option
                ? 'bg-white text-black font-medium shadow-sm'
                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
            } ${selectedValue && selectedValue !== option ? 'opacity-50' : ''}`}
          >
            {option}
          </m.button>
        ))}
      </div>
    </m.div>
  );
};

const DemoClarifyingQuestions = ({ questions, onComplete, autoSelect = false }) => {
  const [selections, setSelections] = useState({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const handleSelect = (groupId, value) => {
    setSelections((prev) => ({
      ...prev,
      [groupId]: value,
    }));
    setCurrentGroupIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (autoSelect && currentGroupIndex < questions.length) {
      const timer = setTimeout(() => {
        const currentGroup = questions[currentGroupIndex];
        // Auto-select first option
        handleSelect(currentGroup.id, currentGroup.options[0]);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [autoSelect, currentGroupIndex, questions]);

  useEffect(() => {
    if (Object.keys(selections).length === questions.length && onComplete) {
      setTimeout(() => {
        onComplete(selections);
      }, 800);
    }
  }, [selections, questions.length, onComplete]);

  const selectedCount = Object.keys(selections).length;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[700px] mx-auto my-4"
    >
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/70 backdrop-blur-md border-2 border-gray-700/60 rounded-xl shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-gray-700/50">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/25 to-purple-500/25 shadow-sm">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-200">
            Understanding your needs
          </span>
          {selectedCount > 0 && (
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full shadow-sm bg-blue-500/30 text-blue-300">
              {selectedCount}/{questions.length}
            </span>
          )}
        </div>

        {/* Question Groups */}
        <div className="space-y-3">
          {questions.map((group, index) => (
            <DemoQuestionGroup
              key={group.id}
              groupId={group.id}
              title={group.title}
              options={group.options}
              selectedValue={selections[group.id]}
              onSelect={handleSelect}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </m.div>
  );
};

export default memo(DemoClarifyingQuestions);
