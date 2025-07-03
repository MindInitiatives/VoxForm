export interface AIClient {
  classifyIntent(command: string): Promise<string>;
  extractFields(command: string): Promise<Record<string, unknown>>;
  focusField(command: string, currentState: Record<string, unknown>): Promise<unknown>;
}
