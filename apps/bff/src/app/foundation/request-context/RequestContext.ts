import { BrandService } from './BrandService';

export type RequestContext<TFeatureContext> = {
  traceId: string;
  brand: BrandService<TFeatureContext> | undefined;
  launchDarklyContext: Record<string, unknown>;
};
