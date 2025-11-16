# NewLayout Architecture

A modern, TypeScript-based layout system following SOLID principles with smooth animations and responsive design.

## Features

### 🎯 Core Functionality
- **Fixed Viewport Layout**: Spotify/Linear-style SPA with internal scrolling
- **Sticky Header**: Smooth transitions with scroll detection
- **Compact Prompt Input**: Appears in header when scrolling, expands on click
- **Keyboard Shortcuts**: Cmd+K / Ctrl+K to focus prompt
- **Framer Motion Animations**: Smooth, performant transitions
- **TypeScript**: Full type safety with SOLID principles

### 📱 Responsive Design
- Mobile-first approach
- Dynamic viewport height (`100dvh`) for mobile Safari
- Touch-optimized scrolling
- Safe area support (iOS notches)

## Architecture

### Directory Structure

```
new/
├── NewLayout.tsx           # Main layout component
├── types.ts               # TypeScript type definitions
├── components/
│   └── Header.tsx        # Sticky header component
├── hooks/
│   ├── useScrollDetection.ts    # Scroll state management
│   ├── usePromptExpansion.ts    # Prompt expand/collapse logic
│   └── useKeyboardShortcuts.ts  # Keyboard shortcut handler
└── Footer.jsx            # Footer component
```

### Components

#### NewLayout.tsx
Main layout container with:
- Fixed viewport management
- Auth state handling
- Credit balance polling
- Footer rendering logic

#### Header.tsx
Sticky header with:
- Scroll-based styling transitions
- Compact prompt input integration
- User dropdown and navigation
- Theme toggle

#### CompactPromptInput.tsx
Minimized prompt input for header:
- Framer Motion animations
- Click to expand
- Keyboard shortcut indicator

### Custom Hooks

#### useScrollDetection
```typescript
const { scrollY, isScrolled, showCompactPrompt } = useScrollDetection(threshold);
```
- Tracks window scroll position
- Returns state for UI updates
- Optimized with passive event listeners

#### usePromptExpansion
```typescript
const { expandPrompt } = usePromptExpansion();
```
- Smooth scroll to hero section
- Auto-focus on prompt input
- Fallback to top scroll

#### useKeyboardShortcuts
```typescript
useKeyboardShortcuts(onActivate);
```
- Handles Cmd+K / Ctrl+K
- Prevents default browser behavior
- Cross-platform support

## SOLID Principles

### Single Responsibility Principle (SRP)
- Each component has one clear purpose
- Hooks handle specific functionality
- Separated concerns (layout, header, scroll, etc.)

### Open/Closed Principle (OCP)
- User actions handled via action map
- Easy to extend without modification
- Configuration-based behavior

### Liskov Substitution Principle (LSP)
- TypeScript interfaces ensure contract compliance
- Props are properly typed
- Components can be easily swapped

### Interface Segregation Principle (ISP)
- Minimal, focused interfaces (HeaderProps, NewLayoutProps)
- No unnecessary dependencies
- Clean component APIs

### Dependency Inversion Principle (DIP)
- Depends on abstractions (hooks, types)
- Auth dialog callback pattern
- Configurable through props

## DRY (Don't Repeat Yourself)

### Reusable Hooks
- `useScrollDetection` - Used across components
- `usePromptExpansion` - Single source of truth
- `useKeyboardShortcuts` - Centralized shortcut logic

### Shared Types
- All types in `types.ts`
- Consistent interfaces
- No duplicate type definitions

### Component Composition
- Header extracted from layout
- CompactPromptInput is reusable
- Footer components shared

## Animations

### Framer Motion Integration

**Header Background Transition**
```typescript
animate={{
  backgroundColor: isScrolled ? 'rgba(...)' : 'transparent',
  backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
}}
transition={{ duration: 0.3, ease: 'easeInOut' }}
```

**Compact Prompt Animation**
```typescript
initial={{ opacity: 0, y: -10, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: -10, scale: 0.95 }}
transition={{ duration: 0.2, ease: 'easeOut' }}
```

**Button Interactions**
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

## Scrolling Behavior

### Fixed Viewport
- `html`, `body`, `#root`, `ion-app`: `overflow: hidden` + `position: fixed`
- No body scroll - all scrolling happens in content container
- 100dvh for mobile support

### Scrollable Content
- `.overflow-y-auto` class on content container
- Smooth scroll behavior
- Momentum scrolling on iOS
- Custom scrollbar styling

### Scroll Detection
- Threshold: 300px for compact prompt
- 20px for header styling
- Passive event listeners for performance

## Usage

### Basic Implementation

```tsx
import NewLayout from './layouts/dashboard/new/NewLayout';

function MyPage() {
  return (
    <NewLayout onRequestAuth={(openDialog) => {
      // Handle auth dialog
    }}>
      <div id="hero">
        {/* Hero section with prompt input */}
      </div>
      {/* Rest of content */}
    </NewLayout>
  );
}
```

### With Keyboard Shortcuts
The layout automatically handles Cmd+K / Ctrl+K to scroll to the prompt input.

### Scroll Detection
The compact prompt automatically appears in the header when scrolling past 300px.

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android)

## Performance

### Optimizations
- Passive scroll listeners
- React.memo for components
- useMemo for derived state
- useCallback for stable references
- Framer Motion layout animations (GPU accelerated)

### Bundle Size
- Framer Motion: Tree-shakeable
- TypeScript: Zero runtime overhead
- Minimal dependencies

## Testing Checklist

- [ ] Scroll detection triggers at correct thresholds
- [ ] Compact prompt appears/disappears smoothly
- [ ] Clicking compact prompt scrolls to hero
- [ ] Cmd+K / Ctrl+K focuses prompt
- [ ] Header styling transitions on scroll
- [ ] Mobile scrolling works (iOS/Android)
- [ ] Safe area respected on notched devices
- [ ] Auth dialog opens correctly
- [ ] Footer renders conditionally
- [ ] No horizontal overflow on any device

## Troubleshooting

### Scroll not working
- Check `.overflow-y-auto` class on content container
- Verify fixed viewport CSS is applied
- Check for conflicting overflow styles

### Compact prompt not appearing
- Verify scroll threshold (300px)
- Check `showCompactPrompt` state
- Ensure hero section has `id="hero"`

### Keyboard shortcut not working
- Check for conflicting shortcuts
- Verify `useKeyboardShortcuts` is called
- Test Cmd+K (Mac) and Ctrl+K (Windows)

### Animations stuttering
- Check Framer Motion version
- Verify GPU acceleration enabled
- Reduce animation complexity

## Future Enhancements

- [ ] Add scroll progress indicator
- [ ] Implement virtual scrolling for long lists
- [ ] Add more keyboard shortcuts
- [ ] Persistent scroll position on navigation
- [ ] Advanced scroll snapping
- [ ] Performance monitoring

## Contributing

When modifying this layout:
1. Maintain TypeScript type safety
2. Follow SOLID principles
3. Update tests and documentation
4. Test on mobile devices
5. Verify animations are smooth (60fps)
6. Check accessibility (keyboard navigation, screen readers)

---

**Version**: 2.0.0  
**Last Updated**: November 16, 2025  
**Author**: Altan Development Team

