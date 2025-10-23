# 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland — Family Days Out

A modern web application to discover amazing activities and days out for families across Scotland. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- 🗺️ Interactive map view of activities across Scotland
- 🔍 Advanced filtering by cost, weather, accessibility, and dog-friendliness
- ❤️ Save favorite activities to local storage
- 📱 Fully responsive design for mobile, tablet, and desktop
- ♿ Accessibility-focused UI
- ⚡ Fast performance with Next.js optimization
- 🎨 Beautiful gradient UI with Tailwind CSS
- 📝 Community activity submissions with admin approval workflow

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for activity submissions)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scotland-days-out.git
cd scotland-days-out

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

### Other Platforms

This is a Next.js application and can be deployed to any platform that supports Node.js:

- **Netlify**: Connect your GitHub repo and select Next.js as the framework
- **AWS Amplify**: Follow the [Next.js deployment guide](https://docs.amplify.aws/nextjs/)
- **Docker**: Create a Dockerfile for containerized deployment
- **Traditional VPS**: Build and run with `npm run build && npm start`

## Features

### Activity Submissions

Users can submit new activities for review:

1. Click "+ Submit Activity" on the home page
2. Fill in activity details (name, location, description, pricing, etc.)
3. Submit for admin review
4. Admin approves/rejects via `/admin` dashboard
5. Approved activities appear on the home page

### Admin Dashboard

Access at `/admin/login` to:
- Review pending submissions
- Approve or reject activities
- View submission details
- Manage published activities

## Project Structure

```
├── app/                           # Next.js app directory
│   ├── api/
│   │   ├── activities/           # Activity endpoints
│   │   └── activities/submit/    # Submission endpoint
│   ├── admin/                    # Admin dashboard
│   ├── submit/                   # Submission form
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── src/
│   ├── lib/
│   │   ├── firebase.ts           # Firebase config
│   │   └── adminAuth.ts          # Admin authentication
│   ├── types/
│   │   └── submission.ts         # TypeScript types
│   └── components/               # React components
├── public/
│   └── activities.json           # Static activities data
└── package.json
```

## Data

Activities come from two sources:

1. **Static Data** - `public/activities.json` (manually curated)
2. **User Submissions** - Firestore database (admin-approved)

Each activity includes:
- Name, location, and description
- Pricing information
- Weather suitability
- Accessibility features
- Dog-friendly status
- Geographic coordinates for map display

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for:
- Activity submission endpoint
- Firestore collection structure
- Authentication details
- Usage examples

## Security

See [SECURITY.md](SECURITY.md) for security guidelines including:
- Environment variable management
- Data protection practices
- Dependency security
- Authentication & authorization
- Error handling best practices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy & Legal

- [Privacy Policy](/privacy)
- [Terms of Service](/terms)

## Support

For issues, questions, or suggestions, please open an [issue](https://github.com/yourusername/scotland-days-out/issues) on GitHub.
