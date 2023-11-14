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
} from '@ionic/react';
import axios from 'axios';

import './Tab1.css';

const Tab1: React.FC = () => {
  const [empleados, setEmpleados] = useState([]);
  const [imagenes, setImagenes] = useState({});
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const ionInfiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  const fetchData = async () => {
    try {
      const usuario = 'crm';
      const contraseña = '5gtb ygti nVfz O39w tq75 fFjf';
      const authHeader = `Basic ${btoa(`${usuario}:${contraseña}`)}`;

      const response = await axios.get(`https://empleados.appsbecallgroup.com/wp-json/jet-cct/empleados`, {
        headers: {
          Authorization: authHeader,
        },
      });

      var data = response.data;
      const requests = Array.from({ length: 30 }, (_, i) =>
        axios.get(`https://empleados.appsbecallgroup.com/wp-json/wp/v2/media/?author=1&page=${i + 1}`)
      );

      var obj = {};
      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        response.data.forEach((e: any) => {
          obj[e.id] = e.source_url;
        });
      });

      setImagenes(obj)

      const newItems: any = [];
      for (let i = 0; i < 50; i++) {
        newItems.push(data[i]);
      }

      setCurrentPage(50);
      setItems(data);
      setEmpleados((prevEmpleados): any => [...prevEmpleados, ...newItems]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  function buscarPorNombre(array: [], cadenaABuscar: string) {

    const resultados = array.filter(objeto =>
      objeto.nombre.toLowerCase().includes(cadenaABuscar.toLowerCase()
      )
    );

    setResultadosBusqueda(resultados.length > 0 ? resultados : undefined);
    console.log(resultadosBusqueda)
  }

  useEffect(() => {
    fetchData();
  }, []);


  const loadMoreData = async (ev: any) => {
    console.log("Fin, página: " + currentPage + ", cargando: " + loading)
    if (!loading) {
      setLoading(true);
      const newItems: any = [];
      for (let i = currentPage; i < currentPage + 50; i++) {
        newItems.push(items[i]);
      };
      setCurrentPage((prev) => prev + 50);
      setEmpleados((prevEmpleados): any => [...prevEmpleados, ...newItems]);
      setLoading(false);
      ev.target.complete()
    };
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Inicio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem>
          <IonInput placeholder='Buscar empleado' onIonChange={(e) => buscarPorNombre(empleados, e.detail.value)}></IonInput>
        </IonItem>
        <IonList>
          {resultadosBusqueda.length > 0 ? (
            <>
              {resultadosBusqueda.map((empleado, index) => (
                <IonItem key={index}>
                  <IonAvatar slot="start">
                    <img src={imagenes[empleado.foto]} alt="avatar" />
                  </IonAvatar>
                  <IonLabel>{empleado.nombre} {empleado.apellidos}</IonLabel>
                </IonItem>
              ))}
            </>
          ) : (
            <>
              {empleados.map((empleado, index) => (
                <IonItem key={index}>
                  <IonAvatar slot="start">
                    <img src={imagenes[empleado.foto]} alt="avatar" />
                  </IonAvatar>
                  <IonLabel>{empleado.nombre} {empleado.apellidos}</IonLabel>
                </IonItem>
              ))}
            </>
          )}
        </IonList>

        <IonInfiniteScroll
          threshold="100px"
          disabled={loading}
          ref={ionInfiniteScrollRef}
          onIonInfinite={(ev) => loadMoreData(ev)}
        >
          <IonInfiniteScrollContent loadingText="Cargando más empleados..." />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage >
  );
};

export default Tab1;
