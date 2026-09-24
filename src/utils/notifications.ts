/**
 * Web Notifications Helper for Pre-Azan and Azan alerts
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

export function showPreAzanNotification(prayerName: string, minutesRemaining: number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const title = `استعد للصلاة 🕌 (أذان ${prayerName})`;
    const options: ExtendedNotificationOptions = {
      body: `بقي ${minutesRemaining} دقائق على موعد أذان ${prayerName}. أسبغ الوضوء وتجهز للصلاة.`,
      icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&auto=format&fit=crop&q=80',
      badge: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=72&auto=format&fit=crop&q=80',
      tag: `pre-azan-${prayerName}`,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    new Notification(title, options);
  } catch (err) {
    console.warn('Could not display pre-azan notification:', err);
  }
}

export function showAzanNotification(prayerName: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const title = `حان الآن وقت أذان ${prayerName} 🕌`;
    const options: ExtendedNotificationOptions = {
      body: `الله أكبر الله أكبر.. حان الآن موعد صلاة ${prayerName}. حيّ على الصلاة، حيّ على الفلاح.`,
      icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&auto=format&fit=crop&q=80',
      tag: `azan-${prayerName}`,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 500],
    };

    new Notification(title, options);
  } catch (err) {
    console.warn('Could not display azan notification:', err);
  }
}

export function showWitrNotification(timingDescription: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const title = `تذكير بصلاة الوتر وقيام الليل 🌙`;
    const options: ExtendedNotificationOptions = {
      body: `حان موعد صلاة الوتر (${timingDescription}). «إن الله وتر يحب الوتر فأوتروا يا أهل القرآن». لا تفوّت ركعة بين يدي ربك.`,
      icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&auto=format&fit=crop&q=80',
      tag: 'witr-reminder',
      requireInteraction: false,
      vibrate: [250, 100, 250, 100, 400],
    };

    new Notification(title, options);
  } catch (err) {
    console.warn('Could not display witr notification:', err);
  }
}
