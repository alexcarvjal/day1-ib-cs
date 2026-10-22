// Thin wrapper around Firebase Auth (Google sign-in) and Firestore (one document per user).
// Loaded only when js/config.js has an apiKey.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged,
  signInWithPopup, signInWithRedirect, getRedirectResult, signOut,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

export function createCloud(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // Completes a redirect sign-in if the popup was blocked on a previous attempt.
  getRedirectResult(auth).catch((e) => console.warn('Redirect sign-in failed', e));

  return {
    onUser(callback) {
      return onAuthStateChanged(auth, callback);
    },
    async signIn() {
      try {
        await signInWithPopup(auth, provider);
      } catch (e) {
        if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw e;
      }
    },
    signOut() {
      return signOut(auth);
    },
    async load(uid) {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : null;
    },
    save(uid, data) {
      return setDoc(doc(db, 'users', uid), data);
    },
  };
}
