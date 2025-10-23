export interface Activity {
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
  facilities?: string[];
}

export interface ActivitySubmission extends Activity {
  submissionId: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submitterEmail: string;
  submitterPhone?: string;
  submitterMessage?: string;
}

export interface ActivityFlag {
  flagId: string;
  activityId: string;
  activityName: string;
  reason: 'inappropriate' | 'incorrect_info' | 'duplicate' | 'closed' | 'other';
  details?: string;
  flaggedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  adminNotes?: string;
}

