import { useState } from 'react';
import { request } from '../lib/utils';

import {
  IonButton, IonContent, IonPage, IonInput, IonInputPasswordToggle,
} from '@ionic/react';

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<undefined | string>(undefined);

  const authenticate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).*$/;;

    if (!emailRegex.test(email))
      setError("Invalid email");
    else if (!passwordRegex.test(password))
      setError("Password must contain at least 1 number and uppercase");
    else  {
      setError(undefined);

      try {
        const json = request("POST", "/auth/login", {email, password}, undefined);
        console.log(json.refreshToken, json.mainToken);
      } catch (err: any) {
        setError(err.statusCode !== 500 ? err.message : "Failed to connect to server");
      }
    }
  }

  return (
    <IonPage>
      <IonContent>

        <IonInput
          slot="start"
          type="email"
          placeholder="Email"
          value={email}
          onIonChange={(event) => setEmail(event.detail.value as string)}
        />

        <IonInput
          type="password"
          placeholder="Password"
          value={password}
          onIonChange={(event) => setPassword(event.detail.value as string)}>
          <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
        </IonInput>

          <IonButton size="default" onClick={authenticate}>
            {isLogin ? "Login" : "Create account"}
          </IonButton>

        {error !== undefined &&
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <p onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Create account" : "Login"}</p>

      </IonContent>
    </IonPage>
  );
};
