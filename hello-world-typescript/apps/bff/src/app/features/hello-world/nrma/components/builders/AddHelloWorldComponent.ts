import { HelloWorldContext } from '../../../HelloWorldContext';
import { NrmaHelloWorldResponse } from '../../NrmaHelloWorldResponse';

export function addHelloWorldComponent() {
  return (context: HelloWorldContext): HelloWorldContext => {
    const componentData: NrmaHelloWorldResponse = {
      message: 'Hello world from NRMA!'
    };
    return {
      ...context,
      response: {
        ...context.response,
        ...componentData,
      },
    };
  };
}
