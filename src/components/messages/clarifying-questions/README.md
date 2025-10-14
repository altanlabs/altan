# Clarifying Questions Widget

A multi-select question widget that allows users to select one option from each question group and send all selections together in a single message.

## Features

- 📋 Multiple question groups in a single container
- ✅ Radio-button style selection (one option per group)
- 🎯 Optional "Recommended" badges for suggested options
- 🎨 Compact, elegant glassmorphic design
- ✨ Visual feedback with checkmarks and hover effects
- 📱 Responsive and accessible

## Usage

### Basic Syntax

```markdown
<clarifying-questions>
  <question-group title="Question Title">
    <multi-option value="Option 1">Option 1 text</multi-option>
    <multi-option value="Option 2">Option 2 text</multi-option>
    <multi-option value="Option 3">Option 3 text</multi-option>
  </question-group>
</clarifying-questions>
```

### Props

#### `<clarifying-questions>`
Main container for the entire widget. No props required.

#### `<question-group>`
- **`title`** (optional): The title/label for the question group

#### `<multi-option>`
- **`value`** (required): The value that will be sent when selected. If omitted, uses the children text.
- **`recommended`** (optional): Set to `"true"` to mark this option as recommended. Shows a green highlight and badge.

## Examples

### Example 1: Without Recommendations

A simple clarifying questions widget with three question groups:

```markdown
<clarifying-questions>
  <question-group title="What type of database?">
    <multi-option value="PostgreSQL">PostgreSQL</multi-option>
    <multi-option value="MySQL">MySQL</multi-option>
    <multi-option value="MongoDB">MongoDB</multi-option>
  </question-group>
  
  <question-group title="What's your use case?">
    <multi-option value="Production deployment">Production deployment</multi-option>
    <multi-option value="Development testing">Development testing</multi-option>
    <multi-option value="Data analytics">Data analytics</multi-option>
  </question-group>
  
  <question-group title="What's your expected scale?">
    <multi-option value="Small (< 1GB)">Small (< 1GB)</multi-option>
    <multi-option value="Medium (1-100GB)">Medium (1-100GB)</multi-option>
    <multi-option value="Large (> 100GB)">Large (> 100GB)</multi-option>
  </question-group>
</clarifying-questions>
```

**User Experience:**
- User sees all three questions at once
- Can select one option from each group
- Selection count shows in header badge
- Clicking "Confirm & Send (3)" sends:
  ```
  1. PostgreSQL
  2. Production deployment
  3. Medium (1-100GB)
  ```

### Example 2: With Recommendations

Same structure but with AI-suggested best options highlighted:

```markdown
<clarifying-questions>
  <question-group title="What type of database?">
    <multi-option value="PostgreSQL" recommended="true">PostgreSQL</multi-option>
    <multi-option value="MySQL">MySQL</multi-option>
    <multi-option value="MongoDB">MongoDB</multi-option>
  </question-group>
  
  <question-group title="What's your use case?">
    <multi-option value="Production deployment" recommended="true">Production deployment</multi-option>
    <multi-option value="Development testing">Development testing</multi-option>
    <multi-option value="Data analytics">Data analytics</multi-option>
  </question-group>
  
  <question-group title="What's your expected scale?">
    <multi-option value="Small (< 1GB)">Small (< 1GB)</multi-option>
    <multi-option value="Medium (1-100GB)" recommended="true">Medium (1-100GB)</multi-option>
    <multi-option value="Large (> 100GB)">Large (> 100GB)</multi-option>
  </question-group>
</clarifying-questions>
```

**User Experience:**
- Recommended options have:
  - ✅ Green border and subtle green background
  - 🏷️ "Recommended" badge displayed inline
  - 💚 Enhanced hover effects with green accent
- User can still choose any option (recommendations are just visual hints)
- Badge disappears when option is selected (replaced by checkmark)

## Visual States

### Default Option
- White background with gray border
- Circular outline for radio-button style
- Hover: Light gray background

### Recommended Option
- Subtle green background tint
- Green border
- "Recommended" badge in green
- Hover: Brighter green background

### Selected Option
- Primary blue background tint
- Primary blue border
- Filled checkmark circle
- Badge hidden (if it was recommended)

## Tips

1. **Keep titles concise**: Question titles are displayed in small, uppercase text
2. **Use descriptive values**: The `value` attribute is what gets sent in the message
3. **Strategic recommendations**: Use `recommended="true"` sparingly for best options
4. **Reasonable option count**: 3-5 options per group works best
5. **Group related questions**: All groups are displayed together for context

## Component Architecture

```
ClarifyingQuestions (Main Container)
├── Header (with icon and selection counter)
├── QuestionGroup (repeatable)
│   ├── Title
│   └── QuestionOption (repeatable)
│       ├── Option text
│       ├── Recommended badge (conditional)
│       └── Selection circle/checkmark
└── Confirm Button (visible when selections exist)
```

## Output Format

When user clicks "Confirm & Send", the widget sends a formatted numbered list:

```
1. [First selection value]
2. [Second selection value]
3. [Third selection value]
```

This format makes it easy for AI to parse and understand the user's choices.

