"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { ReactNode, useCallback, useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyB1w4fjo5XpDFj4p7HVV1Rm38mrlJRedoc",
  authDomain: "draftcode-snippets.firebaseapp.com",
  projectId: "draftcode-snippets",
  storageBucket: "draftcode-snippets.appspot.com",
  messagingSenderId: "376276636995",
  appId: "1:376276636995:web:b1efe9e564d62eb2e38bf6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function getCurrentUser(): User {
  return auth.currentUser!;
}

export const EnsureAuth = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  const onClick = useCallback(async () => {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, provider);
    setCurrentUser(auth.currentUser);
  }, [setCurrentUser]);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, [setCurrentUser, setIsLoading]);

  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="flex m-4 gap-2 max-w-xl">
        <button
          className="text-center w-full p-3 border border-black rounded"
          onClick={onClick}
        >
          ログイン
        </button>
      </div>
    );
  }
  return (
    <APIProvider apiKey="AIzaSyB1w4fjo5XpDFj4p7HVV1Rm38mrlJRedoc">
      {children}
    </APIProvider>
  );
};
