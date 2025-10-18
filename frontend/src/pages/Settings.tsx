import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { request, useAuthRequest } from "./../lib/request";
import { useAppState } from "./../lib/state";
import { saveFile } from "../lib/filesystem";

import {
  IonContent, IonPage, IonCheckbox, IonButton,
  IonIcon, IonModal, IonItemOption, IonItemOptions,
  IonItem, IonItemSliding
} from "@ionic/react";
import { Input, NotificationTray, Selection } from "../Components";
import { add, trash } from "ionicons/icons";
import "../theme/styles.css";

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

      <IonModal
        className="centered-modal"
        onDidDismiss={() => setShowModal(false)}
        initialBreakpoint={undefined}
        breakpoints={undefined}
        isOpen={showModal}>
        <div>
          <p>
            Once your account is deleted you will <b> NOT </b>
            be able to recover any of your data!
          </p>
          <p>Enter your password to confirm:</p>
          <Input
            inputType="password"
            placeholder="Password"
            value={password}
            setValue={(value: string) => setPassword(value)}
          />
          <IonButton
            color="danger"
            onClick={deleteUser}
            style={{ width: "100%", marginTop: "10px" }}>
            Delete your account
          </IonButton>
        </div>
      </IonModal>
    </div>
  );
}

export default function SettingsPage() {
  const authRequest = useAuthRequest();
  const { settings, updateSettings } = useAppState();

  const possibleMacroTargets = () => ["carbohydrate", "protein", "fat"]
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      authRequest((jwt: string) =>
        request("POST", "/user/settings", { ...settings }, jwt));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <IonPage>
      <IonContent>
        <NotificationTray />

        <div>
          <div className="horizontal-strip">
            <h4> Macro targets </h4>
            <Selection
              selections={possibleMacroTargets()}
              setSelection={(selection: string) =>
                updateSettings({
                  macroTargets: { ...settings.macroTargets, [selection]: 0 }
                })}
            />
          </div>

          {Object.keys(settings.macroTargets).map((key, i) => {
            const name = key[0].toUpperCase() + key.slice(1);
            const deletable = key != "calories";
            return (
              <IonItemSliding key={i}>
                <IonItem>
                  <p style={{ fontSize: "13px" }}>{name}</p>
                  <div style={{ width: "30%", marginLeft: "auto" }}>
                    <Input
                      labelPlacement="end"
                      inputType="number"
                      label={deletable ? "g" : ""}
                      value={settings.macroTargets[key]}
                      setValue={(value: string) => updateSettings({
                        macroTargets: {
                          ...settings.macroTargets,
                          [key]: Number(value)
                        }
                      })}
                    />
                  </div>
                </IonItem>
                {deletable && <IonItemOptions>
                  <IonItemOption
                    color="danger"
                    onClick={() => {
                      const copy = JSON.parse(JSON.stringify(settings.macroTargets));
                      delete copy[key];
                      updateSettings({ macroTargets: copy });
                    }}>
                      <IonIcon aria-hidden="true" icon={trash} />
                    </IonItemOption>
                </IonItemOptions>
                }
              </IonItemSliding>
            )})}
        </div>

        <hr />

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
            <IonItemSliding key={i}>
              <IonItem>
                <Input
                  value={settings.mealTags[i]}
                  setValue={(value: string) => updateSettings({
                    mealTags: [
                      ...settings.mealTags.slice(0, i),
                      value,
                      ...settings.mealTags.slice(i + 1)
                    ]
                  })}
                />
              </IonItem>
              <IonItemOptions>
                <IonItemOption
                  color="danger"
                  onClick={() => updateSettings({
                    mealTags: [
                      ...settings.mealTags.slice(0, i),
                      ...settings.mealTags.slice(i + 1),
                    ]
                  })}>
                  <IonIcon aria-hidden="true" icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </div>

        <hr />

        <div>
          <h4> General </h4>
          <div>
            <IonCheckbox
              className="list-item"
              labelPlacement="end"
              checked={settings.useImperial}
              onIonChange={(event) => updateSettings({
                useImperial: event.detail.checked
              })}>
              Use imperial units
            </IonCheckbox>

            <IonCheckbox
              className="list-item"
              labelPlacement="end"
              checked={settings.darkMode}
              onIonChange={(event) => {
                const checked = event.detail.checked;
                updateSettings({ darkMode: checked });
                document.body.classList.toggle('dark', checked);
              }}>
              Dark mode
            </IonCheckbox>

            <IonCheckbox
              className="list-item"
              labelPlacement="end"
              checked={settings.trackPeriod}
              onIonChange={(event) => updateSettings({
                trackPeriod: event.detail.checked
              })}>
              Enable period tracking feature
            </IonCheckbox>
          </div>

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
