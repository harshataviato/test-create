import { HelloWorldContext } from '../../HelloWorldContext';
import { NrmaHelloWorldResponse } from '../NrmaHelloWorldResponse';

export function addSampleComponent() {
  return (context: HelloWorldContext): HelloWorldContext => {
    // const componentData = build{ComponentName}(context);
    return {
      ...context,
      response: {
        ...context.response as NrmaHelloWorldResponse,
      }
    };
  };
}
