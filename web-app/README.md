# UWT Web Atlas

React/Vite frontend for the public UWT atlas and visualizers. In the ecosystem
orchestrator this app is registered as the optional `uwt-web` service and is
published at `https://uwt.xteam.pro` when enabled.

## Stack

- React 18
- TypeScript 5.8
- Vite 6
- React Router 7
- Zustand
- Tailwind CSS
- ESLint

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run check
npm run preview
```

## Public Assets

The app owns SEO-facing static assets:

- `public/robots.txt`
- `public/sitemap.xml`
- `index.html` meta tags

Keep public assets free of secrets, internal URLs, unpublished patent claim
language, private prompts, telemetry, or customer-specific material.

## Ecosystem Notes

- Source lives under `projects/UWT/web-app`.
- Orchestrator health check is configured in `../../../config/projects.yml`.
- License and contribution rules are inherited from the UWT repository root:
  `../LICENSE`, `../LICENSING.md`, `../CONTRIBUTING.md`, `../PATENTS.md`.
