# Advanced Task Flow

A modern, feature-rich task and note management application built with React, TypeScript, and Vite.

## Features

- Task Management with drag-and-drop functionality
- Rich Note-taking system with customization options
- Comprehensive Analytics Dashboard
- Task Timer and Progress Tracking
- Modern UI with dark/light mode
- Responsive design for all devices

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts for analytics
- React DnD for drag-and-drop
- Radix UI components
- React Toastify for notifications

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 7.x or later

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd my-advanced-task-flow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Building for Production

1. Create a production build:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The production build will be created in the `dist` directory.

## Deployment on Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the project:
```bash
vercel
```

### Option 2: Deploy with Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### Environment Variables

Add these environment variables in Vercel project settings:
```env
VITE_APP_TITLE=Advanced Task Flow
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── lib/           # Utility functions and helpers
  ├── styles/        # Global styles and Tailwind config
  ├── app/           # App-specific components and layouts
  └── advanced-task-flow.tsx  # Main application component
```

## Features in Detail

### Task Management
- Create, edit, and delete tasks
- Set priorities and due dates
- Real-time countdown timers
- Drag-and-drop task reordering

### Notes System
- Rich text notes with color coding
- Categories and tags
- Grid and list view options
- Sort by date, priority, or category

### Analytics Dashboard
- Task completion statistics
- Priority distribution charts
- Time tracking visualization
- Weekly activity trends

## Performance Optimizations

- Code splitting and lazy loading
- Memoized components
- Efficient state management
- Optimized production build

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
