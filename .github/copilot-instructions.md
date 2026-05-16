# Copilot Instructions for Optima Helper 2

## UI Component Library

**IMPORTANT**: This project uses **[Base UI](https://base-ui.com/)** as the primary component library.

### Guidelines

- **Always use Base UI components** for UI elements instead of building from scratch
- Base UI provides unstyled, accessible components that work with Tailwind CSS
- Do not use other component libraries like Material-UI, Chakra UI, or Ant Design unless explicitly requested

### Common Base UI Components

When implementing UI features, prefer Base UI components:

- **Buttons**: Use `@base-ui/react/Button`
- **Dialogs/Modals**: Use `@base-ui/react/Dialog`
- **Popovers**: Use `@base-ui/react/Popover`
- **Select/Dropdown**: Use `@base-ui/react/Select`
- **Tabs**: Use `@base-ui/react/Tabs`
- **Tooltips**: Use `@base-ui/react/Tooltip`
- **Switches/Toggles**: Use `@base-ui/react/Switch`
- **Alerts**: Use `@base-ui/react/Alert`
- **Accordions**: Use `@base-ui/react/Accordion`
- **Sliders**: Use `@base-ui/react/Slider`
- **Menus**: Use `@base-ui/react/Menu`

### Installation

When Base UI components are needed:

```bash
pnpm add @base-ui/react
```

### Styling Approach

- Base UI components are **unstyled by default**
- Style them using **Tailwind CSS** classes
- Follow the project's existing Tailwind configuration
- Maintain consistency with the current design system

### Accessibility

- Base UI components come with built-in accessibility features
- Follow ARIA best practices as implemented by Base UI
- Test keyboard navigation and screen reader compatibility

## Project Structure

- Frontend: `packages/web` - React + TypeScript + Vite + Tailwind
- Backend: `packages/api` - Express + tRPC + Drizzle + SQLite
- Use tRPC for type-safe API calls between frontend and backend

## Code Quality

- Run `pnpm lint:fix` before committing
- Use TypeScript strictly - no `any` types
- Follow the existing code patterns in the monorepo
