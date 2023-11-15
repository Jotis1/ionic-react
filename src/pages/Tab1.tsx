import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAvatar,
  IonInput,
  IonPopover,
  IonImg,
} from '@ionic/react';

import { Geolocation } from '@capacitor/geolocation';

const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();

  return coordinates.coords;
};

import { UserProps, UserAPIProps, ImageProps } from "../../../lib/types/index";

export default function Tab1() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUsers, setLoaderUsers] = useState(0);
  const [users, setUsers] = useState<UserProps[] | []>([]);
  const [images, setImages] = useState([]);
  const [renderedUsers, setRenderedUsers] = useState<any>([]);
  const [searchResults, setSearchResults] = useState([]);
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });

  const usersUrl = "https://empleados.appsbecallgroup.com/wp-json/jet-cct/empleados";
  const imagesUrl = "https://empleados.appsbecallgroup.com/wp-json/wp/v2/media/?author=1&page="
  const usuario = 'crm';
  const contraseña = '5gtb ygti nVfz O39w tq75 fFjf';
  const authHeader = `Basic ${btoa(`${usuario}:${contraseña}`)}`;


  useEffect(() => {
    getCurrentPosition().then(res => setCoordinates(res));
    fetch(usersUrl, { method: "GET", cache: "default", headers: { Authorization: authHeader } })
      .then(userRes => userRes.json())
      .then((userDoc) => {

        let newUserArray: UserProps | any = [];

        userDoc.forEach((user: UserAPIProps) => {
          newUserArray.push({
            id: user._ID,
            email: user.email,
            tel: user.telefono,
            delegation: user.delegacion,
            name: user.nombre,
            lastname: user.apellidos,
            photoID: user.foto,
            fullname: `${user.nombre} ${user.apellidos}`
          });
        });

        setUsers(newUserArray);

        const imageRequests = Array.from({ length: 30 }, (_, index) =>
          fetch(imagesUrl + (index + 1), { method: "GET", cache: "default" })
            .then(imageRes => imageRes.json())
        );

        Promise.all(imageRequests)
          .then(imageDocs => {
            const newImages = imageDocs.reduce((acc, imagesPage) => {
              imagesPage.forEach((image: ImageProps) => {

                let imageUrl = image?.media_details?.sizes?.thumbnail?.source_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png";
                acc[image.id] = imageUrl;

              });
              return acc;
            }, {});

            setImages(prevImages => ({ ...prevImages, ...newImages }));
          });

      })
  }, []);

  const generateUsers = () => {
    const newUsers: UserAPIProps | any = [];
    for (let i = loadedUsers; i < loadedUsers + 50; i++) {
      const userToAdd: any = {
        id: users[i].id,
        fullname: users[i].fullname,
        name: users[i].name,
        lastname: users[i].lastname,
        photoID: users[i].photoID,
        delegation: users[i].delegation,
        email: users[i].email,
        tel: users[i].tel,
      };

      const userAlreadyExists = renderedUsers.some((existingUser: UserProps) => existingUser.id === userToAdd.id);

      if (!userAlreadyExists) {
        newUsers.push(userToAdd);
      }
    }
    setRenderedUsers([...renderedUsers, ...newUsers]);
    setLoaderUsers((prev) => prev + 50);
  };

  function searchByName(array: UserProps[], cadenaABuscar: any) {
    const res: any = array.filter((object: UserProps) =>
      object.fullname.toLowerCase().includes(cadenaABuscar.toLowerCase())
    );
    setSearchResults(res.length > 0 ? res : []);
  }

  useEffect(() => {
    if (images && users.length > 0) {
      setIsLoading(false);
      generateUsers();
    }
  }, [images]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {coordinates.latitude != 0 && coordinates.longitude != 0 && (
            <IonTitle size="large">Latitud: {coordinates.latitude.toFixed(2)} Longitud: {coordinates.longitude.toFixed(2)}</IonTitle>
          )
          }
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>{ }
            <IonTitle size="large"></IonTitle>
          </IonToolbar>
        </IonHeader>
        {isLoading ? (
          <p>Cargando empleados...</p>
        ) : (

          <>
            <IonItem>
              <IonInput placeholder='Buscar empleado' onIonChange={(e) => searchByName(users, e.detail.value)}></IonInput>
            </IonItem>
            {searchResults && searchResults.length > 0 ? (
              <IonList>
                <>
                  {searchResults.map((user: any, index) => (
                    <IonItem key={index} id={`open-popover-${index}`}>
                      <IonAvatar slot="start">
                        <img src={images[user.photoID] ? images[user.photoID] : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png"} alt="avatar" />
                      </IonAvatar>
                      <IonLabel>{user.fullname}</IonLabel>
                      <IonPopover size="cover" trigger={`open-popover-${index}`}>
                        <IonContent class="ion-padding">
                          <IonList>
                            <IonImg style={{ width: "100%", objectFit: "contain" }} slot="start" src={images[user.photoID] ? images[user.photoID] : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png"}>
                            </IonImg>
                            <IonItem>
                              Nombre: {user.name}
                            </IonItem>
                            <IonItem>
                              Apellido: {user.lastname}
                            </IonItem>
                            <IonItem>
                              Delegación: {user.delegation}
                            </IonItem>
                            <IonItem>
                              Correo: {user.email}
                            </IonItem>
                            <IonItem>
                              Teléfono: {user.tel}
                            </IonItem>
                          </IonList>
                        </IonContent>
                      </IonPopover>
                    </IonItem>
                  ))}
                </>
              </IonList>
            ) : (
              <IonList>
                <>
                  {renderedUsers.map((user: any, index: number) => (
                    <IonItem key={index} id={`open-popover-${index}`}>
                      <IonAvatar slot="start">
                        <img src={images[user.photoID] ? images[user.photoID] : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png"} alt="avatar" />
                      </IonAvatar>
                      <IonLabel>{user.fullname}</IonLabel>
                      <IonPopover size="cover" trigger={`open-popover-${index}`}>
                        <IonContent class="ion-padding">
                          <IonList>
                            <IonImg style={{ width: "100%", objectFit: "contain" }} slot="start" src={images[user.photoID] ? images[user.photoID] : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png"}>
                            </IonImg>
                            <IonItem>
                              Nombre: {user.name}
                            </IonItem>
                            <IonItem>
                              Apellido: {user.lastname}
                            </IonItem>
                            <IonItem>
                              Delegación: {user.delegation}
                            </IonItem>
                            <IonItem>
                              Correo: {user.email}
                            </IonItem>
                            <IonItem>
                              Teléfono: {user.tel}
                            </IonItem>
                          </IonList>
                        </IonContent>
                      </IonPopover>
                    </IonItem>
                  ))}
                </>
              </IonList>
            )}
            <IonInfiniteScroll
              onIonInfinite={(ev) => {
                generateUsers();
                setTimeout(() => ev.target.complete(), 500);
              }}
            >
              <IonInfiniteScrollContent>
              </IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </>
        )}
      </IonContent>
    </IonPage >
  );
}