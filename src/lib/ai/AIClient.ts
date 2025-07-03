export interface AIClient {
  classifyIntent(command: string): Promise<string>;
  extractFields(command: string): Promise<any>;
  focusField(command: string, currentState: any): Promise<any>;
}
