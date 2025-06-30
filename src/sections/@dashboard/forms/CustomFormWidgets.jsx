import { Serializer, QuestionTextModel, CustomWidgetCollection } from 'survey-core';

// Define the AddressWidget
const addressWidget = {
  name: 'address',
  title: 'Address Autocomplete',
  iconName: 'icon-wizard',
  widgetIsLoaded: () => true,
  isFit: (question) => question.getType() === 'address',
  init: () => {
    // Register the "address" question type with its own class
    Serializer.addClass(
      'address',
      [],
      () => {
        // Return a new instance of QuestionTextModel but with a custom type
        const q = new QuestionTextModel('address');
        q.getType = () => 'address';
        return q;
      },
      'text',
    );
  },
  htmlTemplate:
    "<div class='address-placeholder'>Address autocomplete will be rendered in the forms</div>",
  afterRender: (question, el) => {
    // No additional rendering logic required; using default
    const placeholder = el.querySelector('.address-placeholder');
    if (!placeholder) {
      console.error('The `placeholder` element was not found.');
    }
  },
};

// Register the widget in the custom widget collection
CustomWidgetCollection.Instance.addCustomWidget(addressWidget, 'customtype');

// Define the AltanAuth widget
const altanAuthWidget = {
  name: 'altanauth',
  title: 'Altan Authentication',
  iconName: 'icon-wizard',
  widgetIsLoaded: () => true,
  isFit: (question) => question.getType() === 'altanauth',
  init: () => {
    Serializer.addClass(
      'altanauth',
      [],
      () => {
        const q = new QuestionTextModel('altanauth');
        q.getType = () => 'altanauth';
        return q;
      },
      'text',
    );
  },
  htmlTemplate:
    "<div class='altan-auth-placeholder'>Altan Auth component will be rendered here</div>",
  afterRender: (question, el) => {
    const placeholder = el.querySelector('.altan-auth-placeholder');
    if (placeholder) {
      placeholder.textContent = 'Altan Auth component';
    } else {
      console.error('The `altan-auth-placeholder` element was not found.');
    }
  },
};

// Register the AltanAuth widget
CustomWidgetCollection.Instance.addCustomWidget(altanAuthWidget, 'customtype');

const countryWidget = {
  name: 'country',
  title: 'Country Autocomplete',
  iconName: 'icon-wizard',
  widgetIsLoaded: () => true,
  isFit: (question) => question.getType() === 'country',
  init: () => {
    // Register the "address" question type with its own class
    Serializer.addClass(
      'country',
      [],
      () => {
        // Return a new instance of QuestionTextModel but with a custom type
        const q = new QuestionTextModel('country');
        q.getType = () => 'country';
        return q;
      },
      'text',
    );
  },
  htmlTemplate:
    "<div class='country-placeholder'>Country autocomplete will be rendered in the forms</div>",
  afterRender: (question, el) => {
    // No additional rendering logic required; using default
    const placeholder = el.querySelector('.country-placeholder');
    if (!placeholder) {
      console.error('The `placeholder` element was not found.');
    }
  },
};

// Register the widget in the custom widget collection
CustomWidgetCollection.Instance.addCustomWidget(countryWidget, 'customtype');
