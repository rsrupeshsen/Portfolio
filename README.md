# Rupesh Sen · portfolio

Live: https://rupesh-sen-portfolio.netlify.app

Plain HTML, CSS and JavaScript, built with Vite. No frameworks or UI libraries.

## Run it locally

    npm install
    npm run dev

Then open http://localhost:5173.

## Deploy

Netlify builds this repo using `netlify.toml` (`npm run build`, publishes `dist`).
To deploy by hand instead, run `npm run build` and drag the `dist` folder onto the site's Deploys page.

## Where things are

- `index.html`: all the text and sections
- `src/style.css`: colours, type and layout (tokens at the top: `--paper`, `--ink`, `--accent`)
- `src/main.js`: copy buttons, mobile menu, scroll details (pencil underlines, year rings, reading line, footer reveal)
- `src/portrait.js` and `src/portrait-data.js`: the hero portrait that builds itself from falling dots
- `public/Rupesh_Sen_Resume.pdf`: replace with a file of the same name to update the resume
