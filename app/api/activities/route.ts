import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

interface Activity {
  id: string;
  name: string;
  location: string;
  description: string;
  price: string;
  cost: 'free' | 'paid' | 'mixed';
  weather: string[];
  dog_friendly: boolean;
  accessible: boolean;
  ageRange?: string;
  tags: string[];
  opening_hours?: string;
  website?: string;
  lat?: number;
  lng?: number;
}

export async function GET(_request: NextRequest) {
  try {
    // Load static activities from JSON
    const jsonPath = path.join(process.cwd(), 'public', 'activities.json');
    const staticActivities: Activity[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Fetch approved activities from Firebase
    const submissionsRef = collection(db, 'submissions');
    const q = query(submissionsRef, where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);

    // Convert Firebase submissions to Activity format
    const approvedActivities: Activity[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: `firebase-${doc.id}`,
        name: data.name || '',
        location: data.location || '',
        description: data.description || '',
        price: data.price || '',
        cost: data.cost || 'free',
        weather: data.weather || [],
        dog_friendly: data.dog_friendly || false,
        accessible: data.accessible || false,
        ageRange: data.ageRange,
        tags: data.tags || [],
        opening_hours: data.opening_hours,
        website: data.website,
        lat: data.lat,
        lng: data.lng,
      };
    });

    // Merge and return
    const allActivities = [...staticActivities, ...approvedActivities];

    return NextResponse.json(allActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    
    // Fallback to static activities if Firebase fails
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'activities.json');
      const staticActivities = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      return NextResponse.json(staticActivities);
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return NextResponse.json([], { status: 500 });
    }
  }
}

