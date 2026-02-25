import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface ValidationErrorItem {
  property: string;
  messages: string[];
}

export interface BadRequestValidationResponse {
  message: string;
  statusCode: number;
  error: string;
  errors: ValidationErrorItem[];
}

function formatValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationErrorItem[] {
  const result: ValidationErrorItem[] = [];

  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;

    if (err.constraints && Object.keys(err.constraints).length > 0) {
      result.push({
        property: path,
        messages: Object.values(err.constraints),
      });
    }

    if (err.children && err.children.length > 0) {
      result.push(...formatValidationErrors(err.children, path));
    }
  }

  return result;
}

/**
 * ValidationPipe that returns readable BadRequest payloads.
 * Response shape: { message, statusCode, error, errors: [{ property, messages }] }
 */
@Injectable()
export class HttpValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formatted = formatValidationErrors(errors);
        const response: BadRequestValidationResponse = {
          message: 'Validation failed',
          statusCode: 400,
          error: 'Bad Request',
          errors: formatted,
        };
        return new BadRequestException(response);
      },
    });
  }
}
