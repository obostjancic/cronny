# Cronny

> Schedule the web checks that matter to you.

[![Node.js](https://img.shields.io/badge/node-22.14.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cronny is a self-hosted scheduler for monitoring websites and receiving useful results on a schedule. Create jobs in a web UI, keep their history in SQLite, and get notified when something changes. It includes ready-to-use monitors for Austrian and Bosnian real estate, public appointments, reservations, and news feeds.

## Highlights

- **Run on your schedule**: standard cron expressions, enabled/disabled jobs, next-run times, and run history.
- **Keep the signal**: preserve source search URLs and refine real-estate results by price, size, rooms, radius, or a map-drawn polygon.
- **Get notified**: Slack and WhatsApp notifications can be sent after successful or failed runs; successful notifications can be limited to new results.
- **Use the built-in sources**: monitor real estate listings, ID Austria appointments, Vienna grill reservations, generic Willhaben listings, and AI-processed RSS news.
- **Own the data**: jobs, results, runs, clients, and schedules are stored locally in SQLite.
- **Share selected results**: issue API keys to clients and grant access only to specific jobs.

## Supported monitors

| Category | Sources |
| --- | --- |
| Real estate | DerStandard Immobilien, Willhaben Immobilien, ImmoScout24 Austria, OLX.ba, and a multi-source Immo monitor |
| Availability | ID Austria appointments and Vienna public grill-area reservations |
| News | Klix.ba and DerStandard RSS feeds with optional OpenRouter AI processing |
| General | Generic Willhaben searches |

## Quick start with Docker

The Docker setup runs Cronny and FlareSolverr, which helps with sources that require browser-like challenge handling. Docker Compose persists Cronny's SQLite data in a named volume.

1. Create `packages/server/.env`:

   ```dotenv
   API_SECRET=replace-with-a-long-random-secret
   API_PASSWORD=replace-with-a-strong-password
   BASE_URL=http://localhost:3030

   # Required when using location-based real-estate filters
   GEOCODE_API_KEY=

   # Required for AI news monitors
   OPENROUTER_API_KEY=

   # Required only when using WhatsApp notifications
   WHATSAPP_API_KEY=
   ```

2. Start the services:

   ```bash
   docker compose up --build -d
   ```

3. Open [http://localhost:3030](http://localhost:3030), then sign in with `API_PASSWORD`.

Check that the service is ready:

```bash
curl http://localhost:3030/api/public/health
# {"status":"ok"}
```

To stop the stack, run `docker compose down`. Add `-v` only if you also want to delete the stored database.

## Local development

### Prerequisites

- [Node.js](https://nodejs.org/) 22.14.0
- [pnpm](https://pnpm.io/) 9.15.4 (Corepack is recommended)
- Docker (optional, for FlareSolverr)

```bash
corepack enable
pnpm install --frozen-lockfile
```

Create `packages/server/.env` with the values from the Docker quick start, plus the local server settings:

```dotenv
NODE_ENV=development
PORT=3030
API_SECRET=replace-with-a-long-random-secret
API_PASSWORD=replace-with-a-strong-password
BASE_URL=http://localhost:5174
```

Start both applications:

```bash
pnpm dev:all
```

- Web app: [http://localhost:5174](http://localhost:5174)
- API: [http://localhost:3030](http://localhost:3030)

For sources that need FlareSolverr, start it separately:

```bash
docker compose up flaresolverr
```

The server creates its development database at `packages/server/.data/db.sqlite`. Its development startup also generates and applies Drizzle schema changes.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Local development | Set to `development` locally; Docker sets production automatically. |
| `PORT` | Yes | HTTP port for the server. |
| `API_SECRET` | Yes | Secret used to sign web-session tokens. Use a long, random value. |
| `API_PASSWORD` | Yes | Password for the web interface. |
| `BASE_URL` | For notifications | Public URL used in notification links. |
| `GEOCODE_API_KEY` | For geocoded sources and geo filters | API key for address geocoding. |
| `OPENROUTER_API_KEY` | For AI news monitors | OpenRouter API key for RSS processing. |
| `WHATSAPP_API_KEY` | For WhatsApp notifications | CallMeBot API key. |
| Job notification phone | For WhatsApp notifications | Configure the recipient phone number in the job's notification settings. |
| `FLARESOLVERR_URL` | Optional | FlareSolverr endpoint; defaults to `http://localhost:8191`. |
| `DATABASE_PATH` | Optional | Override the default SQLite database path. |

Never commit `.env` files or credentials.

## Commands

Run these from the repository root:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the server in watch mode. |
| `pnpm dev:all` | Start the client and server together. |
| `pnpm build` | Build shared types, server, and client. |
| `pnpm lint` | Lint the client and server. |
| `pnpm test` | Run server tests. |
| `pnpm start:prod` | Run migrations and start the production server. |

## Architecture

```text
packages/
├── client/  React, Vite, Mantine, TanStack Query/Router
├── server/  Hono, Drizzle, SQLite, Playwright, node-cron
└── types/   Shared TypeScript contracts
```

Each monitor is a strategy in `packages/server/src/strategies/`. Strategies share a runner contract; real-estate strategies additionally share filtering and geographic matching logic. The server schedules persisted jobs with cron, records each run and its results, and serves the client and API.

## API access

Cronny can expose results to external clients with API keys. Create a client and assign its permitted jobs in the UI, then request:

```bash
curl -H "X-API-Key: YOUR_CLIENT_KEY" \
  http://localhost:3030/api/public/results
```

The endpoint returns results only from jobs assigned to that client.

## Contributing

Issues and pull requests are welcome. Please use pnpm, keep changes focused, and run these checks before opening a pull request:

```bash
pnpm lint
pnpm build
pnpm test
```

## License

MIT
