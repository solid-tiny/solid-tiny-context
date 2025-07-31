import { useGlobalState } from '../..';
import { Button } from '../../components/Button';

export default function Index() {
  const [state, actions] = useGlobalState();
  return (
    <div>
      <h1>Global State Example</h1>
      <p>Current Count: {state.count}</p>
      <p>Current Message: {state.message}</p>
      <Button onClick={() => actions.increment()}>Increment</Button>
      <Button onClick={() => actions.hello()}>Hello</Button>
    </div>
  );
}
