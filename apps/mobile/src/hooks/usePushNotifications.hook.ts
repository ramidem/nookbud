import { useEffect } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';
import { checkNotifications, requestNotifications, RESULTS } from 'react-native-permissions';

import { Alert } from '@/components/atoms';
import { LogService } from '@/services/log.service';
import { useLocalStorageStore } from '@/stores/local-storage.store';

function showEnableNotificationsAlert() {
  Alert.info({
    actions: [
      { label: 'Later', variant: 'cancel' },
      { label: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
    message: 'Enable notifications to stay updated with important alerts and messages.',
    title: 'Notifications Disabled',
  });
}

function isGranted(status: string): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

// TODO: Implement once @react-native-firebase/messaging is installed
async function registerFcmToken() {
  LogService.debug('push', 'registerFcmToken: Firebase messaging not configured yet');
}

// TODO: Implement once @react-native-firebase/messaging is installed
async function removeFcmToken() {
  LogService.debug('push', 'removeFcmToken: Firebase messaging not configured yet');
}

function syncPushNotificationState(status: string) {
  useLocalStorageStore.getState().setPushNotificationsEnabled(isGranted(status));
}

export async function requestPushNotification() {
  const { status } = await checkNotifications();
  syncPushNotificationState(status);

  if (isGranted(status)) {
    await registerFcmToken();

    return;
  }

  const { status: requestStatus } = await requestNotifications([]);

  if (isGranted(requestStatus)) {
    syncPushNotificationState(requestStatus);
    await registerFcmToken();

    return;
  }

  const isBlocked = status === RESULTS.BLOCKED || requestStatus === RESULTS.BLOCKED;
  if (isBlocked) {
    showEnableNotificationsAlert();
  }
}

async function handleAppForeground() {
  const { status } = await checkNotifications();
  syncPushNotificationState(status);

  if (!isGranted(status)) {
    return;
  }

  await registerFcmToken();
}

export async function removeCurrentFcmToken(): Promise<void> {
  try {
    await removeFcmToken();
  } catch (error) {
    LogService.error('push', 'Failed to remove FCM token', { error: String(error) });
  }
}

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        return;
      }

      handleAppForeground().catch((error) => {
        LogService.error('push', 'Failed to check notification permission on foreground', {
          error: String(error),
        });
      });
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);
}
