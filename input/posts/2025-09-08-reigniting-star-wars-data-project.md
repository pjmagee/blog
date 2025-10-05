Title: Reigniting My Star Wars Data Project
Lead: Moving from brittle API scraping and data loss to a sustainable local MediaWiki mirror using dumps, Docker, and Unraid.
Published: 2025-09-08
Tags:

- Star Wars
- MediaWiki
- Data Engineering
- Docker
- Unraid
- ETL
- Backup

---

# Reigniting My Star Wars Data Project

I shelved this project for a while after a string of avoidable problems: unstable containers, MongoDB volume mishaps, API overuse worries, and a general sense that I was “hammering” the Star Wars Fandom wiki harder than felt respectful. This post covers how I rebooted the whole effort around a radically simpler (and more ethical) model: pull an official dump, stand up a local MediaWiki, and iterate offline.

## Why I Paused the Project

Short version of why it stalled:

- Heavy API crawling felt disrespectful.
- Lost data after container / volume mistakes.
- Mongo added fragility I didn’t need.
- Small model tweaks forced full re-pulls.

## New Approach (Snapshot, Not Scrape)

1. Download official dump (`starwars_pages_current.xml.7z`).
2. Extract once.
3. Import into a local MediaWiki.
4. Do all parsing / modeling offline.

Outcome: reproducible, zero API pressure, easy to refresh later.

## Minimal Compose (Unraid)

```yaml
services:
  db:
    image: mariadb:11.4
    environment:
      - MARIADB_ROOT_PASSWORD=changeme
      - MARIADB_DATABASE=mediawiki
      - MARIADB_USER=wiki
      - MARIADB_PASSWORD=changeme
    volumes:
      - /mnt/user/appdata/starwars-mediawiki/mysql:/var/lib/mysql
  mediawiki:
    image: mediawiki:1.44
    ports:
      - "8000:80"
    volumes:
      - /mnt/user/appdata/starwars-mediawiki/LocalSettings.php:/var/www/html/LocalSettings.php:ro
      - /mnt/user/appdata/starwars-mediawiki/dumps:/dumps:ro
networks:
  default:
    external: true
    name: proxynet
```

## Import (Inside Container)

```bash
php maintenance/importDump.php --report=1000 /dumps/starwars_pages_current.xml
php maintenance/runJobs.php --maxjobs 5000
```

Time: ~30–45 min for >200k pages on my setup.

## Quick Validation

- Compare counts with `Special:Statistics`.
- Random spot check a few deep lore pages.
- Note: only current revisions (that’s fine for now).

## Why This Is Better

- Single atomic snapshot.
- No accidental API hammering.
- Easily reproducible.
- Safe space for schema & embedding experiments.

## Next Iterations

- Automate monthly dump refresh.
- Add diff detection (hash + date).
- Build entity graph (character → appearances → timeline).
- Optional embeddings index.

## One-Liners

Simplicity beats clever ETL. Start from dumps if they exist.

---

That’s it—concise and stable foundation re-established.
