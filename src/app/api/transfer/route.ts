import { NextResponse } from 'next/server';
import { validateTransferRequest } from '@/lib/utils/validation';
import { sanitizeInput } from '@/lib/utils/security';
import { createAuditLog } from '@/lib/utils/logging';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    // Validate and sanitize input
    const { isValid, errors } = validateTransferRequest(requestData);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid request data', details: errors },
        { status: 400 }
      );
    }
    
    const sanitizedData = sanitizeInput(requestData);
    
    // Rate limiting check would go here in production
    
    // Fraud detection check
    if (Number(sanitizedData.amount) > 10000) {
      await createAuditLog({
        event: 'large_transfer_attempt',
        data: { amount: sanitizedData.amount }
      });
      
      return NextResponse.json(
        { error: 'Large transfers require manual approval' },
        { status: 403 }
      );
    }
    
    // In a real app, you would process the transfer here
    const reference = `REF-${Date.now().toString(36).toUpperCase()}`;
    
    await createAuditLog({
      event: 'transfer_created',
      data: { ...sanitizedData, reference }
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      reference,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    await createAuditLog({
      event: 'transfer_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}