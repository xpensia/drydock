# drydock

> [Drydocks][wiki] are used for the construction, maintenance, and repair of ships, boats, and other watercraft.

drydock is a companion project of [harbormaster][harbormaster] for pulling repositories and other files to prepare them for docker's builds.

This project is in alpha stage, you should try it and discuss on [IRC (#harbormaster)][irc] or the [mailing list][ggroup].

## How it works?

drydock expose an HTTP API to receive instructions about repositories to pull

## Roadmap

- store already cloned repositories on S3
- garbage collect localy stored repositories
- http endpoint to receive pull/push from ssh (via custom http upgrade) and http


[wiki]: http://en.wikipedia.org/wiki/Drydock "Drydock on wikipedia"

[harbormaster]: https://github.com/xpensia/harbormaster "harbormaster on GitHub"

[irc]: irc://irc.freenode.org:6667/#harbormaster "#harbormaster on freenode"
[ggroup]: https://groups.google.com/forum/#!forum/harbormaster "google group"
