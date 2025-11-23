/**
 * Template Engine - Variable replacement and conditional generation
 * Sprint 5.2 - Template Processing
 */

import type { TemplateVariable, TemplateConfig } from '../metadata/types';

export class TemplateEngine {
  private variables: Record<string, any> = {};

  constructor(config: TemplateConfig) {
    this.variables = config.variables;
    this.variables.projectName = config.projectName;
  }

  /**
   * Replace template variables in content
   * Supports: {{variableName}}, {{variableName | uppercase}}, {{variableName | lowercase}}
   */
  processTemplate(content: string): string {
    let processed = content;

    // Replace {{variableName}} with values
    processed = processed.replace(/\{\{\s*([^}|]+?)\s*\}\}/g, (match, varName) => {
      const value = this.getVariable(varName.trim());
      return value !== undefined ? String(value) : match;
    });

    // Replace {{variableName | filter}} with filtered values
    processed = processed.replace(/\{\{\s*([^}|]+?)\s*\|\s*([^}]+?)\s*\}\}/g, (match, varName, filter) => {
      const value = this.getVariable(varName.trim());
      if (value === undefined) return match;
      return this.applyFilter(String(value), filter.trim());
    });

    return processed;
  }

  /**
   * Evaluate conditional expression
   * Example: "{{auth}} === true && {{database}} === 'mongodb'"
   */
  evaluateCondition(condition: string): boolean {
    try {
      // Replace variables in condition
      let expr = condition;
      Object.keys(this.variables).forEach(key => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        const value = this.variables[key];
        const replacement = typeof value === 'string' ? `"${value}"` : String(value);
        expr = expr.replace(regex, replacement);
      });

      // Safe evaluation
      return new Function(`return ${expr}`)();
    } catch (e) {
      console.warn(`Failed to evaluate condition: ${condition}`, e);
      return false;
    }
  }

  /**
   * Get variable value (supports nested access)
   */
  private getVariable(name: string): any {
    const parts = name.split('.');
    let value: any = this.variables;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Apply text filters
   */
  private applyFilter(value: string, filter: string): string {
    switch (filter) {
      case 'uppercase':
        return value.toUpperCase();
      case 'lowercase':
        return value.toLowerCase();
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1);
      case 'kebab-case':
        return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      case 'snake_case':
        return value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      case 'camelCase':
        return value.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
      case 'PascalCase':
        const camel = value.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
        return camel.charAt(0).toUpperCase() + camel.slice(1);
      default:
        return value;
    }
  }

  /**
   * Validate variables against schema
   */
  static validateVariables(
    variables: Record<string, any>,
    schema: Record<string, TemplateVariable>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required variables
    Object.entries(schema).forEach(([key, varSchema]) => {
      if (varSchema.required && !(key in variables)) {
        errors.push(`Missing required variable: ${key}`);
      }

      const value = variables[key];
      if (value !== undefined) {
        // Type validation
        if (varSchema.type === 'number' && typeof value !== 'number') {
          errors.push(`Variable ${key} must be a number`);
        }
        if (varSchema.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Variable ${key} must be a boolean`);
        }
        if (varSchema.type === 'array' && !Array.isArray(value)) {
          errors.push(`Variable ${key} must be an array`);
        }
        if (varSchema.type === 'select' && varSchema.options && !varSchema.options.includes(value)) {
          errors.push(`Variable ${key} must be one of: ${varSchema.options.join(', ')}`);
        }

        // Custom validation
        if (varSchema.validation) {
          const { pattern, min, max, message } = varSchema.validation;
          if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
            errors.push(message || `Variable ${key} does not match pattern`);
          }
          if (min !== undefined && typeof value === 'number' && value < min) {
            errors.push(message || `Variable ${key} must be at least ${min}`);
          }
          if (max !== undefined && typeof value === 'number' && value > max) {
            errors.push(message || `Variable ${key} must be at most ${max}`);
          }
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }
}
