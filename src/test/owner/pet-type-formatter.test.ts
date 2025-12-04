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

// This file is a TypeScript adaptation of PetTypeFormatterTests.java.
// It tests a conceptual `PetTypeFormatter` class using Jest.
// It replaces Spring's `Formatter` interface with a plain TypeScript class.

import { expect, jest } from '@jest/globals';

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

// --- Conceptual Repository Interface ---
interface PetTypeRepository {
  findPetTypes(): Promise<PetType[]>;
}
// --- End Conceptual Definitions ---

// --- Conceptual PetTypeFormatter ---
// Mimics Spring's Formatter<PetType> interface
class PetTypeFormatter {
  private types: PetTypeRepository;

  constructor(types: PetTypeRepository) {
    this.types = types;
  }

  // Mimics print(T object, Locale locale)
  print(petType: PetType, locale: Locale = new Locale('en')): string {
    return petType.name;
  }

  // Mimics parse(String text, Locale locale) throws ParseException
  async parse(text: string, locale: Locale = new Locale('en')): Promise<PetType> {
    const allPetTypes = await this.types.findPetTypes();
    const foundType = allPetTypes.find(type => type.name === text);
    if (foundType) {
      return foundType;
    }
    // Mimics ParseException
    throw new Error(`Parse Exception: type not found '${text}'`);
  }
}
// --- End Conceptual PetTypeFormatter ---

// A simple mock for `Locale` since JavaScript `Intl` API is usually global
class Locale {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}


describe('PetTypeFormatterTests', () => {
  let mockPetTypeRepository: jest.Mocked<PetTypeRepository>;
  let petTypeFormatter: PetTypeFormatter;

  const makePetTypes = (): PetType[] => {
    return [
      new PetType('Dog'),
      new PetType('Bird'),
      // Java's anonymous class `{ setName("Dog"); }` is replaced by direct constructor.
    ];
  };

  beforeEach(() => {
    // Mimic @Mock
    mockPetTypeRepository = {
      findPetTypes: jest.fn<() => Promise<PetType[]>>(),
    };
    petTypeFormatter = new PetTypeFormatter(mockPetTypeRepository);
  });

  // @DisabledInNativeImage is Java-specific and omitted in TypeScript.

  it('should test print', () => {
    const petType = new PetType('Hamster');
    const petTypeName = petTypeFormatter.print(petType, new Locale('en'));
    expect(petTypeName).toBe('Hamster');
  });

  it('should parse an existing pet type', async () => {
    mockPetTypeRepository.findPetTypes.mockResolvedValue(makePetTypes());
    const petType = await petTypeFormatter.parse('Bird', new Locale('en'));
    expect(petType.name).toBe('Bird');
  });

  it('should throw an error for a non-existent pet type', async () => {
    mockPetTypeRepository.findPetTypes.mockResolvedValue(makePetTypes());
    // Mimics Assertions.assertThrows(ParseException.class, () -> { ... });
    await expect(petTypeFormatter.parse('Fish', new Locale('en'))).rejects.toThrow('Parse Exception: type not found \'Fish\'');
  });
});
