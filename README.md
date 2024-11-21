# Alice Tattoos - AI-Powered Tattoo Design Platform

An innovative platform that uses AI to help users create unique, meaningful tattoo designs.

## Features

- AI-powered tattoo design generation
- Artist booking system
- E-commerce shop for tattoo supplies
- Blog with AI-generated content
- User dashboard
- Artist profiles
- Admin management system

## Tech Stack

- React + TypeScript
- Vite
- Firebase (Auth, Firestore, Storage)
- TailwindCSS
- Framer Motion
- OpenAI API
- iKhokha Payment Gateway

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Tattmonkey/Alice.git
cd Alice
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Add your environment variables to `.env`

5. Start development server:
```bash
npm run dev
```

## Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "alice-tattoos"
3. Go to Authentication > Settings > Authorized domains
4. Add these domains:
   - `localhost`
   - Your Netlify domain

## Deployment

The project is automatically deployed to Netlify when changes are pushed to the main branch.

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
```bash
netlify deploy --prod
```

## Environment Variables

Required environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_OPENAI_API_KEY`
- `VITE_IKHOKHA_MERCHANT_ID`
- `VITE_IKHOKHA_API_KEY`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.