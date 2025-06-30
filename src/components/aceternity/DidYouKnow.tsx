import { type FC } from 'react';

import { TextRotate } from './TextRotate';

const didYouKnowTips = [
  'Did you know? You can enhance your app with images by uploading them directly in the chat as an attachment or as a URL. Only URLs of media uploaded to the platform can be used.',
  'Did you know? The Targeted Edit Tool allows you to modify any component of your app by selecting it directly in the preview and describing the changes in the chat.',
  "Did you know? If you're a developer, you can open the code of a selected component and modify it manually for greater customization.",
  'Did you know? Prompting in Altan is the process of giving written instructions to guide the AI in building, modifying, or improving your app. Clear and structured input leads to better results.',
  'Did you know? Using the Targeted Edit Tool, you can select a specific element in your app and have it automatically appear in the chat for precise modifications.',
  'Did you know? Providing context before a request helps the AI understand your goal and generate more accurate results.',
  'Did you know? Breaking down complex tasks into smaller steps improves accuracy and reduces errors when building automations.',
  'Did you know? You can upload images or references to guide the AI more effectively, ensuring better design and layout precision.',
  'Did you know? The AI works best with detailed instructions. Instead of saying "Create a scheduling app," specify features like time slot selection and email confirmations.',
  'Did you know? Setting clear constraints, like limiting the number of active tasks in a task manager, helps the AI focus on key priorities.',
  'Did you know? If something isn\'t working in your app, describe the issue clearly instead of just saying "fix it." This helps the AI troubleshoot more efficiently.',
  'Did you know? Every time you publish your app, a new version is automatically saved, allowing you to track changes and restore previous versions.',
  'Did you know? You can preview, restore, and view logs of previous versions of your app through the Rollback feature in the top-right corner of the preview.',
  'Did you know? Checkpoints allow you to undo recent changes without rolling back an entire version of your app.',
  'Did you know? Every AI message includes a Checkpoint Card, letting you restore the app to the exact state after that message.',
  "Did you know? Altan's AI automatically detects and fixes most errors in the background without interrupting your workflow.",
  'Did you know? If an error persists, the "Fix with AI" button will analyze the issue and apply a solution automatically.',
  'Did you know? If you encounter a database error, copying and sending the full error message to the AI can help resolve it quickly.',
  "Did you know? You can control your app's visibility, allowing it to be public, private, or restricted, through the settings menu.",
  'Did you know? The settings menu lets you enable or disable app cloning, modify custom domains, and connect to a GitHub repository.',
  'Did you know? Switching between Preview Mode and Code Mode allows both no-code users and developers to refine their apps efficiently.',
  'Did you know? The Components Menu helps you switch between different parts of your app, such as the interface, database, and workflows.',
  'Did you know? You can add new functionalities to your app by clicking the "Add" button, including databases, APIs, and authentication systems.',
  'Did you know? You can toggle between desktop and mobile view in the editor to ensure your app is fully responsive on all devices.',
].sort(() => Math.random() - 0.5);

export const DidYouKnow: FC = () => {
  return (
    <div className="w-full flex justify-center">
      <TextRotate
        texts={didYouKnowTips}
        rotationInterval={7000}
        staggerFrom="first"
        staggerDuration={0.01}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        splitBy="words"
        mainClassName="text-gray-300 text-sm text-center w-full"
        splitLevelClassName="justify-center"
        elementLevelClassName="text-center"
      />
    </div>
  );
};
