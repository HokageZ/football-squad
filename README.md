# Football Squad Builder

A modern web application built with Next.js for managing football players, analyzing stats, and building balanced teams. 

## 🌟 Features

- **Player Management:** Add, edit, and view football players with detailed attributes.
- **Visual Stats:** Interactive radar charts and stat bars to analyze player performance and traits.
- **Team Builder:** Intuitive drag-and-drop interface for building custom squads and visualizing formations directly on the pitch.
- **Team Balancing:** Algorithmic team balancer to automatically sort players into fair teams for matches.
- **Modern UI:** Beautiful, responsive design powered by Tailwind CSS v4, Radix UI primitives, and Framer Motion for smooth animations.
- **Rich Feedback:** Interactive audio feedback and toast notifications for an engaging user experience.
- **PWA Support:** Progressive Web App ready with service worker and manifest for native-like installation.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (Headless UI)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

## 📦 Getting Started

First, install the dependencies (the project uses `pnpm`):

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `/src/app` - Next.js App Router pages (`/`, `/teams`, `/players`, `/matches`)
- `/src/components` - React components organized by domain:
  - `/ui` - Reusable foundational UI elements
  - `/players` - Player-specific views (cards, forms, stats)
  - `/teams` - Squad building and pitch view components
  - `/layout` - Global layout wrappers and background effects
- `/src/context` - React Context providers for state management (`PlayerContext`, `MatchContext`)
- `/src/lib` - Core utilities, types, local storage, and the team balancing logic
- `/public` - Static assets including SVGs, background images, and PWA configurations

## 🛠️ Building for Production

To create an optimized production build:

```bash
pnpm build
```

Then start the production server:

```bash
pnpm start
```

## 📝 License

This project is private and created for managing local football squads.
