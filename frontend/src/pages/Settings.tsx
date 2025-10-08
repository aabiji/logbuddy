import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { request, useAuthRequest } from "./../lib/request";
import { useAppState } from "./../lib/state";
import { saveFile } from "../lib/filesystem";

import {
  IonContent, IonPage, IonCheckbox, IonButton, IonIcon,
  IonInput, IonModal, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonInputPasswordToggle, IonSelect, IonSelectOption
} from "@ionic/react";
import ErrorTray from "../ErrorTray";
import "../theme/styles.css";
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

  const possibleTargets = () => ["carbohydrate", "protein", "fat"]
    .filter(t => !Object.keys(settings.macroTargets).includes(t));

  const [startYear, year] = [2025, new Date().getFullYear()];
  const copyrightDate =
    year != startYear ? `${startYear} - ${year}` : `${startYear}`;
  const emailURI = `mailto:${process.env.USER_SUPPORT_EMAIL}?subject=Feedback`;

  const exportData = async () => {
    const json = await authRequest((jwt: string) =>
      request("GET", `/user/data?time=0&ignoreDeleted=false`, undefined, jwt));
    if (json)
      saveFile("logbuddy-export.json", JSON.stringify(json), "application/json");
  }

  useEffect(() => () => {
    authRequest((jwt: string) =>
      request("POST", "/user/settings", { ...settings }, jwt));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ErrorTray />

        <div>
          <div className="horizontal-strip">
            <h4> Meals </h4>
            <IonButton className="icon-btn-square"
              onClick={() => updateSettings({
                mealTags: [...settings.mealTags, "New meal"]
              })}>
              <IonIcon slot="icon-only" color="white" icon={add} />
            </IonButton>
          </div>
          {settings.mealTags.map((_, i) => (
            <div key={i} className="horizontal-strip list-item">
              <IonInput
                value={settings.mealTags[i]} fill="solid"
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

        <hr />

        {/*TODO: replace the dropdown with a add button that'll open a selection modal */}
        <div>
          <div className="horizontal-strip">
            <h4> Macro targets </h4>
            <IonSelect
              label="Add target"
              onIonChange={(event) => {
                const key = event.detail.value;
                updateSettings({
                  macroTargets: { ...settings.macroTargets, [key]: 0 }
                })
              }}>
              {possibleTargets().map((t, i) =>
                <IonSelectOption value={t} key={i}>{t}</IonSelectOption>)}
            </IonSelect>
          </div>

          {Object.keys(settings.macroTargets).map((key, i) => {
            const name = key[0].toUpperCase() + key.slice(1);
            const deletable = key != "calories";
            return (
              <div key={i} className="horizontal-strip list-item">
                <p>{name}</p>
                <IonInput
                  labelPlacement="end"
                  inputMode="numeric" fill="solid"
                  label={deletable ? "g" : ""}
                  value={settings.macroTargets[key]}
                  onIonInput={(event) => updateSettings({
                    macroTargets: {
                      ...settings.macroTargets,
                      [key]: Number(event.detail.value)
                    }
                  })}
                />
                {deletable && (
                  <IonButton fill="clear" onClick={() => {
                    const copy = JSON.parse(JSON.stringify(settings.macroTargets));
                    delete copy[key];
                    updateSettings({ macroTargets: copy });
                  }}>
                    <IonIcon slot="icon-only" color="danger" icon={trash} />
                  </IonButton>
                )}
              </div>
            )})}
        </div>

        <hr />

        <div>
          <h4> General </h4>
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

          <div className="horizontal-strip control-btns">
            <IonButton onClick={exportData}>
              Export all data
            </IonButton>
            <AccountDeletion />
          </div>
        </div>

        <hr />

        <div className="copyright-info">
          <p>© LogBuddy {copyrightDate}, Abigail Adegbiji </p>
          <a href={emailURI}>Send feedback</a>
        </div>
      </IonContent>
    </IonPage>
  );
}
