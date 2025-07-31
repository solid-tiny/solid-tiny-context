import { createComponentState } from '../../create-component-state';
import { Button } from '../components/Button';

const context = createComponentState({
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount() {
      return this.state.count * 2;
    },
  },
  methods: {
    incrementCount() {
      this.actions.setState('count', (prev) => prev + 1);
    },
  },
});

export default function Index() {
  const Context = context.initial({
    count: 1,
  });

  const [state, actions] = Context.value;

  return (
    <Context.Provider>
      <div>
        <h1>Count: {state.count}</h1>
        <h2>Double Count: {state.doubleCount}</h2>
        <Button
          onClick={() => {
            actions.incrementCount();
          }}
        >
          Increment
        </Button>
      </div>
    </Context.Provider>
  );
}
