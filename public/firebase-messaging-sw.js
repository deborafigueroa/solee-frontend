importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC2M80NVuAoYr8ycWB6Px5oDgcu7PMTTmQ",
  authDomain: "solee-4e28e.firebaseapp.com",
  projectId: "solee-4e28e",
  storageBucket: "solee-4e28e.firebasestorage.app",
  messagingSenderId: "426253432845",
  appId: "1:426253432845:web:00d203d4f3a3a7c7dabd44",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const datos = payload.data || {};
  self.registration.showNotification(datos.titulo || "Solee", {
    body: datos.cuerpo || "",
    data: { url: datos.url || "/home" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = new URL((event.notification.data && event.notification.data.url) || "/home", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const ventana of ventanas) {
        if (ventana.url.startsWith(self.location.origin) && "focus" in ventana) {
          return ventana
            .focus()
            .then((v) => (v && "navigate" in v ? v.navigate(destino) : clients.openWindow(destino)))
            .catch(() => clients.openWindow(destino));
        }
      }
      return clients.openWindow(destino);
    })
  );
});