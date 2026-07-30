import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const defaultRole = user.email === 'arrudamaty@gmail.com' ? 'admin' : 'customer';
      await setDoc(userDocRef, {
        email: user.email || "",
        role: defaultRole,
        createdAt: new Date().toISOString()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Email/Password", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update auth displayName
    await updateProfile(user, { displayName: name });
    
    // Create user object in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const defaultRole = email === 'arrudamaty@gmail.com' ? 'admin' : 'customer';
    await setDoc(userDocRef, {
      email: email,
      role: defaultRole,
      createdAt: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    console.error("Error signing up with Email/Password", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("sz_mock_user");
  localStorage.removeItem("sz_mock_profile");
  return auth.signOut();
};
