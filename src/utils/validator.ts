/**
 * @module utils/validator
 * @description Provides Zod schemas for validating input data for various entities.
 * These schemas replace Java's JSR-303/380 annotations (e.g., @NotBlank, @Pattern).
 */

import { z } from 'zod';
import { Owner } from '@models/owner';
import { PetTypeRepository } from '@repositories/petTypeRepository';

// Initialize PetTypeRepository for dynamic validation
const petTypeRepository = new PetTypeRepository();

/**
 * @constant {ZodSchema<Owner>} ownerSchema
 * @description Zod schema for validating Owner input.
 * Ensures all required fields are present and conform to specific patterns/types.
 */
export const ownerSchema = z.object({
  firstName: z.string().min(1, { message: 'First Name is required' }).trim(),
  lastName: z.string().min(1, { message: 'Last Name is required' }).trim(),
  address: z.string().min(1, { message: 'Address is required' }).trim(),
  city: z.string().min(1, { message: 'City is required' }).trim(),
  telephone: z.string()
    .min(1, { message: 'Telephone is required' })
    .regex(/^\d{10}$/, { message: 'Telephone must be a 10-digit number' }),
});

/**
 * @function petSchema
 * @description Creates a Zod schema for validating Pet input,
 * including dynamic checks for duplicate pet names within an owner.
 * @param {Owner} ownerContext - The owner to which the pet belongs, used for duplicate name checks.
 * @returns {ZodSchema<Pet>} A Zod schema for validating Pet input.
 */
export const petSchema = (ownerContext: Owner) => z.object({
  id: z.number().optional(), // ID is optional for new pets, required for updates
  name: z.string()
    .min(1, { message: 'Name is required' })
    .trim()
    .refine(name => {
      // Check for duplicate name among the owner's pets
      // This is a business rule, not just a type validation
      const existingPet = ownerContext.pets.find(p => p.name?.toLowerCase() === name.toLowerCase());
      // If editing an existing pet, allow its own name
      return !existingPet || (existingPet.id === (z.object({ id: z.number() }).safeParse(ownerContext).success ? ownerContext.id : undefined) && existingPet.name?.toLowerCase() === name.toLowerCase());
    }, { message: 'already exists' }),
  birthDate: z.string()
    .min(1, { message: 'Birth Date is required' })
    .transform((str) => new Date(str)) // Transform to Date object
    .refine((date) => !isNaN(date.getTime()), { message: 'invalid date' })
    .refine((date) => date <= new Date(), { message: 'Birth date cannot be in the future' }),
  type: z.string()
    .min(1, { message: 'Type is required' })
    .refine(type => petTypeRepository.findByName(type) !== undefined, { message: 'Type not found' }), // Check if PetType exists
  ownerId: z.number() // Assuming ownerId is always present in context or request body for pet creation/update
});

/**
 * @constant {ZodSchema<Visit>} visitSchema
 * @description Zod schema for validating Visit input.
 * Ensures all required fields are present and dates are valid.
 */
export const visitSchema = z.object({
  id: z.number().optional(),
  date: z.string()
    .min(1, { message: 'Date is required' })
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), { message: 'invalid date' }),
  description: z.string().min(1, { message: 'Description is required' }).trim(),
  petId: z.number(), // Assuming petId is always present in context or request body
});
