import type { RawSignal, ValidationResult } from '@/types/index';
import { validateSignals, PipelineValidationError } from '@/lib/schemas/trading-signal';

export function validateRawSignals(data: unknown): ValidationResult {
  const valid: RawSignal[] = [];
  const invalid: ValidationResult['invalid'] = [];
  
  if (!Array.isArray(data)) {
    throw new Error('Expected array of signals');
  }
  
  for (let i = 0; i < data.length; i++) {
    try {
      const validated = validateSignals([data[i]])[0];
      valid.push(validated);
    } catch (error) {
      if (error instanceof PipelineValidationError) {
        invalid.push({
          record: data[i],
          errors: error.issues.map(issue => 
            `${issue.path.join('.')}: ${issue.message}`
          ),
        });
      }
    }
  }
  
  return { valid, invalid };
}

export function validateOrThrow(data: unknown): RawSignal[] {
  const result = validateRawSignals(data);
  
  if (result.invalid.length > 0) {
    const errorMessages = result.invalid
      .slice(0, 5)
      .map((inv, idx) => `Record ${idx + 1}: ${inv.errors.join(', ')}`)
      .join('\n');
    
    throw new Error(
      `Validation failed for ${result.invalid.length} records:\n${errorMessages}`
    );
  }
  
  return result.valid;
}

export function isSignalValid(signal: unknown): signal is RawSignal {
  try {
    validateSignals([signal]);
    return true;
  } catch {
    return false;
  }
}