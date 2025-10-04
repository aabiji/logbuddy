import { useState } from 'react';
import { useHistory } from 'react-router';
import { request } from '../lib/request';

import {
  IonButton, IonContent, IonPage, IonInput, IonInputPasswordToggle,
} from '@ionic/react';
import { useAppState } from '../lib/state';

export default function AuthPage() {
  const history = useHistory();
  const { updateTokens } = useAppState();

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
        const endpoint = isLogin ? "/user/login" : "/user/new";
        const json = await request("POST", endpoint, { email, password }, undefined);
        updateTokens(json.mainToken, json.refreshToken);
        history.replace("/");
      } catch (err: any) {
        const msg = err.message[0].toUpperCase() + err.message.slice(1);
        setError(err.statusCode !== 500 ? msg : "Failed to connect to server");
      }
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div>
          <h1>logbuddy</h1>

          <IonInput
            type="email"
            placeholder="Email"
            value={email}
            onIonInput={(event) => setEmail(event.detail.value as string)}
          />

          <IonInput
            type="password"
            placeholder="Password"
            value={password}
            onIonInput={(event) => setPassword(event.detail.value as string)}>
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
          </IonInput>

          <IonButton expand="full" size="default" onClick={authenticate}>
            {isLogin ? "Login" : "Create account"}
          </IonButton>

          {error !== undefined &&
            <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

          <IonButton fill="clear"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Create account" : "Login"}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
