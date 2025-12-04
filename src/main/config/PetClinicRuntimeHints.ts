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

// This file is a conceptual TypeScript equivalent of PetClinicRuntimeHints.java.
// The original Java class is specific to Spring Native's Ahead-Of-Time (AOT) compilation,
// where it registers runtime hints for reflection, resources, and serialization to optimize
// the native image build process.
//
// This concept does not have a direct 1:1 functional equivalent in a standard Node.js/TypeScript
// environment, as Node.js typically uses a Just-In-Time (JIT) compiler and a different
// mechanism for resource management and serialization.
//
// However, if a Node.js/TypeScript application were to be compiled into a native executable
// (e.g., using `pkg` or by leveraging Bun's upcoming native compilation features or a custom
// V8 snapshot with specific serialization/deserialization needs), analogous configuration
// might be required. This would likely involve:
//
// - **Resource Bundling**: Specifying which static resources (like SQL scripts, i18n message bundles)
//   should be included in the final executable or deployment package. This is often handled
//   by bundlers (Webpack, Rollup, Parcel, esbuild) or asset management configurations.
//   (e.g., `webpack.config.js` or directives for `pkg`).
//   - `hints.resources().registerPattern("db/*")` -> `copy( './src/main/resources/db', './dist/db' )` in a build script.
//   - `hints.resources().registerPattern("messages/*")` -> `copy( './src/main/resources/messages', './dist/messages' )`.
//
// - **Serialization Hints**: If a custom binary serialization format or complex object (de)serialization
//   was used (beyond standard JSON), explicit configuration might be needed for a native compiler
//   to retain type metadata or specific constructors. For typical Node.js applications that
//   rely heavily on JSON for data interchange, this is rarely an issue. If TypeORM/Prisma
//   entities were being serialized/deserialized in a non-standard way that required reflection,
//   a native compiler might need hints.
//   - `hints.serialization().registerType(BaseEntity.class)` -> N/A for standard JSON, potentially
//     relevant for advanced binary serialization libraries or custom native compilation.
//
// **Conceptual TypeScript Implementation (if such hints were ever needed for a native Node.js build):**
// This would be a configuration file or part of a build script.

import * as path from 'path';
import * as fs from 'fs/promises';

// Define the types that might need "hints" for serialization
// (assuming these are conceptual classes/interfaces from your TypeScript domain models)
import { BaseEntity, Person, Vet } from '../../types/models'; // Adjust path to your actual model definitions

/**
 * Conceptual Runtime Hints Registrar for a native Node.js/TypeScript application.
 *
 * This class illustrates how one might declaratively specify resources and serialization
 * requirements if building a native executable for a Node.js/TypeScript application,
 * similar to Spring Native's runtime hints.
 */
export class PetClinicRuntimeHints {

  /**
   * Registers conceptual runtime hints.
   * In a real Node.js native compilation scenario, this would likely translate
   * to configuration for a tool like `pkg` (for bundling resources) or
   * explicit directives for a V8 snapshot/native code compilation tool.
   *
   * @param config A conceptual configuration object that collects hints.
   * @param typeLoader A conceptual mechanism to load types for analysis.
   */
  public registerHints(config: { resources: string[], serializableTypes: string[] }, typeLoader: any): void {
    console.log('[PetClinicRuntimeHints] Registering conceptual runtime hints...');

    // Register resource patterns for bundling/inclusion
    config.resources.push('db/*'); // e.g., SQL scripts
    config.resources.push('messages/*'); // e.g., i18n message bundles
    config.resources.push('mysql-default-conf'); // Any specific configuration files

    // Register types that might need special serialization handling
    // (e.g., if using a custom binary serialization or complex reflection, otherwise JSON is default)
    config.serializableTypes.push(BaseEntity.name);
    config.serializableTypes.push(Person.name);
    config.serializableTypes.push(Vet.name);

    console.log('[PetClinicRuntimeHints] Registered resources:', config.resources);
    console.log('[PetClinicRuntimeHints] Registered serializable types:', config.serializableTypes);

    // In a real scenario, `typeLoader` might be used to inspect these types
    // and generate more specific native code configuration.
  }

  // Example of a build script utility that might use these hints:
  public static async applyBuildHints(outputDir: string = 'dist'): Promise<void> {
    const hintsConfig = {
      resources: [],
      serializableTypes: [],
    };
    const runtimeHints = new PetClinicRuntimeHints();
    runtimeHints.registerHints(hintsConfig, {}); // Pass a dummy typeLoader for this conceptual example

    console.log('\n[Build Step] Applying runtime hints:');
    // Simulate copying resources
    for (const pattern of hintsConfig.resources) {
      // Very simplified glob-like copy. In real builds, use a library like `glob` and `fs-extra`.
      const sourceDir = path.join(process.cwd(), 'src', 'main', 'resources');
      const targetDir = path.join(process.cwd(), outputDir, 'resources'); // Adjust target path
      const resourcePath = pattern.replace('/*', ''); // Simple handling for 'db/*' -> 'db'
      const fullSourcePath = path.join(sourceDir, resourcePath);
      const fullTargetPath = path.join(targetDir, resourcePath);

      if (await fs.stat(fullSourcePath).catch(() => null)) { // Check if source exists
          console.log(`- Copying resource: ${fullSourcePath} to ${fullTargetPath}`);
          await fs.mkdir(fullTargetPath, { recursive: true });
          // This is a simple copy. A real scenario needs to handle glob patterns (`*`)
          // and recursive copying of directories.
          if ((await fs.stat(fullSourcePath)).isDirectory()) {
              // Recursive copy for directories
              const files = await fs.readdir(fullSourcePath);
              for (const file of files) {
                  await fs.copyFile(path.join(fullSourcePath, file), path.join(fullTargetPath, file));
              }
          } else {
              await fs.copyFile(fullSourcePath, fullTargetPath);
          }
      }
    }
    console.log('[Build Step] Resource bundling based on hints completed.');

    // For serializableTypes, the action depends entirely on the native compilation toolchain.
    // e.g., `console.log('Ensure native compiler includes reflection metadata for:', hintsConfig.serializableTypes);`
  }
}

// Example of how `applyBuildHints` might be called in a `postbuild` script:
// (async () => {
//   await PetClinicRuntimeHints.applyBuildHints();
// })();
