/**
 * Validates activity data against expected schema
 */

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

export function validateActivity(data: unknown): data is Activity {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const activity = data as Record<string, unknown>;

  // Required fields
  if (
    typeof activity.id !== 'string' ||
    typeof activity.name !== 'string' ||
    typeof activity.location !== 'string' ||
    typeof activity.description !== 'string' ||
    typeof activity.price !== 'string' ||
    !['free', 'paid', 'mixed'].includes(activity.cost as string) ||
    !Array.isArray(activity.weather) ||
    typeof activity.dog_friendly !== 'boolean' ||
    typeof activity.accessible !== 'boolean' ||
    !Array.isArray(activity.tags)
  ) {
    return false;
  }

  // Optional fields validation
  if (activity.lat !== undefined && typeof activity.lat !== 'number') {
    return false;
  }

  if (activity.lng !== undefined && typeof activity.lng !== 'number') {
    return false;
  }

  if (activity.opening_hours !== undefined && typeof activity.opening_hours !== 'string') {
    return false;
  }

  if (activity.website !== undefined && activity.website !== null && typeof activity.website !== 'string') {
    return false;
  }

  if (activity.ageRange !== undefined && typeof activity.ageRange !== 'string') {
    return false;
  }

  if (activity.facilities !== undefined && !Array.isArray(activity.facilities)) {
    return false;
  }

  return true;
}

export function validateActivities(data: unknown): Activity[] {
  if (!Array.isArray(data)) {
    console.error('Activities data is not an array');
    return [];
  }

  const validActivities: Activity[] = [];
  const invalidActivities: unknown[] = [];

  for (const item of data) {
    if (validateActivity(item)) {
      validActivities.push(item);
    } else {
      invalidActivities.push(item);
      console.warn('Invalid activity data:', item);
    }
  }

  if (invalidActivities.length > 0) {
    console.warn(`${invalidActivities.length} invalid activities were filtered out`);
  }

  return validActivities;
}

