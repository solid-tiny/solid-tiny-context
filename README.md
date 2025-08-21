# solid-tiny-context

A tiny, type-safe state management library for SolidJS with built-in persistence support.

## Features

- 🚀 **Lightweight**: Minimal bundle size with maximum functionality
- 🔒 **Type-safe**: Full TypeScript support with excellent type inference
- 🔄 **Reactive**: Built on SolidJS's reactive primitives
- 💾 **Persistence**: Built-in localStorage/sessionStorage support
- 🌐 **Cross-tab sync**: Automatic synchronization across browser tabs
- 🎯 **Component & Global**: Support for both component-level and global state
- 📦 **Zero dependencies**: Only peer dependency on solid-js

## Installation

```bash
npm install solid-tiny-context
# or
pnpm add solid-tiny-context
# or
yarn add solid-tiny-context
```

## Quick Start

### Global State

```tsx
import { defineGlobalStore, enableGlobalStore } from 'solid-tiny-context';

// Define global state
const globalState = defineGlobalStore('myApp', {
  state: () => ({
    count: 0,
    message: 'Hello, SolidJS!',
  }),
  getters: {
    doubleCount() {
      return this.state.count * 2;
    },
  },
  methods: {
    increment() {
      this.actions.setState('count', (prev) => prev + 1);
    },
    updateMessage(newMessage: string) {
      this.actions.setState('message', newMessage);
    },
  },
  persist: 'localStorage', // Optional: persist state
});

// Enable persistence (call once in your app)
enableGlobalStore();

// Use in components
function Counter() {
  const [state, actions] = globalState;
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Double: {state.doubleCount}</p>
      <p>Message: {state.message}</p>
      <button onClick={() => actions.increment()}>
        Increment
      </button>
      <button onClick={() => actions.updateMessage('Updated!')}>
        Update Message
      </button>
    </div>
  );
}
```

### Component State (Context)

```tsx
import { createComponentState } from 'solid-tiny-context';

// Create context
const counterContext = createComponentState({
  state: () => ({
    count: 0,
  }),
  methods: {
    increment() {
      this.actions.setState('count', (prev) => prev + 1);
    },
    decrement() {
      this.actions.setState('count', (prev) => prev - 1);
    },
  },
});

// Provider component
function App() {
  const context = counterContext.initial(); // Can pass initial state here
  
  return (
    <context.Provider>
      <Counter />
    </context.Provider>
  );
}

// Consumer component
function Counter() {
  const [state, actions] = counterContext.useContext();
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => actions.increment()}>+</button>
      <button onClick={() => actions.decrement()}>-</button>
    </div>
  );
}
```

## API Reference

### `defineGlobalStore(name, options)`

Creates a global state store.

#### Parameters

- `name` (string): Unique identifier for the store
- `options` (object):
  - `state` (() => T): Function returning initial state
  - `getters?` (object): Computed values based on state
  - `methods?` (object): Functions to modify state
  - `nowrapData?` (object): Additional non-reactive data
  - `persist?` ('localStorage' | 'sessionStorage'): Storage type for persistence

#### Returns

A tuple `[state, actions]` that can be used directly in components.

### `createComponentState(options)`

Creates a component-level context.

#### Parameters

- `options` (object):
  - `state` (() => T): Function returning initial state
  - `getters?` (object): Computed values based on state
  - `methods?` (object): Functions to modify state
  - `nowrapData?` (() => U): Function returning additional non-reactive data

#### Returns

An object with:
- `useContext()`: Hook to access state in child components
- `initial(initialState?)`: Creates provider with optional initial state
- `defaultValue`: Reference to the default state function

### `enableGlobalStore()`

Enables persistence features for global stores. Call once in your application root.

## Advanced Usage

### With Getters

```tsx
const store = defineGlobalStore('app', {
  state: () => ({
    users: [],
    selectedUserId: null,
  }),
  getters: {
    selectedUser() {
      return this.state.users.find(u => u.id === this.state.selectedUserId);
    },
    userCount() {
      return this.state.users.length;
    },
  },
  methods: {
    addUser(user) {
      this.actions.setState('users', (users) => [...users, user]);
    },
    selectUser(id) {
      this.actions.setState('selectedUserId', id);
    },
  },
});
```

### With Initial State (Component Context)

```tsx
const context = createComponentState({
  state: () => ({
    theme: 'light',
    language: 'en',
  }),
});

// Pass reactive initial state
function App() {
  const [theme] = createSignal('dark');
  
  const provider = context.initial({
    theme, // Reactive signal
    language: 'es', // Static value
  });
  
  return (
    <provider.Provider>
      <ThemeDisplay />
    </provider.Provider>
  );
}
```

### Cross-tab Synchronization

When using `persist` option, state automatically synchronizes across browser tabs:

```tsx
const settings = defineGlobalStore('settings', {
  state: () => ({
    theme: 'light',
    notifications: true,
  }),
  persist: 'localStorage', // Enables cross-tab sync
});

// Changes in one tab will automatically reflect in other tabs
```

## TypeScript Support

The library provides excellent TypeScript support with full type inference:

```tsx
const store = defineGlobalStore('typed', {
  state: () => ({
    count: 0,
    message: 'hello',
  }),
  getters: {
    formattedMessage() {
      // `this.state` is fully typed
      return this.state.message.toUpperCase();
    },
  },
  methods: {
    updateCount(newCount: number) {
      // `this.actions.setState` is fully typed
      this.actions.setState('count', newCount);
    },
  },
});

// State and actions are fully typed
const [state, actions] = store;
// state.count -> number
// state.message -> string  
// state.formattedMessage -> string
// actions.updateCount -> (newCount: number) => void
```

## Best Practices

1. **Use Global State Sparingly**: Reserve global state for truly global data (user auth, app settings, etc.)

2. **Prefer Component Context**: For feature-specific state, use component contexts for better encapsulation

3. **Keep State Flat**: Avoid deeply nested state structures for better performance

4. **Use Getters for Computed Values**: Instead of storing derived data, use getters

5. **Batch Updates**: The library automatically batches updates in methods

## Performance

- Built on SolidJS's fine-grained reactivity
- Only components using specific state properties re-render
- Automatic batching of state updates
- Minimal bundle size impact

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
