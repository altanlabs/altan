import { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AgentFormWithButtons from './create/AgentFormWithButtons';
import { chipCategories } from './create/chipData';
import { useAuthContext } from '../../../auth/useAuthContext';
import { createAgent } from '../../../redux/slices/general';

// Agent types and configurations
const agentTypes = ['Personal Assistant', 'Business Agent'];

const personalAssistantGoals = [
  'Personal Assistant',
  'Learning Companion',
  'Creative Helper',
  'Health & Wellness',
  'Task Management',
  'Research Assistant',
];

const industries = [
  'Retail & E-commerce',
  'Healthcare & Medical',
  'Finance & Banking',
  'Real Estate',
  'Education & Training',
  'Hospitality & Travel',
  'Automotive',
  'Professional Services',
  'Technology & Software',
  'Government & Public',
  'Food & Beverage',
  'Manufacturing',
  'Fitness & Wellness',
  'Legal Services',
  'Non-Profit',
  'Media & Entertainment',
];

const industryGoalsMap = {
  'Retail & E-commerce': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Product Recommendations',
    'Order Tracking',
    'Returns & Exchanges',
    'Lead Generation',
    'Loyalty Programs',
  ],
  'Healthcare & Medical': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Appointment Scheduling',
    'Patient Intake',
    'Symptom Guidance',
    'Insurance Verification',
    'Prescription Reminders',
    'Telehealth Support',
  ],
  'Finance & Banking': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Account Inquiries',
    'Loan Applications',
    'Fraud Alerts',
    'Investment Guidance',
    'Bill Payment Support',
    'Financial Planning',
  ],
  'Real Estate': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Property Search',
    'Viewing Appointments',
    'Market Information',
    'Mortgage Guidance',
    'Listing Information',
  ],
  'Education & Training': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Student Enrollment',
    'Course Recommendations',
    'Tutoring Support',
    'Campus Information',
    'Career Guidance',
    'Learning Companion',
  ],
  'Hospitality & Travel': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Reservation Management',
    'Concierge Services',
    'Guest Services',
    'Travel Planning',
    'Loyalty Programs',
    'Check-in Support',
  ],
  Automotive: [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Service Scheduling',
    'Vehicle Diagnostics',
    'Parts Ordering',
    'Warranty Information',
    'Sales Support',
    'Financing Assistance',
  ],
  'Professional Services': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Consultation Booking',
    'Client Intake',
    'Service Recommendations',
    'Project Updates',
    'Billing Inquiries',
    'Resource Library',
  ],
  'Technology & Software': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Technical Support',
    'Product Demos',
    'API Documentation',
    'User Onboarding',
    'Feature Requests',
    'Sales Engineering',
  ],
  'Government & Public': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Citizen Services',
    'Permit Applications',
    'Tax Assistance',
    'Public Information',
    'Emergency Information',
    'Appointment Scheduling',
  ],
  'Food & Beverage': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Order Taking',
    'Reservation Management',
    'Menu Recommendations',
    'Delivery Tracking',
    'Loyalty Programs',
    'Nutritional Information',
  ],
  Manufacturing: [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Inventory Management',
    'Quality Control',
    'Maintenance Scheduling',
    'Safety Protocols',
    'Production Planning',
    'Supplier Communication',
  ],
  'Fitness & Wellness': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Class Booking',
    'Workout Planning',
    'Nutrition Guidance',
    'Progress Tracking',
    'Membership Management',
    'Wellness Coaching',
  ],
  'Legal Services': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Consultation Scheduling',
    'Case Intake',
    'Legal Resources',
    'Billing Inquiries',
    'Document Preparation',
    'Case Updates',
  ],
  'Non-Profit': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Volunteer Coordination',
    'Donation Processing',
    'Program Information',
    'Event Management',
    'Beneficiary Support',
    'Impact Reporting',
  ],
  'Media & Entertainment': [
    'Customer Support',
    'Outbound Sales',
    'Learning and Development',
    'Scheduling',
    'Lead Qualification',
    'Answering Service',
    'Content Recommendations',
    'Subscription Management',
    'Technical Support',
    'Event Information',
    'Fan Engagement',
    'Content Discovery',
  ],
};

