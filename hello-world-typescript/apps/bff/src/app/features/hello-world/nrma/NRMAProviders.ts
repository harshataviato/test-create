import { HelloWorldForNRMAUseCase } from './HelloWorldForNRMAUseCase';
import { SampleDownstreamIntegration } from './downstreams/SampleDownstreamIntegration';

export const NRMAProviders = [
  HelloWorldForNRMAUseCase,
  SampleDownstreamIntegration
];
