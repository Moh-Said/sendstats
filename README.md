# Send Stats

Send Stats is a real-time dashboard for monitoring transfers and transactions within the Send app ecosystem.
It provides live insights into user activities, in-app token distribution, and analytics for the in-app SEND token.

## Features

- **Real-time Transfers**: Live feed of SEND token transfers between users
- **Transaction Monitoring**: Track account creations and contract interactions
- **Token Analytics**: Balance distribution charts and user segmentation
- **Activity Heatmap**: Visual representation of transaction activity over time
- **Responsive Design**: Optimized for desktop and mobile devices

## Technologies

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Runtime**: Bun

## Installation

1. Install Bun: [https://bun.com/docs/installation](https://bun.com/docs/installation)

2. Clone the repository and install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Variables

Create a `.env` file in the root directory with:

```
VITE_BASE_URL = 'http://localhost:3000/api'
```

Replace with your API endpoint URL.

## Usage

- **Recent Activity Tab**: View live transfers and account creations
- **Stats Tab**: Explore token distribution, balance analytics, and activity heatmaps
- **Copy Functionality**: Click on addresses or Sendtags to copy them to clipboard

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API and WebSocket services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets (icons, SVGs)
```

## License

This project is licensed under the GPL License.

## Credits

- Icons from [SVGRepo](https://www.svgrepo.com/) under CC0 1.0 Universal Public Domain Dedication
- Send app icon from [Send GitHub](https://github.com/0xsend/)
- App icon from [SVGRepo/Charts Diagrams 2](https://www.svgrepo.com/svg/283618/analytics-statistics) under the CC0 License