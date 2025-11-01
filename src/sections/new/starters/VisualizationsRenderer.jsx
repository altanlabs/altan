import React from 'react';

import { AreaChartExample } from './charts/AreaChartExample';
import { BarChartExample } from './charts/BarChartExample';
import { LineChartExample } from './charts/LineChartExample';
import { PieChartExample } from './charts/PieChartExample';
import { RadarChartExample } from './charts/RadarChartExample';
import { RadialChartExample } from './charts/RadialChartExample';

const VisualizationsRenderer = ({ onSelect }) => {
  const samplePrompts = [
    {
      title: 'Compare tech companies',
      description: 'Research quarterly revenue growth',
      prompt:
        'Analyze quarterly revenue growth of Apple and Microsoft in 2024, and show revenue distribution by product category in the last quarter, using bar charts, pie charts, and trend indicators. Research the latest financial data.',
    },
    {
      title: 'Global air quality map',
      description: 'Real-time environmental data',
      prompt:
        'Create a heat map showing average Air Quality Index (AQI) of major world cities in 2024 by month, using data from WHO or IQAir. Include color-coded zones and trend analysis.',
    },
    {
      title: 'Stock market analysis',
      description: 'Track performance and trends',
      prompt:
        'Analyze the performance of top 5 tech stocks (AAPL, MSFT, GOOGL, META, AMZN) in 2024 with line charts, volume bars, and moving averages. Research current market data.',
    },
    {
      title: 'Climate data trends',
      description: 'Visualize temperature changes',
      prompt:
        'Create visualizations showing global temperature trends for 2024 across continents with area charts, heat maps, and comparative analysis. Use data from NOAA or NASA.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sample Prompts */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Sample prompts</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt.title}
              type="button"
              onClick={() => onSelect(prompt.prompt)}
              className="flex-shrink-0 w-72 p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-200 text-left"
            >
              <div className="space-y-2">
                <div className="text-base font-semibold text-foreground">{prompt.title}</div>
                <div className="text-sm text-muted-foreground">{prompt.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Examples */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Chart examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BarChartExample />
          <LineChartExample />
          <PieChartExample />
          <AreaChartExample />
          <RadarChartExample />
          <RadialChartExample />
        </div>
      </div>
    </div>
  );
};

export default VisualizationsRenderer;
