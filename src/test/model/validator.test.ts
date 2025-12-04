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

// This file is a TypeScript adaptation of ValidatorTests.java.
// It uses `class-validator` to mimic Java's Bean Validation behavior.

import { expect } from '@jest/globals';
import { validate, ValidationError, IsNotEmpty, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// --- Conceptual Model Definition ---
// Mimics Java's Person class with validation annotations.
class Person {
  @IsNotEmpty({ message: 'must not be blank' })
  @IsString({ message: 'must be a string' })
  firstName: string = '';

  @IsNotEmpty({ message: 'must not be blank' })
  @IsString({ message: 'must be a string' })
  lastName: string = '';

  constructor(firstName: string = '', lastName: string = '') {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
// --- End Conceptual Model Definition ---

// `createValidator` is effectively replaced by `class-validator`'s `validate` function directly.
// `LocaleContextHolder.setLocale(Locale.ENGLISH)` is for i18n, `class-validator` supports this,
// but for this test, we directly check the English message.

describe('ValidatorTests', () => {

  it('should not validate when firstName empty', async () => {
    // Mimics creating a Person instance
    const person = new Person();
    person.firstName = ''; // Empty first name
    person.lastName = 'smith';

    // Mimics validator.validate(person)
    const errors: ValidationError[] = await validate(person);

    expect(errors).toHaveLength(1);
    const violation = errors[0];
    expect(violation.property).toBe('firstName'); // Corresponds to getPropertyPath()
    expect(violation.constraints).toBeDefined();
    // In `class-validator`, messages are in `constraints` object.
    expect(violation.constraints?.isNotEmpty).toBe('must not be blank');
  });

  it('should validate when both first and last names are present', async () => {
    const person = new Person('John', 'Doe');
    const errors: ValidationError[] = await validate(person);
    expect(errors).toHaveLength(0);
  });

  it('should not validate when lastName empty', async () => {
    const person = new Person('John', ''); // Empty last name
    const errors: ValidationError[] = await validate(person);

    expect(errors).toHaveLength(1);
    const violation = errors[0];
    expect(violation.property).toBe('lastName');
    expect(violation.constraints?.isNotEmpty).toBe('must not be blank');
  });

  it('should handle multiple violations', async () => {
    const person = new Person('', ''); // Both empty
    const errors: ValidationError[] = await validate(person);

    expect(errors).toHaveLength(2);
    expect(errors.some(e => e.property === 'firstName' && e.constraints?.isNotEmpty === 'must not be blank')).toBe(true);
    expect(errors.some(e => e.property === 'lastName' && e.constraints?.isNotEmpty === 'must not be blank')).toBe(true);
  });
});
