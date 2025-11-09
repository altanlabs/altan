export const chipCategories = [
  {
    id: 'website',
    name: 'Website 3.0',
    useCases: [
      {
        title: 'Video Landing Page',
        prompt: `Create a fullscreen hero landing page with the following specifications:

🌅 Hero Section Layout (Fullscreen Landing Page)
- Full-screen section: min-h-screen w-screen covering the entire viewport
- Background: Subtle gradient overlay + video layer
- Non-scrollable: overflow-hidden on body and html elements

📽️ Background Video Layer
- Video source (mp4): https://platform-api.altan.ai/media/f0304f08-d06f-4663-982c-df10cf1a456a?account_id=8943b7c8-ca6d-469d-b3d3-3d7c527ae6a5
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
      {
        title: 'Sunglasses eCommerce website',
        prompt: `I want to create a website for a company that makes sunglasses called MELLER.

Here’s more info:
I want the website to have a big landing screen where this video is shown in the background:

https://shorturl.at/otnus
Use a small white gradient over the video. the rest of the website has to be white and the buttons and styles to be black.

If I scroll down, I want then to have the 4 types of sunglasses you can buy. I want the website to be very simple but very cool.
Add this logo on the top left: https://shorturl.at/5sn4i
And use this 2 images for each sunglass type as images of the diferent sunglasses the website sells:

https://shorturl.at/c6fVz & https://shorturl.at/tfwm2
https://tinyurl.com/4ue5eykh & https://tinyurl.com/mr2r8hy6
https://tinyurl.com/2xrj8y33 & https://tinyurl.com/3jkzrm4z
https://tinyurl.com/mr5jhza2 & https://tinyurl.com/wc99m9b4
Make the website work, that if you click buy one of the sunglasses, it adds it to your basket and you can do the checkout.
`,
      },
      {
        title: 'Website for a restaurant',
        prompt: `I want to create a landing page for a restaurant.

Here’s some more info:
Create a fullscreen, non-scrollable landing page for a high-end Italian restaurant called *Carbone*. Use a dark-gradient overlay on this background video:

https://shorturl.at/wvWye

**Design & Layout:**

- Luxurious, modern Italian aesthetic (inspired by Carbone NYC)
- White or gold text over dark background, readable buttons

**Navbar:**

- Fixed, elegant, minimal, with tabs: Home, Menu, Hours, Reservations — each opens as a sleek modal, not a new page

**Features:**

- *Reservations modal*: choose date, time, guests, table (inside/outside)
- *AI agent* (bottom right): assists with bookings and questions, supports voice input
- *Menu modal*: list stylish dishes (e.g., Spicy Rigatoni Vodka)
- *Hours modal*: show current availability elegantly

**Other:**

- Fully responsive
- Smooth transitions and hover effects
- Ensure video scales and text stays legible across all devices
`,
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
      {
        title: 'OKRs & KPIs Tracker',
        prompt:
          'Create an internal app to track and manage company OKRs and KPIs. The app should let us: Define and edit Objectives and Key Results per quarter, assign owners to each Objective and each Key Result, track progress (% completion or metric value), view KPIs in a dashboard with filters by area (Users, Revenue, Product, Tech, etc.), add weekly/monthly updates or comments per KR or KPI, and show visual indicators (on track / at risk / off track). The app should include: A database with Objectives, Key Results, KPIs, and Updates, a form to create/edit Objectives and KRs, a dashboard to visualize KPI trends, a table view to review and filter OKRs by owner or status, and support for multiple quarters',
      },
    ],
  },
  {
    id: 'support',
    name: 'Support',
    useCases: [
      {
        title: 'Build a docs and support website',
        prompt:
          'Create a docs and support website for my business. I should be able to add new docs and support articles and manage the website. Finally, we should be able to add an agent that can answer questions about the docs and support articles.',
      },
    ],
  },
];
