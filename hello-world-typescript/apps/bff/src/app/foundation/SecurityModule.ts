import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import * as Joi from 'joi';

const publicEndPoints = [
  { path: '/hello', method: RequestMethod.GET },
];

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        // Mock security middleware logic
        const isPublic = publicEndPoints.some(endpoint => {
          return req.path === endpoint.path &&
                 (endpoint.method === RequestMethod.ALL || req.method === RequestMethod[endpoint.method].toUpperCase());
        });

        if (isPublic) {
          return next();
        }

        // For non-public endpoints, a real middleware would check auth headers, etc.
        // For this example, we'll allow all if not explicitly protected.
        // In a real scenario, this would throw an UnauthorizedException.
        next();
      })
      .forRoutes('*');
  }
}

export const envValidationSchema = {
  FEATURE_ENABLED: Joi.boolean().optional().default(false),
  API_ENDPOINT: Joi.string().optional().default('default-api-endpoint'), // Made optional for this example
};
