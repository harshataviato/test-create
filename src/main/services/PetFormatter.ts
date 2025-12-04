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

// This file is a conceptual TypeScript adaptation of PetTypeFormatter.java.
// It demonstrates how a formatter for PetType objects (converting between string and object)
// would be implemented in TypeScript.

import { PetType } from '../types/models'; // Assuming PetType model is defined
import { PetTypeRepository } from './PetService'; // Assuming PetTypeRepository exists

/**
 * Conceptual `Locale` class for demonstration purposes, mimicking Java's `java.util.Locale`.
 * In a real application, you might use a more robust i18n library's locale object.
 */
export class Locale {
  constructor(public language: string) {}
}

/**
 * Instructs on how to parse and print elements of type 'PetType'.
 * Mimics `org.springframework.samples.petclinic.owner.PetTypeFormatter`.
 *
 * @author Mark Fisher
 * @author Juergen Hoeller
 * @author Michael Isvy
 * @author Michael Isvy (TypeScript adaptation)
 */
export class PetTypeFormatter {
  private types: PetTypeRepository;

  constructor(types: PetTypeRepository) {
    this.types = types;
  }

  /**
   * Prints a `PetType` object to its string representation.
   * Mimics `public String print(PetType petType, Locale locale)`.
   * @param petType The `PetType` object.
   * @param locale The locale (optional in TS, for consistency).
   * @returns The string representation of the pet type's name.
   */
  print(petType: PetType, locale: Locale = new Locale('en')): string {
    // Mimics `String name = petType.getName(); return (name != null) ? name : "<null>";`
    return petType.name !== null && petType.name !== undefined ? petType.name : '<null>';
  }

  /**
   * Parses a string representation into a `PetType` object.
   * Mimics `public PetType parse(String text, Locale locale) throws ParseException`.
   * @param text The string to parse.
   * @param locale The locale (optional in TS).
   * @returns The corresponding `PetType` object.
   * @throws Error (mimicking ParseException) if the type is not found.
   */
  async parse(text: string, locale: Locale = new Locale('en')): Promise<PetType> {
    // Mimics `Collection<PetType> findPetTypes = this.types.findPetTypes();`
    const findPetTypes = await this.types.findPetTypes();

    // Mimics iteration and `Objects.equals(type.getName(), text)`
    for (const type of findPetTypes) {
      if (type.name === text) {
        return type;
      }
    }
    // Mimics `throw new ParseException(...)`
    throw new Error(`Parse Exception: type not found: ${text}`);
  }
}

// Export an instance of the formatter.
// In a Node.js/Express app, this formatter might be used by middleware
// or directly in controller logic if custom parsing/validation is needed.
import { petTypeRepository } from './PetService';
export const petTypeFormatter = new PetTypeFormatter(petTypeRepository);
