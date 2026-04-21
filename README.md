# Edison Family Guide

A curated local guide for Chinese families in Edison, NJ.

Live site: https://edisonmom.com/

## Background

Reliable local information for kids activities, daycare, doctors, classes, fitness, restaurants, and home services is often scattered across WeChat groups and word of mouth.

This project centralizes community-curated information into a lightweight, mobile-friendly static site.

## Site Structure

- `index.html` - decision entry page for choosing what to do today
- `pages/play.html` - kids activities and places to go, with category filters
- `pages/events.html` - seasonal events, farms, and activity-based recommendations
- `pages/study.html` - classes, daycare, and swim resources
- `pages/life.html` - doctors, restaurants, and home service providers
- `pages/fitness.html` - timetable-style group fitness schedule with day and location filters
- `pages/favorites.html` - localStorage-based saved lists

## Features

- Mobile-first static site
- JSON-driven content system
- Weather and outfit reminder
- Favorites saved in `localStorage`
- Weekend planning, wishlist, visited, and saved lists
- Fitness schedule grouped by start time and location
- Checklist support for outing cards

## Data Organization

- `data/play/` - parks, indoor play, water play, beaches, hiking, theme parks
- `data/seasonal/` - events, farms, seasonal activities
- `data/study/` - classes, daycare, swim
- `data/life/` - doctors, food, house services
- `data/fitness/` - YMCA and ECC fitness schedules

## Tech Stack

- Static HTML / CSS / JavaScript
- ES modules
- JSON content files
- Netlify deployment

## Deployment Notes

The site is ready for the production domain as long as it is deployed from the repository root.

- No localhost or `127.0.0.1` paths are required.
- Pages under `pages/` load shared assets with `../css/...` and `../js/...`.
- JSON files are loaded through `js/paths.js`, so root and `pages/` routes both resolve `data/...` correctly.
- Analytics domain is configured for `edisonmom.com`.

## Author

Ying (Fiona) Zhou
