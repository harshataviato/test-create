/*
 * Copyright 2012-2024 the original author or authors.
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

// This file is a TypeScript adaptation of PetValidatorTests.java.
// It tests the conceptual `Pet` validation logic using Jest.
// It replaces Spring's `Validator` interface and `Errors` context
// with a plain TypeScript function returning an array of validation errors.

import { expect } from '@jest/globals';
import { LocalDate } from '@js-joda/core'; // Replacement for Java's LocalDate

// --- Conceptual Model Definitions (from previous batches) ---

interface NamedEntity {
  id?: number;
  name: string;
}

class PetType implements NamedEntity {
  id?: number;
  name: string;

  constructor(name: string, id?: number) {
    this.name = name;
    this.id = id;
  }
}

class Pet implements NamedEntity {
  id?: number;
  name: string = '';
  birthDate?: string;
  type?: PetType;
  ownerId?: number;
  visits: any[] = []; // Not relevant for this test

  constructor(name: string = '') {
    this.name = name;
  }
}
// --- End Conceptual Model Definitions ---

// --- Conceptual PetValidator ---
interface ValidationError {
  field: string;
  code: string;
  message?: string;
}

// Mimics Spring's PetValidator logic
class PetValidator {
  validate(pet: Pet): ValidationError[] {
    const errors: ValidationError[] = [];

    // Name validation
    if (!pet.name || pet.name.trim() === '') {
      errors.push({ field: 'name', code: 'required', message: 'Name is required' });
    }

    // Type validation
    if (!pet.type) {
      errors.push({ field: 'type', code: 'required', message: 'Pet type is required' });
    } else if (!pet.type.name || pet.type.name.trim() === '') {
      errors.push({ field: 'type', code: 'required', message: 'Pet type name is required' });
    }

    // BirthDate validation
    if (!pet.birthDate) {
      errors.push({ field: 'birthDate', code: 'required', message: 'Birth date is required' });
    } else {
      try {
        const parsedDate = LocalDate.parse(pet.birthDate);
        if (parsedDate.isAfter(LocalDate.now())) {
            errors.push({ field: 'birthDate', code: 'futureDate', message: 'Birth date cannot be in the future' });
        }
      } catch (e) {
        errors.push({ field: 'birthDate', code: 'invalidFormat', message: 'Invalid birth date format' });
      }
    }

    return errors;
  }
}
// --- End Conceptual PetValidator ---

describe('PetValidatorTests', () => {
  let petValidator: PetValidator;
  let pet: Pet;
  let petType: PetType;

  const petName = "Buddy";
  const petTypeName = "Dog";
  const petBirthDate = LocalDate.of(1990, 1, 1).toString(); // Using string representation

  beforeEach(() => {
    petValidator = new PetValidator();
    pet = new Pet();
    petType = new PetType(petTypeName); // Initialize with a name
  });

  // Helper to check for field errors
  const hasFieldError = (field: string, errors: ValidationError[]) => {
    return errors.some(err => err.field === field);
  };

  it('should test validate (success)', () => {
    pet.name = petName;
    pet.type = petType;
    pet.birthDate = petBirthDate;

    const errors = petValidator.validate(pet);
    expect(errors).toHaveLength(0); // No errors
  });

  // Mimic JUnit 5's @Nested classes
  describe('ValidateHasErrors', () => {

    it('should test validateWithInvalidPetName', () => {
      pet.name = ""; // Invalid name
      pet.type = petType;
      pet.birthDate = petBirthDate;

      const errors = petValidator.validate(pet);
      expect(hasFieldError('name', errors)).toBe(true);
      expect(errors.find(e => e.field === 'name')?.code).toBe('required');
      expect(errors).toHaveLength(1); // Only name error
    });

    it('should test validateWithInvalidPetType', () => {
      pet.name = petName;
      pet.type = undefined; // Invalid type (null in Java)
      pet.birthDate = petBirthDate;

      const errors = petValidator.validate(pet);
      expect(hasFieldError('type', errors)).toBe(true);
      expect(errors.find(e => e.field === 'type')?.code).toBe('required');
      expect(errors).toHaveLength(1);
    });

    it('should test validateWithInvalidBirthDate', () => {
      pet.name = petName;
      pet.type = petType;
      pet.birthDate = undefined; // Invalid birthDate (null in Java)

      const errors = petValidator.validate(pet);
      expect(hasFieldError('birthDate', errors)).toBe(true);
      expect(errors.find(e => e.field === 'birthDate')?.code).toBe('required');
      expect(errors).toHaveLength(1);
    });

    it('should test validateWithFutureBirthDate', () => {
        pet.name = petName;
        pet.type = petType;
        pet.birthDate = LocalDate.now().plusDays(1).toString(); // Future date

        const errors = petValidator.validate(pet);
        expect(hasFieldError('birthDate', errors)).toBe(true);
        expect(errors.find(e => e.field === 'birthDate')?.code).toBe('futureDate');
        expect(errors).toHaveLength(1);
    });

    it('should test validateWithInvalidBirthDateFormat', () => {
        pet.name = petName;
        pet.type = petType;
        pet.birthDate = "2015/02/12"; // Invalid format for LocalDate.parse

        const errors = petValidator.validate(pet);
        expect(hasFieldError('birthDate', errors)).toBe(true);
        expect(errors.find(e => e.field === 'birthDate')?.code).toBe('invalidFormat');
        expect(errors).toHaveLength(1);
    });

  });
});
