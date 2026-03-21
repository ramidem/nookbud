/* eslint-disable import/no-unresolved */
import { API_BASE_URL, IS_LIVE, STORAGE_KEY, SUPABASE_API_KEY } from '@env';
import { Platform } from 'react-native';

const CONFIG = {
  API_BASE_URL: API_BASE_URL as string | undefined,
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',
  IS_LIVE: IS_LIVE,
  STORAGE_KEY: STORAGE_KEY,
  /** Supabase anon/public key — never service_role */
  SUPABASE_ANON_KEY: SUPABASE_API_KEY as string | undefined,
  /** Supabase project URL */
  SUPABASE_URL: API_BASE_URL as string | undefined,
};

export default CONFIG;
