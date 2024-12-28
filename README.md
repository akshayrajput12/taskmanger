# Advanced Task Flow

A powerful task and note management application with real-time synchronization and user authentication. This app allows users to create, manage, and organize their tasks and notes efficiently.

## Features

- 🔐 Secure user authentication
- ✅ Task management with priorities and categories
- 📝 Note-taking capabilities
- 🎨 Customizable task colors
- 📊 Progress tracking
- ⏱️ Time tracking for tasks
- 🔄 Real-time data synchronization
- 🌓 Dark/Light mode support

## Live Demo

The app is ready to use! Simply:
1. Visit [your-deployed-url]
2. Sign up for an account
3. Start managing your tasks and notes!

## Technology Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase for authentication and database
- Radix UI components
- React DnD for drag and drop
- Recharts for analytics

## Local Development

To run this project locally:

```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Contributing

While this is a public repository, it's configured to use a specific Supabase instance. If you'd like to contribute:

1. Create a pull request with your changes
2. Ensure all code follows the existing style
3. Add tests if applicable
4. Update documentation as needed

## Deployment

This app is configured for deployment on Vercel. To deploy:

1. Fork this repository to your GitHub account
2. Create a new project on Vercel
3. Connect your GitHub repository to Vercel
4. Add the following environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_TITLE`
   - `VITE_APP_VERSION`
5. Deploy! Vercel will automatically build and deploy your app

The deployment configuration is already set up in `vercel.json`:
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: `vite`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
VITE_APP_TITLE=Advanced Task Flow
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Note: Never commit your `.env` file. Use the provided `.env.example` as a template.

## License

MIT License - feel free to use this code for learning purposes!

## Contact

[Your contact information or social media links]
