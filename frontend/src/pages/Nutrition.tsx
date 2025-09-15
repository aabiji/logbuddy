import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Nutrition: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Search</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div>
          <p>hello :)</p>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Nutrition;
