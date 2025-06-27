export const createAuditLog = async (entry: {
  event: string;
  data?: Record<string, unknown>;
  error?: string;
}) => {
  try {
    // In production, send to logging service
    console.log('[AUDIT]', {
      timestamp: new Date().toISOString(),
      ...entry
    });
    
    // Example: Send to backend
    await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};