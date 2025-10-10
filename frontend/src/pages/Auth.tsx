import { useState } from 'react';
import { useHistory } from 'react-router';
import { request } from '../lib/request';
import { useAppState, UserDataUpdate } from '../lib/state';

import {
  IonButton, IonContent, IonPage, IonInput, IonInputPasswordToggle,
} from '@ionic/react';
import "../theme/styles.css";

export default function AuthPage() {
  const history = useHistory();
  const { lastSyncTime, updateToken, updateUserData } = useAppState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<undefined | string>(undefined);

  const authenticate = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

    if (!emailRegex.test(email))
      setError("Invalid email");
    else if (!passwordRegex.test(password) && !isLogin)
      setError("Password must contain at least 1 number and special character");
    else {
      setError(undefined);

      try {
        let endpoint = isLogin ? "/user/login" : "/user/new";
        const tokenJson =
          await request("POST", endpoint, { email, password }, undefined) as { token: string; };
        updateToken(tokenJson.token);

        endpoint = `/user/data?time=${lastSyncTime}&ignoreDeleted=false`;
        const json =
          await request("GET", endpoint, undefined, tokenJson.token) as UserDataUpdate;
        updateUserData(json);

        history.replace("/exercise");
      } catch (err: any) {
        const msg = err.message[0].toUpperCase() + err.message.slice(1);
        setError(err.statusCode !== 500 ? msg : "Failed to connect to server");
      }
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div className="auth-box">
          <h1>LogBuddy</h1>
          {error !== undefined && <p className='error-message'>{error}</p>}

          <IonInput
            value={email}
            type="email" placeholder="Email" fill="outline"
            onIonInput={(event) => setEmail(event.detail.value as string)}
          />

          <IonInput
            value={password}
            type="password" placeholder="Password" fill="outline"
            onIonInput={(event) => setPassword(event.detail.value as string)}>
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
          </IonInput>

          <IonButton expand="full" size="default"  shape="round"onClick={authenticate}>
            {isLogin ? "Login" : "Create account"}
          </IonButton>

          <p className="auth-toggle" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Create account" : "Login"}
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};
