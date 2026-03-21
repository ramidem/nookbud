/* eslint-disable import/no-unresolved */
import { API_BASE_URL, IS_LIVE, STORAGE_KEY, SUPABASE_ANON_KEY, SUPABASE_URL } from '@env';
import { Platform } from 'react-native';

const CONFIG = {
  API_BASE_URL: API_BASE_URL,
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',
  IS_LIVE: IS_LIVE,
  STORAGE_KEY: STORAGE_KEY,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY as string | undefined,
  SUPABASE_URL: SUPABASE_URL as string | undefined,
};

export default CONFIG;
