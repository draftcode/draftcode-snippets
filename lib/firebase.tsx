import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider, browserLocalPersistence, getAuth, setPersistence, signInWithPopup, User } from "firebase/auth";
import { Button, Col, Row } from 'antd';
import { ReactNode, useState, useCallback, useEffect } from 'react';

const firebaseConfig = {
    apiKey: "AIzaSyB1w4fjo5XpDFj4p7HVV1Rm38mrlJRedoc",
    authDomain: "draftcode-snippets.firebaseapp.com",
    projectId: "draftcode-snippets",
    storageBucket: "draftcode-snippets.appspot.com",
    messagingSenderId: "376276636995",
    appId: "1:376276636995:web:b1efe9e564d62eb2e38bf6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function getCurrentUser(): User {
    return auth.currentUser!;
};

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
        return <div></div>
    }

    if (!currentUser) {
        return <>
            <Row>
                <Col span={12} offset={6}>
                    <Button type="primary" block onClick={onClick}>Log in</Button>
                </Col>
            </Row>
        </>
    }
    return <div>
        {children}
        <div style={{ position: 'fixed', right: 10, bottom: 0 }}>
            <p>Signed in as {currentUser.email}</p>
        </div>
    </div>;
}
