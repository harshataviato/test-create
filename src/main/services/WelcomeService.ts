/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a conceptual TypeScript adaptation of WelcomeController.java.
// It defines a simple service for the welcome page. In a real Node.js app,
// a simple controller might not need a dedicated service for such a basic task.

/**
 * Conceptual service for the welcome page.
 * Mimics the minimal logic of `WelcomeController.java`.
 */
export class WelcomeService {
  constructor() {
    // Potentially load initial data or perform setup if needed.
  }

  /**
   * Returns a greeting message.
   * @returns A simple welcome message.
   */
  getWelcomeMessage(): string {
    return 'Welcome to the PetClinic!';
  }
}

export const welcomeService = new WelcomeService();
