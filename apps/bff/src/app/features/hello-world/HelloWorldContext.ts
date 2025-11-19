import { RequestContext } from '../../foundation/request-context/RequestContext';
import { FeatureFlag } from '../../foundation/feature-flag/FeatureFlag';
import { NrmaHelloWorldResponse } from './nrma/NrmaHelloWorldResponse';

export type RequestParams = {};
export type RequestBody = {};
export type RequestQuery = {};

export type HelloWorldRequest = {
  params: RequestParams;
  body?: RequestBody;
  query?: RequestQuery;
};

export type HelloWorldContext = {
  requestContext: RequestContext<HelloWorldContext>;
  request: HelloWorldRequest;
  response?: HelloWorldResponse;
  featureFlag?: FeatureFlag;
};

export type HelloWorldResponse = NrmaHelloWorldResponse;
