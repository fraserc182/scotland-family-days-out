import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'location', 'description', 'price', 'cost'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create a readable submission ID: activity-name_timestamp
    const activityNameSlug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30); // Limit to 30 chars

    const timestamp = Date.now();
    const customId = `${activityNameSlug}_${timestamp}`;

    // Create submission object
    const submission = {
      ...body,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    // Add to Firestore with custom ID
    const submissionsRef = collection(db, 'submissions');
    const docRef = doc(submissionsRef, customId);
    await setDoc(docRef, submission);

    return NextResponse.json(
      {
        success: true,
        submissionId: customId,
        message: 'Activity submitted successfully. We will review it soon!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit activity' },
      { status: 500 }
    );
  }
}

