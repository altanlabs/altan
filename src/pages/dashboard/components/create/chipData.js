export const chipCategories = [
  {
    id: 'website',
    name: 'Website 3.0',
    useCases: [
      {
        title: 'Fullscreen Hero Landing Page',
        prompt: `Create a fullscreen hero landing page with the following specifications:

🌅 Hero Section Layout (Fullscreen Landing Page)
- Full-screen section: min-h-screen w-screen covering the entire viewport
- Background: Subtle gradient overlay + video layer
- Non-scrollable: overflow-hidden on body and html elements

📽️ Background Video Layer
- Video source (mp4): https://api.altan.ai/platform/media/f0304f08-d06f-4663-982c-df10cf1a456a?account_id=8943b7c8-ca6d-469d-b3d3-3d7c527ae6a5
- Classes: absolute inset-0 w-full h-full object-cover
- Autoplay, muted, loop, playsinline, no controls
- Place inside a relative container div

🔤 Fonts Used
- Title: Libre Caslon Text (text-6xl, font-light, tracking-tight)
- Subtitle/Paragraph: Manrope (text-sm to text-base, font-normal)
- Button: Manrope (text-sm, font-medium)

🧭 Navbar
- Position: absolute top-0 left-0 right-0 z-50 px-8 py-6
- Flex justify-between items-center
- Font: Manrope, font-normal, text-white/80
- Links: Origins, Records, Community
- Right corner: Language selector (EN ⌄)
- Left icon: Small, minimalist star/sunburst icon (SVG)

🖋️ Main Text Section (Centered Left)
- Container: z-10 relative max-w-2xl px-8 pt-32 text-white
- Title: "Into the Quiet Unknown" (font-libre-caslon text-6xl font-light tracking-tight leading-[1.1])
- Paragraph: "The unknown isn't always loud. Sometimes it whispers. And if you pause long enough, you'll hear where it wants to take you." (mt-4 font-manrope text-base font-normal text-white/80)
- Button: "Walk With Us →" (mt-6 bg-white text-black px-5 py-2 rounded-lg font-manrope text-sm font-medium hover:bg-gray-100 transition)

🦋 Decorative Right Side
- Floating/fixed label text: "FIELD ENTRY CHAPTER ONE" (vertical writing or rotate-90 with tracking-widest uppercase text-sm)
- Small © Luna label at bottom-right (text-xs, text-white/60)

🌸 Flower and Butterfly Imagery
- Flowers and butterfly as part of background video or animated overlay
- Butterfly should land and gently flap wings before becoming still

🌐 Footer Label
- Bottom-left corner: "✦ Founded in Stillness, 2025"
- Font: Manrope, text-xs, text-white/50

Important Notes:
- Avoid duplicate fontFamily definitions in Tailwind config
- Use proper font imports from Google Fonts
- Ensure proper theme configuration without circular references
- Use single backticks for template literals, not triple backticks`,
      },
    ],
  },
  {
    id: 'voice',
    name: 'Voice Agents',
    useCases: [
      {
        title: 'Create a personal website with a voice assistant',
        prompt:
          'Create a personal website with a voice assistant where users can asks questions about me, my work and my projects.  Display it in the website using the widget Genesis will provide. ',
      },
      {
        title: 'Create a voice agent for a business',
        prompt:
          'Create a voice agent for a business that can answer questions about the business, its products and services',
      },
      {
        title: 'Create a voice agent for a product',
        prompt:
          'Create a voice agent for a product that can answer questions about the product, its features and benefits',
      },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    useCases: [
      {
        title: 'Create a CRM for a business',
        prompt:
          'Create a CRM for a business that can help the business manage its customers, sales, and marketing',
      },
      {
        title: 'Create a sales funnel for a business',
        prompt:
          'Create a sales funnel for a business that can help the business sell its products and services',
      },
      {
        title: 'Create a marketing campaign for a business',
        prompt:
          'Create a marketing campaign for a business that can help the business sell its products and services',
      },
      {
        title: 'Build a docs and support webapp',
        prompt:
          'Create a docs and support website for my business. I should be able to add new docs and support articles and manage the website. Finally, we should be able to add an agent that can answer questions about the docs and support articles.',
      },
    ],
  },
  {
    id: 'research',
    name: 'Research',
    useCases: [
      {
        title: 'Market analysis',
        prompt:
          'Analyze the outdoor activities market in Singapore using the most suitable business analysis framework (e.g., SWOT, BMC, PESTEL, 7Ps, etc.). Apply the chosen model comprehensively, completing all sections with realistic ideas and well-founded assumptions. Present the analysis as an interactive, professionally designed webpage that includes clear layouts, visual elements such as charts and icons, and responsive design. The final webpage should be public, permanent, and ready to be used in real-world contexts such as presentations, education, or strategic planning.',
      },
      {
        title: 'Consumer sentiment',
        prompt:
          'Analyze online consumer sentiment toward pool cleaning robots, focusing on e-commerce platform reviews. Compile authentic positive and negative user feedback, then synthesize key insights. Present the analysis as an interactive, professionally designed webpage that includes clear layouts, visual elements such as charts and icons, and responsive design. The final webpage should be public, permanent, and ready to be used in real-world contexts such as presentations, education, or strategic planning.',
      },
      {
        title: 'University Thesis',
        prompt:
          'Write a formal, university-level thesis (around 3,000–5,000 words) on the topic "How Taylor Swift Became a Billion-Dollar Brand." The paper should include a clear introduction with a thesis statement, followed by analytical sections on her career evolution, branding strategies, business decisions, and fan engagement. Use concrete examples and credible sources, and conclude with reflections on her impact on celebrity branding and the music industry. Present it in a single page website publicly available.',
      },
    ],
  },
  // {
  //   id: 'support',
  //   name: 'Support',
  //   useCases: [
  //     {
  //       title: 'Build a docs and support website',
  //       prompt:
  //         'Create a docs and support website for my business. I should be able to add new docs and support articles and manage the website. Finally, we should be able to add an agent that can answer questions about the docs and support articles.',
  //     },
  //   ],
  // },
];
