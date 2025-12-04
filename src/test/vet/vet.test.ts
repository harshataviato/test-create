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

// This file is a TypeScript adaptation of VetTests.java.
// It tests the conceptual `Vet` model class using Jest.

import { expect } from '@jest/globals';

// --- Conceptual Model Definitions ---
// In a full TypeScript conversion, these would be proper classes or interfaces
// defined in your application's domain layer.

interface Specialty {
  id?: number;
  name: string;
}

class Vet {
  id?: number;
  firstName: string;
  lastName: string;
  specialties: Specialty[] = [];

  constructor(firstName: string, lastName: string, id?: number) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.id = id;
  }

  addSpecialty(specialty: Specialty): void {
    this.specialties.push(specialty);
  }
}
// --- End Conceptual Model Definitions ---

describe('VetTests', () => {

  // The original Java test `testSerialization` used `SerializationUtils.serialize/deserialize`,
  // which is Java-specific binary serialization.
  // In JavaScript/TypeScript, a common way to test object integrity after a round-trip
  // that mimics serialization (e.g., to JSON) is using `JSON.stringify` and `JSON.parse`.
  // This approach tests if an object can be losslessly converted to a common data format
  // and back, which is a practical analogue for "serialization" in web applications.
  it('should test JSON serialization/deserialization equivalent', () => {
    const vet = new Vet('Zaphod', 'Beeblebrox', 123);
    vet.addSpecialty({ id: 1, name: 'dentistry' });

    // Simulate serialization to JSON string
    const jsonString = JSON.stringify(vet);

    // Simulate deserialization from JSON string
    // Note: JSON.parse does not automatically restore class methods or complex types like 'Date'
    // For full class instance reconstruction, a custom reviver function or a library like 'class-transformer' is needed.
    const other: Vet = JSON.parse(jsonString);

    expect(other.firstName).toEqual(vet.firstName);
    expect(other.lastName).toEqual(vet.lastName);
    expect(other.id).toEqual(vet.id);
    // Deep comparison for arrays/objects
    expect(other.specialties).toEqual(vet.specialties);

    // Emphasize that `other` is a plain object here, not necessarily a `Vet` class instance.
    // If methods like `addSpecialty` were important, `other` would need to be re-instantiated
    // and data copied, or a custom deserializer used.
    expect(other instanceof Vet).toBeFalsy(); // `other` is a plain object from JSON.parse
  });

});
