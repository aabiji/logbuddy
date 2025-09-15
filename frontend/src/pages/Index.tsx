import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Index: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Main page</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Main page</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div>
          <p className="text-red-500">hello :) -- main page</p>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Index;
