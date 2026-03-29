/**
 * Firebase configuration
 *
 * @react-native-firebase auto-reads GoogleService-Info.plist (iOS)
 * and google-services.json (Android) — no manual config needed here.
 *
 * Just import the modules you need directly from @react-native-firebase.
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export { auth, firestore, storage };

// Firestore settings — enable offline persistence (default on mobile, explicit here for clarity)
firestore().settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  persistence: true,
});
