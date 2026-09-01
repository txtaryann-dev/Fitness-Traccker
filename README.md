# Velocity

A modern fitness and social-tracking app featuring real-time GPS routing, performance analytics, and community leaderboards.

## Overview

Velocity lets users record runs, rides, and walks with high-accuracy live GPS tracking, then share activities in a social feed — similar in spirit to Strava. It combines activity logging with gamified progress tracking (weekly targets, challenges, badges) to keep users motivated.

## Features

- **Activity Recording** — Track running, cycling, and walking sessions with live GPS, distance, pace, and elapsed time
- **Route Mapping** — Visualize recorded routes on an interactive map with start/end markers
- **Social Feed** — Browse and give kudos on activities shared by other users
- **Weekly Progress** — Track distance completed against a personal weekly target
- **Challenges** — Join and complete community challenges (e.g. monthly distance goals, weekend sprints)
- **Badges & Achievements** — Earn badges for completed activities and milestones
- **Annual Mileage Goal** — Track cumulative distance toward a yearly target
- **Dark Mode** — Toggle between light and dark themes
- **Unit Preferences** — Switch between kilometers and miles

## Tech Stack

- **Language:** TypeScript
- **Build Tool:** Vite
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine

### Installation

```bash
# Clone the repository
git clone https://github.com/txtaryann-dev/Fitness-Traccker.git
cd Fitness-Traccker

# Install dependencies
bun install
```

### Environment Variables

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

### Running the App

```bash
bun run dev
```

The app will be available locally — check the terminal output for the exact URL.

## Project Structure

```
Fitness-Traccker/
├── public/assets/aistudio/   # Static assets
├── src/                      # Application source code
├── index.html                # Entry HTML file
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json               # Project dependencies and scripts
```

## Roadmap

- [ ] Route elevation profiles
- [ ] Segment leaderboards
- [ ] Activity comments
- [ ] Mobile app packaging

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.
