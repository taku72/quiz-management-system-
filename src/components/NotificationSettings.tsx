'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Smartphone,
  Settings,
  Check,
  X
} from 'lucide-react';
import {
  updateNotificationSettings,
  getNotificationSettings,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
  showSystemNotification
} from '@/utils/notificationUtils';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState(getNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setPermissionStatus(permission);
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await showSystemNotification(
        'Test Notification',
        'This is a test notification to verify your settings work correctly!',
        false
      );
    } catch (error) {
      console.error('Test notification failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPermissionText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Not requested';
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="w-5 h-5" />
            <span>Notifications Not Supported</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your browser doesn't support desktop notifications. Try using a modern browser like Chrome, Firefox, or Edge.
          </p>
          {onClose && (
            <div className="mt-4 flex justify-end">
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Notification Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Browser Permission</span>
            <div className="flex items-center space-x-2">
              {getPermissionIcon()}
              <span className="text-sm text-gray-600">{getPermissionText()}</span>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <Button
              onClick={handleRequestPermission}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Request Permission
            </Button>
          )}
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Chat Notifications</h4>

          {/* Enable/Disable Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.enabled ? (
                <Bell className="w-4 h-4 text-blue-500" />
              ) : (
                <BellOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Enable notifications</span>
            </div>
            <button
              onClick={() => handleSettingChange('enabled', !settings.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Sound notifications</span>
            </div>
            <button
              onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
              disabled={!settings.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
              } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Message Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.showPreview ? (
                <Eye className="w-4 h-4 text-blue-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Show message preview</span>
            </div>
            <button
              onClick={() => handleSettingChange('showPreview', !settings.showPreview)}
              disabled={!settings.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showPreview && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
              } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showPreview && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Vibrate on notification</span>
            </div>
            <button
              onClick={() => handleSettingChange('vibrate', !settings.vibrate)}
              disabled={!settings.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.vibrate && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
              } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.vibrate && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Test Notification */}
        <div className="space-y-2">
          <Button
            onClick={handleTestNotification}
            disabled={!settings.enabled || permissionStatus !== 'granted' || isTesting}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isTesting ? 'Testing...' : 'Test Notification'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Click to test your notification settings
          </p>
        </div>

        {/* Action Buttons */}
        {onClose && (
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};