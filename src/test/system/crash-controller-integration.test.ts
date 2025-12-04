/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a TypeScript adaptation of CrashControllerIntegrationTests.java.
// It integrates with a conceptual Express.js application and uses Supertest
// to verify error responses in JSON and HTML formats.

import request from 'supertest';
import express, { Application, Request, Response, NextFunction, Router } from 'express';
import { expect } from '@jest/globals';

// --- Conceptual CrashController (from Batch 5) ---
class CrashController {
  triggerException(): never {
    throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
  }

  router(): Router {
    const expressRouter = express.Router();
    expressRouter.get('/oups', (req: Request, res: Response) => {
      this.triggerException();
    });
    return expressRouter;
  }
}
// --- End Conceptual CrashController ---

describe('CrashControllerIntegrationTests', () => {
  let app: Application;
  let server: any; // The HTTP server instance
  let port: number;

  beforeAll((done) => {
    app = express();
    const crashController = new CrashController();

    // Global error handler, mimicking Spring Boot's error handling.
    // `spring.web.error.include-message=ALWAYS` means error message is always included.
    app.use('/', crashController.router());
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        // Simplified error response for JSON
        if (req.accepts('json')) {
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                status: 500,
                error: 'Internal Server Error', // General error type
                message: err.message, // Explicitly include message
                path: req.originalUrl,
            });
        }
        // Simplified error response for HTML
        res.status(500).type('html').send(`
            <body>
                <h2>Something happened...</h2>
                <p>${err.message}</p>
            </body>
        `);
    });

    // Start server on a random port
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`[Test Setup] Mock Crash app listening on http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(() => {
        console.log('[Test Teardown] Mock Crash app server closed.');
        done();
      });
    } else {
      done();
    }
  });

  it('should test triggerExceptionJson and return 500 with JSON details', async () => {
    const response = await request(`http://localhost:${port}`)
      .get('/oups')
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(500);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('status', 500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
    expect(response.body).toHaveProperty('message', 'Expected: controller used to showcase what happens when an exception is thrown');
    expect(response.body).toHaveProperty('path', '/oups');
  });

  it('should test triggerExceptionHtml and return 500 with HTML content', async () => {
    const response = await request(`http://localhost:${port}`)
      .get('/oups')
      .set('Accept', 'text/html');

    expect(response.statusCode).toBe(500);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('<body>');
    expect(response.text).toContain('<h2>Something happened...</h2>');
    expect(response.text).toContain('<p>Expected: controller used to showcase what happens when an exception is thrown</p>');
    // Verify it's not a generic whitelabel error page
    expect(response.text).not.toContain('Whitelabel Error Page');
    expect(response.text).not.toContain('This application has no explicit mapping for');
  });
});
