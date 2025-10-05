import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { request, useAuthRequest } from "./../lib/request";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonCheckbox, IonButton, IonIcon,
  IonInput, IonModal, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonInputPasswordToggle
} from "@ionic/react";
import ErrorTray from "../ErrorTray";
import { add, trash } from "ionicons/icons";

function AccountDeletion() {
  const history = useHistory();
  const authRequest = useAuthRequest();
  const { resetState } = useAppState();

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");

  const deleteUser = async () => {
    const response = await authRequest((jwt: string) =>
      request("DELETE", `/user/delete?password=${password}`, undefined, jwt));
    if (response === undefined) return;
    resetState();
    history.replace("/auth");
  }

  return (
    <div>
      <IonButton color="danger" onClick={() => setShowModal(true)}>
        Delete account
      </IonButton>

      <IonModal isOpen={showModal}>
        <IonHeader mode="ios" className="ion-no-border">
          <IonToolbar>
            <IonTitle>Are you sure?</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>
            Once your account is deleted
            <b> YOU WILL NOT </b>
            be able to recover any of your data!
          </p>
          <p>Enter your password to confirm:</p>
          <IonInput
            type="password"
            placeholder="Password"
            value={password}
            onIonInput={(event) => setPassword(event.detail.value as string)}>
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
          </IonInput>

          <IonButton color="danger" onClick={deleteUser}>
            Delete your account
          </IonButton>
        </IonContent>
      </IonModal>
    </div>
  );
}

export default function SettingsPage() {
  const authRequest = useAuthRequest();
  const { settings, updateSettings } = useAppState();

  const [startYear, year] = [2025, new Date().getFullYear()];
  const copyrightDate =
    year != startYear ? `${startYear} - ${year}` : `${startYear}`;
  const emailURI = `mailto:${process.env.USER_SUPPORT_EMAIL}?subject=Feedback`;

  const exportData = async () => {
    // TODO: get json from api request
    // TODO: save the json to a file
  }

  useEffect(() => () => {
    authRequest((jwt: string) =>
      request("POST", "/user/settings", { ...settings }, jwt));
  }, []);

  return (
    <IonPage>
      <IonContent>
        <ErrorTray />
        <h1>Settings</h1>

        <IonCheckbox
          labelPlacement="end"
          checked={settings.useImperial}
          onIonChange={(event) => updateSettings({
            useImperial: event.detail.checked
          })}>
          Use imperial units
        </IonCheckbox>

        <IonCheckbox
          labelPlacement="end"
          checked={settings.trackPeriod}
          onIonChange={(event) => updateSettings({
            trackPeriod: event.detail.checked
          })}>
          Enable period tracking feature
        </IonCheckbox>

        <div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <h3> Meals </h3>
            <IonButton
              fill="clear"
              onClick={() => updateSettings({
                mealTags: [...settings.mealTags, "New meal"]
              })}>
              <IonIcon slot="icon-only" color="primary" icon={add} />
            </IonButton>
          </div>
          {settings.mealTags.map((_, i) => (
            <div key={i}>
              <IonInput
                value={settings.mealTags[i]}
                onIonInput={(event) => updateSettings({
                  mealTags: [
                    ...settings.mealTags.slice(0, i),
                    event.detail.value as string,
                    ...settings.mealTags.slice(i + 1)
                  ]
                })}
              />
              <IonButton fill="clear" onClick={() => updateSettings({
                mealTags: [
                  ...settings.mealTags.slice(0, i),
                  ...settings.mealTags.slice(i + 1),
                ]
              })}>
                <IonIcon slot="icon-only" color="danger" icon={trash} />
              </IonButton>
            </div>
          ))}
        </div>

        {/*<div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <h3> Macro targets </h3>
            <IonButton fill="clear">
              <IonIcon slot="icon-only" color="primary" icon={add} />
            </IonButton>
          </div>
          {Object.keys(settings.macroTargets).map((key, i) => {
            const name = key[0].toUpperCase() + key.slice(1);
            const deletable = key != "calories";
            return (
              <div key={i}>
                <p>{name}</p>
                <IonInput
                  labelPlacement="end"
                  inputMode="numeric"
                  label={deletable ? "calories" : "g"}
                  value={settings.macroTargets[key]}
                  onIonInput={(event) => updateSettings({
                    macroTargets: {
                      ...settings.macroTargets,
                      [key]: Number(event.detail.value)
                    }
                  })}
                />
                {deletable && (
                  <IonButton onClick={() => {
                    const copy = JSON.parse(JSON.stringify(settings.macroTargets));
                    delete copy[key];
                    updateSettings({ macroTargets: copy });
                  }}>
                    <IonIcon slot="icon-only" color="danger" icon={trash} />
                  </IonButton>
                )}
              </div>
            )})}
        </div>*/}

        <IonButton onClick={exportData}>
          Export all data
        </IonButton>

        <AccountDeletion />

        <div>
          <p>© LogBuddy {copyrightDate}, Abigail Adegbiji </p>
          <a href={emailURI}>Send feedback</a>
        </div>
      </IonContent>
    </IonPage>
  );
}
