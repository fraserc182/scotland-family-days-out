# API Documentation - Activity Submissions

## Endpoints

### POST /api/activities/submit

Submit a new activity for review.

**Request Body:**
```json
{
  "name": "Activity Name",
  "location": "Location, Region",
  "description": "Detailed description of the activity",
  "price": "FREE or £10 per person",
  "cost": "free|paid|mixed",
  "weather": ["sunny", "rainy"],
  "dog_friendly": true,
  "accessible": false,
  "ageRange": "3-12 years",
  "opening_hours": "Daily 9am-5pm",
  "website": "https://example.com",
  "facilities": ["Café", "Toilets", "Parking"],
  "tags": ["🆓", "☀", "🐶"],
  "submittedBy": "John Doe",
  "submitterEmail": "john@example.com",
  "submitterPhone": "+44 123 456 7890",
  "submitterMessage": "Optional message"
}
```

**Required Fields:**
- `name` - Activity name
- `location` - Location
- `description` - Description
- `price` - Price description
- `cost` - Cost type (free/paid/mixed)
- `submittedBy` - Submitter name
- `submitterEmail` - Submitter email

**Response (201 Created):**
```json
{
  "success": true,
  "submissionId": "firebase_doc_id",
  "message": "Activity submitted successfully. We will review it soon!"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required field: name"
}
```

**Response (500 Server Error):**
```json
{
  "error": "Failed to submit activity"
}
```

## Firestore Collections

### submissions

Stores all user submissions.

**Document Structure:**
```json
{
  "submissionId": "auto_generated",
  "name": "Activity Name",
  "location": "Location",
  "description": "Description",
  "price": "Price",
  "cost": "free|paid|mixed",
  "weather": ["sunny"],
  "dog_friendly": true,
  "accessible": false,
  "ageRange": "3-12",
  "opening_hours": "9am-5pm",
  "website": "https://example.com",
  "facilities": ["Café"],
  "tags": ["🆓"],
  "submittedBy": "Name",
  "submitterEmail": "email@example.com",
  "submitterPhone": "phone",
  "submitterMessage": "message",
  "status": "pending|approved|rejected",
  "rejectionReason": "optional",
  "submittedAt": "2024-01-01T12:00:00Z",
  "createdAt": "firebase_timestamp",
  "approvedAt": "2024-01-02T12:00:00Z",
  "rejectedAt": "2024-01-02T12:00:00Z"
}
```

**Statuses:**
- `pending` - Awaiting admin review
- `approved` - Approved, ready to publish
- `rejected` - Rejected with reason

## Authentication

### Admin Login

Protected by Firebase Authentication.

**Credentials:**
- Email: Your Firebase admin email
- Password: Your Firebase admin password

**Access:**
- `/admin/login` - Login page
- `/admin` - Dashboard (requires authentication)

## Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to submit
    match /submissions/{document=**} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## Usage Examples

### JavaScript/Fetch

```javascript
const response = await fetch('/api/activities/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Activity',
    location: 'Edinburgh',
    description: 'A great activity',
    price: 'FREE',
    cost: 'free',
    weather: ['sunny'],
    dog_friendly: true,
    accessible: false,
    submittedBy: 'John',
    submitterEmail: 'john@example.com'
  })
});

const data = await response.json();
console.log(data);
```

### cURL

```bash
curl -X POST http://localhost:3000/api/activities/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Activity",
    "location": "Edinburgh",
    "description": "A great activity",
    "price": "FREE",
    "cost": "free",
    "weather": ["sunny"],
    "dog_friendly": true,
    "accessible": false,
    "submittedBy": "John",
    "submitterEmail": "john@example.com"
  }'
```

## Error Handling

### Validation Errors

```json
{
  "error": "Missing required field: name"
}
```

### Email Validation

```json
{
  "error": "Invalid email format"
}
```

### Server Errors

```json
{
  "error": "Failed to submit activity"
}
```

## Rate Limiting

Currently no rate limiting. Consider adding:
- Max submissions per IP per day
- Max submissions per email per day
- Spam detection

## Future Enhancements

- [ ] Email notifications to submitter
- [ ] Email notifications to admin
- [ ] Automatic publishing of approved activities
- [ ] Image uploads
- [ ] Duplicate detection
- [ ] Rate limiting
- [ ] Webhook notifications
- [ ] CSV export of submissions

