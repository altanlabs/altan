import { ALTANER_COMPONENTS_CREATOR } from './schemas/altanercomponents';
import { ALTANER_VARIABLES_CREATOR } from './schemas/altanervariables';

const AltanerSchema = {
  title: 'Altaner',
  type: 'object',
  required: ['name', 'components'],
  properties: {
    name: {
      type: 'string',
      description: 'The name of the Altaner',
      'x-disable-free-text': true,
    },
    description: {
      type: 'string',
      description: 'The description of the Altaner',
      'x-disable-free-text': true,
    },
    icon_url: {
      type: 'string',
      description:
        'The icon representing the component either an iconify icon or a url to an image',
      'x-component': 'IconAutocomplete',
    },
    subscription: {
      'x-disable-header': true,
      'x-map': 'template',
      type: 'string',
      description:
        'The icon representing the component either an iconify icon or a url to an image',
      'x-component': 'AltanerSubscriptionGroup',
    },
    license: {
      'x-disable-header': true,
      'x-map': 'template.product_id',
      type: 'string',
      description: 'The product related to the altaner license',
    },
    versions: {
      type: 'array',
      'x-map': 'template.versions.items',
      'x-disable-header': true,
      description: 'The different versions of the altaner',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          major: {
            type: 'string',
          },
          minor: {
            type: 'string',
          },
          patch: {
            type: 'string',
          },
        },
      },
    },
    public_name: {
      type: 'string',
      description:
        'The public name of the solution. Will appear under altan.ai/altaners/{public_name}',
      // "x-component": "TemplatePublicName",
      'x-map': 'template.public_name',
    },
    is_visible: {
      type: 'boolean',
      description:
        'If enabled, the different versions of the Altaner template can be shown in the marketplace.',
      default: true,
      'x-map': 'template.is_visible',
    },
    cloning_settings: {
      type: 'object',
      description: 'The policy for cloning the Altaner.',
      'x-map': 'template.details.cloning_settings',
      'x-disable-free-text': true,
      properties: {
        distribution_mode: {
          'x-default-enabled': true,
          'x-disable-free-text': true,
          type: 'string',
          enum: ['closed', 'open', 'mixed'],
          enumDescriptions: [
            'The Altaner is a closed-source solution. The user cloning the Altaner can use it, but see and edit only the parts you allow.',
            'The Altaner is an open-source solution. The user cloning the Altaner has full access to the source components of the Altaner.',
            'The Altaner can be disstributed as both open and closed, based on the pricing plan.',
          ],
          default: 'mixed',
        },
      },
    },
    components: ALTANER_COMPONENTS_CREATOR,
    variables: ALTANER_VARIABLES_CREATOR,
    details: {
      type: 'object',
      description: 'The policy for cloning the Altaner.',
    },
    landing: {
      type: 'object',
      title: 'Landing Page',
      'x-map': 'template.details.landing',
      description: 'The landing page configuration for the Altaner in different languages',
      properties: {
        locales: {
          type: 'array',
          title: 'Locales',
          description: 'Language-specific landing page content',
          items: {
            type: 'object',
            title: 'Locale',
            description: 'Content for a specific language',
            properties: {
              language: {
                type: 'string',
                title: 'Language Code',
                description:
                  "The ISO 639-1 language code (e.g., 'en' for English, 'es' for Spanish)",
                pattern: '^[a-z]{2}$',
                enum: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ru', 'it', 'pt', 'ar'],
                enumDescriptions: [
                  'English',
                  'Spanish',
                  'French',
                  'German',
                  'Chinese',
                  'Japanese',
                  'Russian',
                  'Italian',
                  'Portuguese',
                  'Arabic',
                ],
              },
              content: {
                type: 'object',
                title: 'Locale Content',
                description: 'Landing page content for this language',
                properties: {
                  title: {
                    type: 'string',
                    title: 'Title',
                    description: 'The main title of the landing page',
                  },
                  description: {
                    type: 'string',
                    title: 'Description',
                    description: 'A brief description or tagline for the landing page',
                  },
                  video_demo_url: {
                    type: 'string',
                    title: 'Video Demo',
                    description: 'A public URL with the video demo',
                  },
                  readme: {
                    type: 'string',
                    title: 'Readme',
                    description:
                      'Markdown content with rich text about any details on installation or other relevant information',
                  },
                  features: {
                    type: 'array',
                    title: 'Features',
                    description: 'List of key features or benefits',
                    items: {
                      type: 'string',
                      title: 'Feature',
                      description: 'A single feature or benefit',
                    },
                  },
                  benefits: {
                    type: 'array',
                    title: 'Benefits',
                    description: 'Detailed list of benefits or advantages',
                    items: {
                      type: 'object',
                      title: 'Benefit',
                      description: 'A single benefit with title and description',
                      properties: {
                        title: {
                          type: 'string',
                          title: 'Benefit Title',
                          description: 'The title of the benefit',
                        },
                        description: {
                          type: 'string',
                          title: 'Benefit Description',
                          description: 'A detailed description of the benefit',
                        },
                      },
                      required: ['title', 'description'],
                    },
                  },
                  testimonials: {
                    type: 'array',
                    title: 'Testimonials',
                    description: 'Customer testimonials or reviews',
                    items: {
                      type: 'string',
                      title: 'Testimonial',
                      description: 'A single testimonial quote',
                    },
                  },
                  logos: {
                    type: 'array',
                    title: 'Partner Logos',
                    description: 'URLs of partner or client logos',
                    items: {
                      type: 'string',
                      title: 'Logo URL',
                      description: 'URL to a partner or client logo image',
                      format: 'uri',
                    },
                  },
                  sections: {
                    type: 'array',
                    title: 'Additional Sections',
                    description: 'Additional content sections for the landing page',
                    items: {
                      type: 'string',
                      title: 'Section',
                      description: 'Content for an additional section',
                    },
                  },
                },
                required: [
                  'title',
                  'description',
                  'features',
                  'benefits',
                  'testimonials',
                  'logos',
                  'sections',
                ],
              },
            },
            required: ['language', 'content'],
          },
          minItems: 1,
        },
      },
      required: ['locales'],
    },
  },
};

export default AltanerSchema;
