// Helper functions
export const fieldToLabel = (field: string): string =>  {
  const labels: Record<string, string> = {
    recipientName: 'recipient name',
    recipientAccount: 'account number',
    bankName: 'bank name',
    amount: 'amount',
    currency: 'currency',
    reference: 'reference',
  };
  return labels[field] || field;
}

export const generateConfirmation = (updates: any): string => {
  const parts = [];
  if (updates.amount) parts.push(`Amount: ₦${Number(updates.amount).toLocaleString('en-NG')}`);
  if (updates.recipientName) parts.push(`Recipient: ${updates.recipientName}`);
  if (updates.recipientAccount) parts.push(`Account: ${updates.recipientAccount}`);
  if (updates.bankName) parts.push(`Bank: ${updates.bankName}`);
  return parts.length > 0 ? parts.join(', ') + '.' : 'Changes applied.';
}

export const extractAndParseJSON = (markdownString: string) => {
  // Remove the ```json and ``` markers
  const jsonString = markdownString
    .replace(/^```json\s*/, '')  // Remove starting ```json
    .replace(/\s*```$/, '');     // Remove ending ```
    
  try {
    // Parse the cleaned JSON string
    const data = JSON.parse(jsonString);
    
    // Handle amount formatting if needed (e.g., "1,27" → 1.27)
    if (data.amount && typeof data.amount === 'string') {
      data.amount = parseFloat(data.amount.replace(',', '.'));
    }
    
    return data;
  } catch (e) {
    console.error('Failed to parse JSON:', {
      original: markdownString,
      cleaned: jsonString,
      error: e.message
    });
    throw new Error('Invalid JSON format in Markdown');
  }
}

// Example usage
const markdownInput = 
`\`\`\`json
{
  "amount": "1,27",
  "bankName": "GTB"
}
\`\`\``;

try {
  const result = extractAndParseJSON(markdownInput);
  console.log(result);
  // Output: { amount: 1.27, bankName: "GTB" }
} catch (e) {
  console.error('Error:', e.message);
}