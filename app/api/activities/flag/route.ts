import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['activityId', 'activityName', 'reason'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate reason
    const validReasons = ['inappropriate', 'incorrect_info', 'duplicate', 'closed', 'other'];
    if (!validReasons.includes(body.reason)) {
      return NextResponse.json(
        { error: 'Invalid reason provided' },
        { status: 400 }
      );
    }

    // Create a readable flag ID: activity-id_timestamp
    const timestamp = Date.now();
    const flagId = `flag_${body.activityId}_${timestamp}`;

    // Create flag object
    const flag = {
      activityId: body.activityId,
      activityName: body.activityName,
      reason: body.reason,
      details: body.details || '',
      status: 'pending',
      flaggedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    // Add to Firestore with custom ID
    const flagsRef = collection(db, 'flags');
    const docRef = doc(flagsRef, flagId);
    await setDoc(docRef, flag);

    return NextResponse.json(
      {
        success: true,
        flagId: flagId,
        message: 'Thank you for reporting this activity. We will review it shortly.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Flag error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to flag activity';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

