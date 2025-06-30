export const oceanTraits = [
  {
    variable: 'Openness to Experience',
    left: 'Conventional, Prefer Routine',
    right: 'Creative, Open to New Experiences',
    color: 'inherit',
  },
  {
    variable: 'Conscientiousness',
    left: 'Spontaneous, Carefree',
    right: 'Organized, Detail-oriented',
    color: '#C8FACD',
  },
  {
    variable: 'Extraversion',
    left: 'Reserved, Introverted',
    right: 'Outgoing, Extraverted',
    color: '#61F3F3',
  },
  {
    variable: 'Agreeableness',
    left: 'Critical, Competitive',
    right: 'Friendly, Compassionate',
    color: '#7289da',
  },
  {
    variable: 'Neuroticism',
    left: 'Calm, Emotionally Stable',
    right: 'Anxious, Sensitive',
    color: '#FFD666',
  },
];

export const PERSONALITY = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Advanced Personality Schema',
  description:
    'An advanced schema encompassing a plethora of personality attributes to craft multifaceted and nuanced personality prompts for the Agent in charge of the App.',
  type: 'object',
  properties: {
    goal: {
      type: 'string',
      description: 'Describe the goal/purpose/objective of the AIgent',
    },
    job: {
      type: 'string',
      description:
        'Describe in detail the job that your want the AIgent to execute. Provide details on how to use tools to accomplish its goal',
    },
    organization: {
      type: 'string',
      description: 'The company/organization the AI works for.',
    },
    customInstructions: {
      type: 'string',
      description: 'Any custom instructions provided to craft the personality.',
    },
    communicationStyleOptions: {
      type: 'array',
      items: { type: 'string' },
      enum: [
        'Authoritative',
        'Persuasive',
        'Empathetic',
        'Confident',
        'Charismatic',
        'Collaborative',
        'Diplomatic',
        'Informative',
        'Assertive',
        'Inspirational',
        'Storytelling',
        'Concise',
        'Expressive',
        'Reserved',
        'Amiable',
        'Analytical',
        'Driver',
        'Intuitive',
        'Systematic',
        'Critical',
      ],
      description: "Individual's preferred communication style.",
    },
    engagementStyleOptions: {
      type: 'array',
      items: { type: 'string' },
      enum: [
        'Formal',
        'Informal',
        'Friendly',
        'Professional',
        'Casual',
        'Enthusiastic',
        'Reserved',
        'Practical',
      ],
      description: 'How an individual engages in interactions.',
    },
    valuesOptions: {
      type: 'array',
      items: { type: 'string' },
      enum: ['Integrity', 'Loyalty', 'Respect', 'Courage', 'Ambition', 'Cooperation'],
      description: 'Values held by the individual.',
    },
    conflictResolutionOptions: {
      type: 'array',
      items: { type: 'string' },
      enum: ['Avoiding', 'Accommodating', 'Competing', 'Compromising', 'Collaborating'],
      description: 'Preferred method of resolving conflicts.',
    },
    humorStyleOptions: {
      type: 'array',
      items: { type: 'string' },
      enum: ['Affiliative', 'Self-enhancing', 'Aggressive', 'Self-defeating'],
      description: 'Preferred style of humor.',
    },
  },
  required: [
    'jobPositions',
    'temperatureOptions',
    'expertiseAreaOptions',
    'roleOptions',
    'engagementStyleOptions',
    'listeningOptions',
    'informationProcessingOptions',
    'emotionalIntelligenceOptions',
  ],
};
