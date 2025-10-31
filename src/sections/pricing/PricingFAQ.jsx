import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Button } from '../../components/ui/button';

// ----------------------------------------------------------------------

const FAQ_DATA = [
  {
    id: 1,
    question: 'Where can I view my usage?',
    answer: 'You can track your credit usage and see detailed analytics in the usage dashboard.',
    link: '/usage',
    linkText: 'View usage dashboard',
  },
  {
    id: 2,
    question: 'How can I manage billing, invoices and my subscription?',
    answer:
      'Access your billing settings to manage your subscription, view invoices, and update payment methods.',
    link: '/account/settings?tab=billing',
    linkText: 'Go to billing settings',
  },
  {
    id: 3,
    question: 'What are credits and what do they mean?',
    answer:
      'Credits are our unified billing unit that simplifies usage across the entire Altan platform. Here are some examples of how credits are consumed:',
    examples: [
      '• AI Credits: Used for AI agents and conversations, with consumption varying by LLM model (GPT-4 uses more credits than GPT-3.5)',
      '• Database Credits: Consumed for database operations like queries, updates, and data processing',
      '• Task Credits: Used for workflows and automations, with consumption based on payload size and execution time',
      '• Integration Credits: Used for third-party API calls and data synchronization',
    ],
  },
  {
    id: 4,
    question: 'What happens when I upgrade my subscription?',
    answer:
      "When you upgrade, your remaining credits will be transferred to your new plan. Your old subscription will end immediately, and your new subscription will start right away with a fresh billing cycle. You'll only be charged for the new plan, and your billing date will reset to today.",
  },
];

export default function PricingFAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-12 text-center space-y-3">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Everything you need to know about our credit-based pricing
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {FAQ_DATA.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={`item-${faq.id}`}
            className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50 px-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <AccordionTrigger className="py-5 text-base font-semibold text-gray-900 dark:text-white hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className={faq.examples || faq.link ? 'mb-4' : ''}>
                {faq.answer}
              </p>

              {faq.examples && (
                <div className={faq.link ? 'mb-4' : ''}>
                  {faq.examples.map((example, idx) => (
                    <p key={idx} className="mb-2 text-sm">
                      {example}
                    </p>
                  ))}
                </div>
              )}

              {faq.link && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2"
                >
                  <Link to={faq.link} className="inline-flex items-center gap-2">
                    {faq.linkText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
