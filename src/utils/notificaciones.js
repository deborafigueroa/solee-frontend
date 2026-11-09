import { getToken, deleteToken } from "firebase/messaging";
import api from "../api/axiosConfig";
import { VAPID_KEY, obtenerMessaging, pushSoportado } from "../firebase";

const CLAVE_PUSH = "solee_push_usuario";

const obtenerTokenDispositivo = async () => {
  const registro = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await navigator.serviceWorker.ready;
  return getToken(obtenerMessaging(), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registro });
};

export const consultarEstado = async () => {
  if (!(await pushSoportado())) return { soportado: false, permiso: "unsupported", activo: false };

  const permiso = Notification.permission;
  if (permiso !== "granted") return { soportado: true, permiso, activo: false };

  try {
    const token = await obtenerTokenDispositivo();
    const { data } = await api.post("/notificaciones/estado", { token });
    return { soportado: true, permiso, activo: Boolean(data.registrado) };
  } catch (e) {
    return { soportado: true, permiso, activo: false };
  }
};

export const activarNotificaciones = async (usuarioId) => {
  if (!(await pushSoportado())) {
    throw new Error("Este navegador o dispositivo no permite notificaciones push.");
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    throw new Error(
      permiso === "denied"
        ? "Las notificaciones están bloqueadas en este navegador. Habilítalas desde el candado junto a la dirección del sitio."
        : "No se concedió el permiso de notificaciones."
    );
  }

  const token = await obtenerTokenDispositivo();
  if (!token) throw new Error("No se pudo obtener el identificador de este dispositivo.");

  await api.post("/notificaciones/suscribir", { token });
  localStorage.setItem(CLAVE_PUSH, String(usuarioId));
};

export const desactivarNotificaciones = async () => {
  localStorage.removeItem(CLAVE_PUSH);
  if (!(await pushSoportado()) || Notification.permission !== "granted") return;

  const token = await obtenerTokenDispositivo();
  if (token) {
    await api.post("/notificaciones/desuscribir", { token });
    try {
      await deleteToken(obtenerMessaging());
    } catch (e) {
      // Si no se puede invalidar, igual quedó desvinculado del servidor
    }
  }
};

// Al cerrar sesión: desvincula el dispositivo sin tocar el permiso del navegador
export const quitarDispositivoActual = async () => {
  if (!(await pushSoportado()) || Notification.permission !== "granted") return;
  const token = await obtenerTokenDispositivo();
  if (token) await api.post("/notificaciones/desuscribir", { token });
};

// Al volver a entrar: reactiva el dispositivo si esta misma persona lo había activado
export const registrarDispositivoSilencioso = async (usuarioId) => {
  if (localStorage.getItem(CLAVE_PUSH) !== String(usuarioId)) return;
  if (!(await pushSoportado()) || Notification.permission !== "granted") return;
  const token = await obtenerTokenDispositivo();
  if (token) await api.post("/notificaciones/suscribir", { token });
};