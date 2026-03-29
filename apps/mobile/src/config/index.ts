/* eslint-disable import/no-unresolved */
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  IS_LIVE,
  STORAGE_KEY,
} from '@env';
import { Platform } from 'react-native';

const CONFIG = {
  // Firebase config — populated from .env
  FIREBASE_API_KEY: FIREBASE_API_KEY as string | undefined,
  FIREBASE_APP_ID: FIREBASE_APP_ID as string | undefined,
  FIREBASE_MESSAGING_SENDER_ID: FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  FIREBASE_PROJECT_ID: FIREBASE_PROJECT_ID as string | undefined,
  FIREBASE_STORAGE_BUCKET: FIREBASE_STORAGE_BUCKET as string | undefined,
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',
  IS_LIVE: IS_LIVE,
  STORAGE_KEY: STORAGE_KEY,
};

export default CONFIG;
