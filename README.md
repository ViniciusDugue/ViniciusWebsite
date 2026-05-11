# ViniciusWebsite

Personal portfolio site — a static, single-page-ish portfolio with a 3D word-embedding hero animation built in Three.js.

## Stack

- Plain HTML / CSS / JS (no build step)
- [Three.js](https://threejs.org/) loaded from CDN via importmap

## Structure

```
.
├── index.html                          # landing page
├── css/style.css                       # shared styles
├── js/hero.js                          # slim 3D embedding hero
└── projects/
    └── embedding-viewer/index.html     # full 6-category embedding viewer
```

## Running locally

The site uses ES module imports, so it must be served over HTTP (not opened with `file://`).

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Push to GitHub and enable **Settings → Pages → Branch: main → /(root)**. The site will be available at `https://viniciusdugue.github.io/ViniciusWebsite/`.
