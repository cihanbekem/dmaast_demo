# Digital Twin Frontend

React + Vite frontend for the Critical Infrastructure Digital Twin system.

## Features

- **Interactive Process Map**: React Flow visualization with custom machine and buffer nodes
- **Real-time Simulation**: Run discrete event simulations and visualize results
- **Analytics Dashboard**: Charts for bottleneck evolution and equipment effectiveness
- **Scenario Comparison**: Save and compare multiple simulation scenarios
- **Dark Mode UI**: Industrial-themed dark interface

## Setup

```bash
cd frontend
npm install
```

## Run

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

Make sure the backend is running on `http://localhost:8000`

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Flow (for process visualization)
- Recharts (for analytics)
- Zustand (state management)
- Lucide React (icons)
