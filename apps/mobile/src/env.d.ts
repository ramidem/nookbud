/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@env' {
  export const IS_LIVE: any;
  export const STORAGE_KEY: any;
  /** Firebase config */
  export const FIREBASE_API_KEY: any;
  export const FIREBASE_APP_ID: any;
  export const FIREBASE_PROJECT_ID: any;
  export const FIREBASE_STORAGE_BUCKET: any;
  export const FIREBASE_MESSAGING_SENDER_ID: any;
}
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.config';
declare module 'twrnc';
