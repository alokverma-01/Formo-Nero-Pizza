Self-hosting the videos (recommended before launch)
====================================================
The site streams six short clips from Mixkit (free licence, no attribution needed).
For speed and reliability, download them and serve them from your own domain:

1. Open each page listed in js/data.js (look for "page:" under `media`), click Download (720p is plenty).
2. Save the files here, e.g. assets/video/hero.mp4, dough.mp4, sauce.mp4, box.mp4, door.mp4, slice.mp4
3. In js/data.js change the matching lines, for example:
     hero:  { hd: "assets/video/hero.mp4", sd: "assets/video/hero.mp4", poster: P.oven, ... }

Your own footage works the same way. Keep clips short (6–12 s), muted, H.264 MP4, under ~4 MB each.