function CreateAgentDashboard({ handleVoice }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentUseCaseIndex, setCurrentUseCaseIndex] = useState(0);

  // Agent form data
  const [formData, setFormData] = useState({
    agentType: '',
    goal: '',
    industry: '',
    name: '',
    voice: null,
    useCase: '',
  });

  // Chip handling functions
  const handleChipClick = (useCase) => {
    setFormData((prev) => ({
      ...prev,
      useCase: useCase.prompt,
    }));
    setSelectedCategory(null);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentUseCaseIndex(0);
  };

  const handleCloseCategoryView = () => {
    setSelectedCategory(null);
    setCurrentUseCaseIndex(0);
  };

  const getCurrentUseCases = () => {
    const selectedCat = chipCategories.find((cat) => cat.id === selectedCategory);
    if (selectedCat) {
      return selectedCat.useCases.slice(currentUseCaseIndex, currentUseCaseIndex + 5);
    }
    return [];
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset dependent fields when agent type changes
  useEffect(() => {
    if (formData.agentType === 'Personal Assistant') {
      setFormData((prev) => ({
        ...prev,
        industry: '',
        goal: '',
      }));
    } else if (formData.agentType === 'Business Agent') {
      setFormData((prev) => ({
        ...prev,
        goal: '',
      }));
    }
  }, [formData.agentType]);

  // Reset goal when industry changes for business agents
  useEffect(() => {
    if (formData.agentType === 'Business Agent' && formData.industry) {
      setFormData((prev) => ({
        ...prev,
        goal: '',
      }));
    }
  }, [formData.industry, formData.agentType]);

  const getAvailableGoals = () => {
    if (formData.agentType === 'Personal Assistant') {
      return personalAssistantGoals;
    } else if (formData.agentType === 'Business Agent' && formData.industry) {
      return industryGoalsMap[formData.industry] || [];
    }
    return [];
  };

  const isFormValid = () => {
    const baseValid = formData.agentType && formData.goal && formData.name && formData.useCase;
    if (formData.agentType === 'Business Agent') {
      return baseValid && formData.industry;
    }
    return baseValid;
  };

  const handleCreate = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      history.push('/auth/login');
      return;
    }

    // Require at least a use case description
    if (!formData.useCase.trim()) {
      return;
    }

    setLoading(true);
    try {
      // Call the enhancement endpoint with user's input
      const enhancementResponse = await fetch('https://api.altan.ai/galaxia/hook/IrrJw9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.useCase,
        }),
      });

      if (!enhancementResponse.ok) {
        throw new Error('Failed to enhance agent prompt');
      }

      const enhancementData = await enhancementResponse.json();

      // Use the enhanced data from the API
      const agentName = enhancementData.name || formData.name || 'AI Assistant';
      const prompt = enhancementData.prompt || `You are a helpful AI assistant. Your goal is to assist users based on: ${formData.useCase}`;
      const description = enhancementData.description || formData.useCase.substring(0, 100) + (formData.useCase.length > 100 ? '...' : '');

      // Create agent using redux action
      const agentData = {
        name: agentName,
        prompt: prompt,
        description: description,
        // Include voice configuration as nested object if voice is selected
        voice: formData.voice ? {
          name: formData.voice.name,
          voice_id: formData.voice.voice_id,
          model_id: 'eleven_flash_v2',
          agent_output_audio_format: 'pcm_16000',
          optimize_streaming_latency: 4,
          stability: 0.5,
          speed: 1,
          similarity_boost: 0.8,
        } : null,
        meta_data: {
          agent_type: formData.agentType || 'General Assistant',
          goal: formData.goal || 'Assist users',
          industry: formData.industry || null,
          use_case: formData.useCase,
          voice_name: formData.voice?.name || null, // Keep for backward compatibility
          created_from: 'dashboard',
          enhanced: true,
        },
      };

      const newAgent = await dispatch(createAgent(agentData));

      // Redirect to agent page
      history.push(`/agent/${newAgent.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
      // Handle error - could show a toast notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto">
      <div className="text-center">
        <div
          data-aos="fade-down"
          data-aos-delay="200"
        >
          <div className="relative flex flex-col mt-2">
            <AgentFormWithButtons
              formData={formData}
              handleInputChange={handleInputChange}
              handleCreate={handleCreate}
              loading={loading}
              handleVoice={handleVoice}
              agentTypes={agentTypes}
              industries={industries}
              availableGoals={getAvailableGoals()}
              isFormValid={isFormValid()}
              showIndustry={formData.agentType === 'Business Agent'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateAgentDashboard);
