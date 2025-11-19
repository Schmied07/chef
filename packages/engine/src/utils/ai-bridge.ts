/**
 * AI Bridge - Connects TypeScript code to Python AI service
 */

import { spawn } from 'child_process';
import { join } from 'path';

const AI_SERVICE_PATH = join(__dirname, '../../ai-service/ai_service.py');

/**
 * Calls the Python AI service
 * 
 * @param command - Command to execute (extract_intent, generate_plan, etc.)
 * @param data - Input data for the command
 * @returns Promise with the AI service response
 */
export async function callAIService(
  command: string,
  data: Record<string, unknown>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const inputJson = JSON.stringify(data);
    
    // Spawn Python process
    const python = spawn('python3', [AI_SERVICE_PATH, command, inputJson]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`AI service exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse AI service output: ${stdout}`));
      }
    });
    
    python.on('error', (error) => {
      reject(new Error(`Failed to start AI service: ${error.message}`));
    });
  });
}

/**
 * Test connection to AI service
 */
export async function testAIService(): Promise<boolean> {
  try {
    await callAIService('extract_intent', {
      prompt: 'Test connection'
    });
    return true;
  } catch (error) {
    console.error('AI service test failed:', error);
    return false;
  }
}
