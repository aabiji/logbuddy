import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonButtons, IonItem, IonList,
  IonLabel, IonBackButton, IonIcon, IonInput,
  IonButton
} from '@ionic/react';
import { add, search } from 'ionicons/icons';

function Nutrition() {
  const results = [
    {name: "food name", info: "small tidbit"}
  ]

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Search</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Search</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonItem>
          <IonInput placeholder="Search food"></IonInput>
          <IonButton size="default" fill="clear">
            <IonIcon item-right slot="icon-only" color="blue"icon={search}></IonIcon>
          </IonButton>
        </IonItem>

        <IonList>
          {results.map((r, i) => (
            <IonItem key={i}>
              <IonLabel>
                <h2>{r.name}</h2>
                <p>{r.info}</p>
              </IonLabel>

              <IonButton shape="round" size="large" fill="clear">
                <IonIcon slot="icon-only" color="success"icon={add}></IonIcon>
              </IonButton>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Nutrition;
