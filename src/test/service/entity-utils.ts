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

// This file is a TypeScript adaptation of EntityUtils.java.
// It provides utility methods for handling entities, especially finding by ID.

import { instanceToPlain, plainToInstance } from 'class-transformer'; // For simulating class type checks if needed

// --- Conceptual Model Definitions ---
// Mimics Java's BaseEntity interface
export interface BaseEntity {
  id?: number; // `id` can be null for new entities
  // Other common properties or methods can go here
}

// Custom error for when an entity is not found, mimicking ObjectRetrievalFailureException
export class EntityNotFoundException extends Error {
  constructor(entityClass: new (...args: any[]) => BaseEntity, entityId: number) {
    super(`Entity of type ${entityClass.name} with id ${entityId} not found.`);
    this.name = 'EntityNotFoundException';
  }
}
// --- End Conceptual Model Definitions ---

/**
 * Utility methods for handling entities.
 *
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Michael Isvy (TypeScript adaptation)
 */
export abstract class EntityUtils {

  /**
   * Look up the entity of the given class with the given id in the given collection.
   * @param entities The collection to search.
   * @param EntityClass The constructor of the entity class to look up (used for runtime type checking).
   * @param entityId The entity id to look up.
   * @returns The found entity.
   * @throws EntityNotFoundException if the entity was not found.
   */
  public static getById<T extends BaseEntity>(
    entities: Collection<T>,
    EntityClass: new (...args: any[]) => T, // Using a constructor type for runtime class check
    entityId: number
  ): T {
    for (const entity of entities) {
      // Check if entity is an instance of EntityClass (runtime type check)
      // and if its ID matches.
      // `instanceof` directly works for classes. If `entities` could contain plain objects,
      // you might need a more robust type guard or a property-based check.
      // For this adaptation, assuming `entity` objects might not always be direct class instances
      // (e.g., from JSON), we also add a check based on constructor name if available or a simple duck-typing.
      // However, the most robust check for `isInstance(entity)` in TypeScript usually involves `instanceof`.
      // The original Java method does `entityClass.isInstance(entity)`.
      // If `entities` are guaranteed to be of type `T`, the `instanceof` check is primarily for runtime safety
      // against heterogeneous collections, which TS usually prevents at compile time.
      const isInstance = (entity instanceof EntityClass) || (entity.constructor && entity.constructor.name === EntityClass.name);

      if (entity.id !== undefined && entity.id === entityId && isInstance) {
        return entity;
      }
    }
    throw new EntityNotFoundException(EntityClass, entityId);
  }
}

// Alias for Collection to be consistent with Java's Collection interface
type Collection<T> = T[] | Set<T>;
