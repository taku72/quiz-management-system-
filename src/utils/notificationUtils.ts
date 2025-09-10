export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
}

export type SystemEventType =
  | 'chat-message'
  | 'quiz-attempt'
  | 'user-registration'
  | 'quiz-created'
  | 'admin-action'
  | 'system-alert';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  title: string;
  message: string;
  userId?: string;
  username?: string;
  timestamp: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  showPreview: boolean;
  vibrate: boolean;
}

class NotificationManager {
  private settings: NotificationSettings = {
    enabled: true,
    soundEnabled: true,
    showPreview: true,
    vibrate: true
  };

  private audioContext: AudioContext | null = null;
  private lastNotificationTime = 0;
  private readonly NOTIFICATION_COOLDOWN = 2000; // 2 seconds between notifications

  constructor() {
    this.loadSettings();
    this.initializeAudio();
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-notification-settings');
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Failed to load notification settings:', error);
        }
      }
    }
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-notification-settings', JSON.stringify(this.settings));
    }
  }

  private initializeAudio() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.settings.enabled) {
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Prevent notification spam
    const now = Date.now();
    if (now - this.lastNotificationTime < this.NOTIFICATION_COOLDOWN) {
      return null;
    }
    this.lastNotificationTime = now;

    try {
      // Play sound if enabled
      if (this.settings.soundEnabled) {
        this.playNotificationSound();
      }

      // Vibrate if enabled and supported
      if (this.settings.vibrate && 'vibrate' in navigator) {
        navigator.vibrate(200);
      }

      const notificationOptions: NotificationOptions & {
        icon?: string;
        badge?: string;
        tag?: string;
        requireInteraction?: boolean;
        silent?: boolean;
      } = {
        ...options,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'chat-message',
        requireInteraction: options.requireInteraction || false,
        silent: !this.settings.soundEnabled
      };

      const notification = new Notification(
        this.settings.showPreview ? options.title : 'New Message',
        {
          body: this.settings.showPreview ? options.body : 'You have a new message',
          icon: notificationOptions.icon,
          badge: notificationOptions.badge,
          tag: notificationOptions.tag,
          requireInteraction: notificationOptions.requireInteraction,
          silent: notificationOptions.silent,
          data: options.data
        }
      );

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  private playNotificationSound() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Convenience functions
export const requestNotificationPermission = () => notificationManager.requestPermission();

export const showChatNotification = async (
  senderName: string,
  message: string,
  roomName?: string
) => {
  const title = roomName ? `${senderName} in ${roomName}` : senderName;
  const body = message.length > 100 ? `${message.substring(0, 100)}...` : message;

  return notificationManager.showNotification({
    title,
    body,
    tag: `chat-${roomName || 'general'}`,
    data: {
      type: 'chat-message',
      sender: senderName,
      room: roomName,
      timestamp: Date.now()
    }
  });
};

export const showSystemEventNotification = async (event: SystemEvent) => {
  const settings = notificationManager.getSettings();

  // Check if this type of notification is enabled
  if (!settings.enabled) return null;

  let title = event.title;
  let body = event.message;
  let requireInteraction = false;
  let icon = '/favicon.ico';

  // Customize based on event type
  switch (event.type) {
    case 'quiz-attempt':
      title = `📝 ${event.username} completed a quiz`;
      body = `Quiz: ${event.data?.quizTitle || 'Unknown'} | Score: ${event.data?.score || 0}%`;
      icon = '/quiz-icon.png';
      break;

    case 'user-registration':
      title = `👤 New user registered`;
      body = `${event.username} joined the platform`;
      requireInteraction = true; // Important for admins
      break;

    case 'quiz-created':
      title = `📚 New quiz created`;
      body = `${event.username} created "${event.data?.quizTitle || 'New Quiz'}"`;
      break;

    case 'admin-action':
      title = `⚡ Admin action performed`;
      body = event.message;
      requireInteraction = event.priority === 'urgent';
      break;

    case 'system-alert':
      title = `🚨 System Alert`;
      body = event.message;
      requireInteraction = event.priority === 'urgent' || event.priority === 'high';
      break;

    default:
      title = event.title;
      body = event.message;
  }

  return notificationManager.showNotification({
    title,
    body,
    icon,
    tag: `system-${event.type}`,
    requireInteraction,
    data: {
      type: event.type,
      eventId: event.id,
      userId: event.userId,
      timestamp: event.timestamp,
      priority: event.priority,
      ...event.data
    }
  });
};

export const showSystemNotification = async (
  title: string,
  message: string,
  urgent = false
) => {
  return notificationManager.showNotification({
    title,
    body: message,
    tag: 'system-notification',
    requireInteraction: urgent,
    data: {
      type: 'system',
      urgent,
      timestamp: Date.now()
    }
  });
};

export const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
  notificationManager.updateSettings(settings);
};

export const getNotificationSettings = () => notificationManager.getSettings();

export const isNotificationSupported = () => notificationManager.isSupported();

export const getNotificationPermissionStatus = () => notificationManager.getPermissionStatus();