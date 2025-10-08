import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';

/**
 * Example component demonstrating PostHog analytics integration
 * This shows how to track various user interactions and events
 */
const AnalyticsExample = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formStarted, setFormStarted] = useState(false);
  const analytics = useAnalytics();

  // Track when user starts filling the form
  const handleFormStart = () => {
    if (!formStarted) {
      analytics.trackFormStarted('example_form', {
        page: 'analytics_example',
        timestamp: new Date().toISOString(),
      });
      setFormStarted(true);
    }
  };

  // Track form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    analytics.trackFormCompleted('example_form', {
      page: 'analytics_example',
      fields_filled: Object.values(formData).filter(Boolean).length,
      completion_time: Date.now(),
    });

    // Track custom event
    analytics.track('example_form_submitted', {
      name_provided: !!formData.name,
      email_provided: !!formData.email,
    });

    alert('Form submitted! Check PostHog for analytics.');
  };

  // Track button clicks
  const handleButtonClick = (buttonName) => {
    analytics.trackButtonClicked(buttonName, 'analytics_example', {
      timestamp: new Date().toISOString(),
    });
  };

  // Track feature usage
  const handleFeatureUse = (feature) => {
    analytics.trackFeatureUsed(feature, {
      page: 'analytics_example',
      user_type: 'demo',
    });
  };

  // Track agent interaction (example)
  const handleAgentInteraction = () => {
    analytics.trackAgentInteraction('demo_agent_123', 'chat_initiated', {
      page: 'analytics_example',
      interaction_source: 'demo_button',
    });
  };

  // Track voice interaction (example)
  const handleVoiceInteraction = () => {
    // Simulate a 30-second voice interaction
    analytics.trackVoiceInteraction(30, {
      page: 'analytics_example',
      interaction_type: 'demo',
      quality: 'high',
    });
  };

  // Track error (example)
  const handleErrorExample = () => {
    analytics.trackError('demo_error', 'This is a demonstration error', {
      page: 'analytics_example',
      severity: 'low',
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        PostHog Analytics Integration Demo
      </h2>
      
      <div className="space-y-6">
        {/* Form Example */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Form Analytics Example</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  handleFormStart();
                  setFormData({ ...formData, name: e.target.value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => {
                  handleFormStart();
                  setFormData({ ...formData, email: e.target.value });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Form (Tracked)
            </button>
          </form>
        </div>

        {/* Button Click Examples */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Button Click Tracking</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleButtonClick('primary_action')}
              className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Primary Action
            </button>
            
            <button
              onClick={() => handleButtonClick('secondary_action')}
              className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Secondary Action
            </button>
          </div>
        </div>

        {/* Feature Usage Examples */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Feature Usage Tracking</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleFeatureUse('dashboard_view')}
              className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
            >
              View Dashboard
            </button>
            
            <button
              onClick={() => handleFeatureUse('export_data')}
              className="py-2 px-4 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Export Data
            </button>
          </div>
        </div>

        {/* AI/Agent Interaction Examples */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">AI/Agent Interaction Tracking</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleAgentInteraction}
              className="py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Chat with Agent
            </button>
            
            <button
              onClick={handleVoiceInteraction}
              className="py-2 px-4 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              Voice Interaction
            </button>
          </div>
        </div>

        {/* Error Tracking Example */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Error Tracking</h3>
          <button
            onClick={handleErrorExample}
            className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Trigger Demo Error
          </button>
        </div>

        {/* Analytics Info */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">Analytics Information</h3>
          <p className="text-sm text-gray-600 mb-2">
            All interactions on this page are being tracked with PostHog analytics.
            Events include:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Form start and completion events</li>
            <li>Button clicks with location context</li>
            <li>Feature usage tracking</li>
            <li>AI agent interactions</li>
            <li>Voice interaction duration</li>
            <li>Error occurrences</li>
            <li>Custom event properties</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExample;
