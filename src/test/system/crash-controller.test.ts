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

// This file is a TypeScript adaptation of CrashControllerTests.java.
// It tests a conceptual `CrashController` class using Jest.

import { expect } from '@jest/globals';
import express, { Application, Router, Request, Response } from 'express';
import request from 'supertest';

// --- Conceptual CrashController ---
// Mimics the Java CrashController which throws an exception.
class CrashController {
  triggerException(): never {
    throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
  }

  // An Express router to expose the crash endpoint
  router(): Router {
    const expressRouter = express.Router();
    expressRouter.get('/oups', (req: Request, res: Response) => {
      this.triggerException(); // This will throw an error
    });
    return expressRouter;
  }
}
// --- End Conceptual CrashController ---

describe('CrashControllerTests', () => {
  const testee = new CrashController();
  let app: Application;

  beforeAll(() => {
    app = express();
    // Use the controller's router.
    // In a real Express app, you might have global error handling middleware
    // that would catch this and render an error page or JSON response.
    // For this test, we allow the error to bubble up to supertest.
    app.use('/', testee.router());

    // Basic error handling middleware for Express to ensure errors are caught and handled,
    // which supertest can then verify.
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        // console.error("Caught error in Express middleware:", err.message); // For debugging
        res.status(500).send({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    });
  });

  it('should test triggerException', () => {
    // Mimics assertThatExceptionOfType(RuntimeException.class).isThrownBy(() -> testee.triggerException())
    expect(() => testee.triggerException())
      .toThrow('Expected: controller used to showcase what happens when an exception is thrown');
  });

  it('should trigger an exception via HTTP endpoint and return 500', async () => {
    // Test the HTTP endpoint that triggers the exception.
    // Supertest will catch the error handled by the Express middleware.
    const response = await request(app).get('/oups');

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toContain('Expected: controller used to showcase what happens when an exception is thrown');
  });
});
