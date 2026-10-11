/* Минимальный service worker: нужен, чтобы сайт считался установливаемым приложением.
   Ничего не кэширует — всегда берёт свежие файлы с сервера. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
