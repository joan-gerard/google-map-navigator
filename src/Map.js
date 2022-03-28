import { useCallback, useState, useRef } from 'react';
import './Map.css';
import {
  // LoadScript,
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'
// import { AppBar, Toolbar, Typography, InputBase, Box } from '@material-ui/core';
// import SearchIcon from '@material-ui/icons/Search';


const center = { lat: 59.3293, lng: 18.0686 }
const libraries = ['places']

export const Map = () => {

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  const originRef = useRef();
  const destinationRef = useRef();
  const extraStopRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
    libraries
  })

  const onLoad = useCallback((mapInstance) => {
    const bounds = new window.google.maps.LatLngBounds();
    mapInstance.fitBounds(bounds);
    setMap(map)
  }, [isLoaded, directionsResponse])

  const onUnmount = useCallback((map) => setMap(null), [setMap]);

  const calculateRoute = async (e) => {
    e.preventDefault()
    console.log('ORIGIN:', originRef.current.value)
    console.log('DESTINATION:', destinationRef.current.value)
    console.log('EXTRA:', extraStopRef.current.value)
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return
    }
    try {
      if (!extraStopRef.current.value) {

        const directionsService = new window.google.maps.DirectionsService()

        const results = await directionsService.route({
          origin: originRef.current.value,
          // waypoints: extraStopRef.current.value,
          destination: destinationRef.current.value,
          travelMode: "DRIVING",
        },
          // (result, status) => {
          //   if (status === window.google.maps.DirectionsStatus.OK) {
          //     debugger
          //     console.log('result OK ', {result, status})
          //   } else {
          //     debugger
          //     console.error(`error fetching directions ${result}`);
          //   }
          // }
        )
        setDirectionsResponse(results)
        console.log('####', results)
        setDistance(results.routes[0].legs[0].distance.text)
        setDuration(results.routes[0].legs[0].duration.text)
      }


    } catch (error) {
      console.log(error)
    }
  }

  // const clearRoute = () => {
  //   setDirectionsResponse(null)
  //   setDistance('')
  //   setDuration('')
  //   originRef.current.value = ''
  //   destinationRef.current.value = ''
  // }

  return isLoaded ? (
    <>
      <form>
        <Autocomplete>
          <input type="text" placeholder="Origin" ref={originRef} />
        </Autocomplete>
        <Autocomplete>
          <input type="text" placeholder="Destination" ref={destinationRef} />
        </Autocomplete>
        <Autocomplete>
          <input type="text" placeholder="Waypoint" ref={extraStopRef} />
        </Autocomplete>
        <button onClick={calculateRoute}>Get Route</button>
        <p>Distance: {distance}</p>
        <p>Duration: {duration}</p>
      </form>
      <GoogleMap
        center={center}
        zoom={20}
        mapContainerStyle={{ width: '100vw', height: '100vh' }}
        onLoad={onLoad}
        onUnmount={onUnmount}>
        <Marker position={center} />
        {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
      </GoogleMap>
    </>
  ) : <></>
}
