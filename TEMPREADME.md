<h1 align="center">Discord Music Bot<h1>
  
[![Author](https://img.shields.io/badge/author-Tfbio-brightgreen)](https://github.com/tfbio)
[![Category](https://img.shields.io/badge/category-personal_project-brightgreen)](#)
[![Status](https://img.shields.io/badge/status-finished-brightgreen)](#)

---
# :clipboard: Table of Contents

* [Overview](#mag-overview)
* [Setup](#wrench-setup)
* [Important](#heavy_exclamation_mark-important)
* [How to Run](#factory-how-to-run)
* [Sidenote](#e-mail-sidenote)

# :mag: Overview

**Bot for searching and broadcasting songs in Discord channels with optional database for storing custom playlists.**
**Developed in Nodejs with pure Javascript exploring the [Discord API](https://discord.com/developers/docs/intro) with the module [discord.js](https://discord.js.org/#/),
and integration a Postgres database with [Prisma](https://www.prisma.io/) ORM.**


# :wrench: Setup

**Commands "npm i" or "yarn" will install node_modules required to run the program.**

  
# :heavy_exclamation_mark: Important

**The environment variables need to filled as an additional step in the setup:**
- [Discord API](https://discord.com/developers/docs/intro) for your own bot token
- [Spotify API](https://developer.spotify.com/) for also playing playlists from spotify
- (Optional) URL of your local Postgres database

  
# :factory: How to Run

**On command terminal run "npm start" or "yarn start". In discord, writting "!connect" will start the bot in your channel and all commands to use it are listed by writting "!help".**

  
# :e-mail: Sidenote
**A few functionalities still need refining, as in dealing with large playlists can cause side effects as lagging or in some cases the bot will not be able to process massive playlist.**
