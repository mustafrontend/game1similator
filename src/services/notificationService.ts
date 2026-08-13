export class NotificationService {
  public static async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
    return false;
  }

  public static sendPush(title: string, body: string) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification(title, {
                body,
                tag: 'vl-notification-' + Date.now(),
                vibrate: [200, 100, 200]
              } as NotificationOptions);
            });
          } else {
            new Notification(title, { body });
          }
        } catch (e) {
          console.warn('Native notification error:', e);
        }
      }
    }
  }
}
