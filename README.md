# Tree Nation Globe

An interactive 3D globe visualization for global tree planting projects. The app maps Tree Nation-style project data onto a WebGL-powered Earth, using custom tree markers, hover previews, project detail cards, and status-based marker colors.

Live demo:

```txt
https://tree-nation-globe.pages.dev
```

## Features

- 3D Earth rendered with WebGL
- Tree project markers positioned by latitude and longitude
- Custom SVG tree icon inside every marker circle
- Marker colors based on project status:
  - Emerald: affiliated / active
  - Teal: closed
  - Lime: restocking
- Hover interaction:
  - pauses globe rotation
  - displays a compact project preview near the marker
- Click interaction:
  - opens a full project details panel
- Summary dashboard with project, tree, and open-project statistics
- Responsive dark map-style interface
- Cloudflare Pages deployment ready

## Tech Stack

- [Vue 3](https://vuejs.org/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [globe.gl](https://github.com/vasturiano/globe.gl)
- [Three.js](https://threejs.org/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## Project Structure

```txt
src/
  assets/
    tree.svg                 # Marker/logo icon
  components/
    MapLegend.vue            # Bottom-left status legend
    ProjectDetailsPanel.vue  # Full details panel on click
    ProjectHoverCard.vue     # Hover preview card
    StatsPanel.vue           # Top-left summary panel
  data/
    treedata.ts              # Tree project dataset
  utils/
    geo.ts                   # Country label centroid helper
    treeProjects.ts          # Project formatting, colors, marker mapping
  App.vue                    # Globe orchestration and app state
  main.ts                    # Vue app entry
```

## Getting Started

### 1. Install dependencies

```sh
bun install
```

### 2. Start the development server

```sh
bun run dev
```

Open the local URL shown in your terminal, usually:

```txt
http://localhost:5173
```

### 3. Build for production

```sh
bun run build
```

The production files are generated in:

```txt
dist/
```

### 4. Preview the production build

```sh
bun run preview
```

## Data Source

Project data lives in:

```txt
src/data/treedata.ts
```

Each project includes fields like:

```ts
{
  id: number;
  slug: string;
  name: string;
  status: string;
  location: string;
  lat: number;
  long: number;
  trees_funded: number;
  new_tree_objective: number;
  rating: number;
  review_count: number;
  is_restocking: boolean;
}
```

The app converts each project into a globe marker using:

- `lat` → marker latitude
- `long` → marker longitude
- `status` / `is_restocking` → marker color
- `trees_funded` → marker/ring sizing and statistics

## How It Works

The globe is initialized in `src/App.vue` using `globe.gl`, which uses Three.js/WebGL under the hood.

The app then:

1. Loads project data from `treedata.ts`.
2. Filters projects with valid coordinates.
3. Converts projects into globe points and HTML marker elements.
4. Places custom tree SVG markers on the globe.
5. Adds ring animations for selected and high-impact projects.
6. Pauses auto-rotation on marker hover.
7. Shows a hover card or full details panel depending on user interaction.

## Deployment

The app is configured as a static Vite build and can be deployed to Cloudflare Pages.

Build command:

```sh
bun run build
```

Output directory:

```txt
dist
```

Deploy with Wrangler:

```sh
npx wrangler pages deploy dist --project-name tree-nation-globe --branch main
```

Current Cloudflare Pages URL:

```txt
https://tree-nation-globe.pages.dev
```

## Useful Commands

```sh
bun run dev      # Start local development server
bun run build    # Type-check and build production assets
bun run lint     # Run ESLint
bun run preview  # Preview production build locally
```

## Notes

- The current data is static, but the app structure can support live updates by replacing `treedata.ts` with an API, database, or WebSocket feed.
- The `globe.gl` and Three.js dependencies are large, so Vite may warn about bundle size during production builds. This is expected for a WebGL globe application.
- Custom domains can be connected through Cloudflare Pages if you own the domain.
