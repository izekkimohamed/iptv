# Coding Style Guide

This document outlines the coding style and conventions to be followed in this project.

## 1. Naming Conventions

- **Components:** Component names and their corresponding filenames should be in **PascalCase**.
  - *Example:* `MyComponent` in `MyComponent.tsx`.
- **Variables and Functions:** Use **camelCase** for variables and functions.
  - *Example:* `const myVariable = 'hello';`
  - *Example:* `function myFunction() { ... }`
- **Hooks:** Custom hooks should start with `use`.
  - *Example:* `function useMyHook() { ... }`

## 2. Component Structure

- **Props:** Define component props using an interface named after the component with a `Props` suffix.
  - *Example:* For a component named `MyComponent`, the props interface should be named `MyComponentProps`.
- **Component Definition:** Components should be defined as functions that take a `props` object as an argument. Avoid using `React.FC`.
  - *Example:* `function MyComponent(props: MyComponentProps) { ... }`
- **Helper Functions:** Helper functions that do not depend on component state should be defined outside the component. If a helper function is used in multiple components, it should be moved to a utility file in the `lib` directory.
- **State:** Use `useState` for component-level state and Zustand for global state.
- **Styling:** Use Tailwind CSS for styling. The `cn` utility should be used for conditional classes.
- **Structure:**
  - Imports should be grouped by type (e.g., libraries, stores, components, utils).
  - Helper functions that do not depend on component state should be defined outside the component.
  - The component should be a single default export function.

## 3. File and Folder Organization

- **Components:** Reusable components should be placed in the `components` directory.
- **Pages:** Page components should be placed in the `app` directory.
- **Utils:** Utility functions should be placed in the `lib` directory.
- **State:** Zustand stores should be placed in the `store` directory.
