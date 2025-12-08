import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

/**
 * Custom validation pipe to handle data validation using `class-validator` and `class-transformer`.
 * It automatically transforms incoming payload to DTO instances and validates them.
 * This pipe uses `nestjs-i18n` for localized validation messages.
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Transforms and validates the incoming value.
   * @param value The value to be transformed and validated.
   * @param metadata Metadata about the argument being transformed.
   * @returns The transformed and validated value.
   * @throws BadRequestException if validation fails.
   */
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Convert plain JavaScript object to an instance of the DTO class
    const object = plainToInstance(metatype, value);
    // Validate the DTO instance
    const errors = await validate(object);

    if (errors.length > 0) {
      // If there are validation errors, format them and throw a BadRequestException
      const formattedErrors = await Promise.all(
        errors.map(async (error) => {
          const constraints = Object.values(error.constraints || {});
          // Translate each constraint message
          return Promise.all(
            constraints.map(async (constraint) => {
              try {
                return await this.i18n.translate(`messages.${constraint}`, {
                  args: { property: error.property, value: error.value }, // Optional: pass arguments for dynamic messages
                });
              } catch (e) {
                return constraint; // Fallback to raw message if translation fails
              }
            }),
          );
        }),
      );
      // Throw a BadRequestException with the formatted error messages
      throw new BadRequestException(formattedErrors.flat());
    }
    return value;
  }

  /**
   * Determines if the given metatype should be validated.
   * @param metatype The metatype of the argument.
   * @returns `true` if the metatype is a class (not a primitive or array), `false` otherwise.
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
