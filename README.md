# Crate

A record-shop take on a music player. Crate is a Spotify-style streaming app built as a learning project: browse albums, play music, search, like songs, and build playlists, all wrapped in a warm, vinyl-inspired design.

## Features

- [x] App shell: sidebar, scrolling main area, player bar
- [ ] Music catalog: albums, artists, tracks from a local data file
- [ ] Album pages with tracks listed by side (A1, A2, B1…)
- [ ] Playback: play/pause, next/previous, seek, volume, shuffle, repeat
- [ ] Search
- [ ] Liked songs and playlists
- [ ] Upload your own music

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4, with design tokens from Figma
- [Lucide](https://lucide.dev) icons
- Fonts: Fraunces, DM Sans, DM Mono

## Getting started

You'll need Node.js 20.9 or newer.

```bash
git clone https://github.com/sean-birmingham/crate.git
cd crate
npm install
npm run dev
```

Then open http://localhost:3000.

### Adding music

Audio files aren't included in the repo. Put your own audio files in `public/music/` and list them in `data/db.json`; each track's `src` should point to its file, e.g. `/music/afterglow-drive.mp3`.

## Project structure

```
app/          Pages and the root layout
components/   UI pieces (Sidebar, PlayerBar, …)
lib/          Types and data helpers
data/         db.json, the music catalog
public/       Covers and (locally) music files
```
