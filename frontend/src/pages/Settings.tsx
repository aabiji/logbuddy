import { useEffect } from "react";
import { request, useAuthRequest } from "./../lib/request";
import { useAppState } from "./../lib/state";

import {
  IonContent, IonPage, IonCheckbox, IonButton, IonIcon,
  IonInput,
} from "@ionic/react";
import { add, trash } from "ionicons/icons";

export default function SettingsPage() {
  const authRequest = useAuthRequest();
  const { settings, updateSettings } = useAppState();

  const [startYear, year] = [2025, new Date().getFullYear()];
  const copyrightDate =
    year != startYear ? `${startYear} - ${year}` : `${startYear}`;

  const exportData = async () => {
    try {
      // TODO: get json from api request
      // TODO: save the json to a file
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  const syncSettings = async () => {
    try {
      await authRequest((jwt: string) =>
        request("POST", "/user/settings", { ...settings }, jwt));
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  useEffect(() => () => { syncSettings() }, []);

  return (
    <IonPage>
      <IonContent>
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

        <IonButton color="danger">
          Delete account
        </IonButton>

        <div>
          <p>© LogBuddy {copyrightDate}, Abigail Adegbiji </p>
          <a>Send feedback</a>
        </div>
      </IonContent>
    </IonPage>
  );
}
