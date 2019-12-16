import React, {useState, useEffect, useMemo} from 'react';
import ReactMapGL from 'react-map-gl';
import Timebar from '@globalfishingwatch/map-components/components/timebar'

const defaultMapStyle = {
  "version": 8,
  "name": "Blank",
  "center": [0, 0],
  "zoom": 1,
  "bearing": 0,
  "pitch": 0,
  "sources": {
    "countries": {
      "type": "geojson",
      "data": 'https://gist.githubusercontent.com/nerik/512ff38b8b5f254c89b3e2541af5157e/raw/22f0555c8c5896874fe40111affa4290f2374ebb/countries.json'
    },
    "heatmap-playback": {
      type: "vector",
      // tiles: ['http://34.69.224.29/v1/fishing_hour/heatmap/{z}/{x}/{y}'],
      // tiles: ['http://34.69.224.29/v1/fishing/heatmap/{z}/{x}/{y}'],
      // tiles: ['http://34.69.224.29/v1/fishing/heatmap/{z}/{x}/{y}?filters=flag==\'ESP\' and timestamp > \'2019-12-01T00:00:00\''],
      tiles: ['http://heatmap/{z}/{x}/{y}'],
    },
  },
  "layers": [
      {
        "id": "background",
        "type": "background",
        "paint": {"background-color": "#0A1738"}
      },
      {
        "id": "countries",
        "type": "line",
        "source": "countries",
        "layout": {},
        "paint": {
          "line-color": "white"
        }
      },
      {
        id: 'heatmap-playback-circle',
        type: 'circle',
        source: 'heatmap-playback',
        "source-layer": 'fishing',
        "paint": {
          "circle-radius": 0,
          "circle-opacity": 1,
          "circle-color": "hsl(100, 100%, 50%)",
          "circle-stroke-width": 0,
          "circle-stroke-color": "hsl(0, 0%, 0%)"
        },
        // filter: ['has', new Date('2019-01-02T00:00:00+00:00').toISOString()]
        // filter: ['has', '18136']
      }
  ]
}


// componentDidMount() {
//   navigator.serviceWorker.ready.then(() => {
//     console.log('From app: service worker is ready')
//     this.setState({ serviceWorkerReady: true })
//   })
//   navigator.serviceWorker.addEventListener('message', (event) => {
//     console.log('From app: received message from worker', event)
//   })
//   // setTimeout(() => {
//   //   fetch('https://gist.githubusercontent.com/nerik/96dd9747b5e1464f172cf2addf7f1185/raw/a14b5da8eb60cd5cf2c3c51788633174096ddec4/map.geojson')
//   //   .then(() => {
//   //     console.log('I Fetched a thing...')
//   //   })
//   // }, 5000);
// }

const Map = () => {
  // wait for SW to be ready, otherwise there's a race condition
  // between SW install and map first render (=first tiles fetches don't get intercepted)
  useEffect(() => {
    navigator.serviceWorker.ready.then(() => {
      console.log('From app: service worker is ready')
      setServiceWorkerReady(true)
    })
  }, [])
  const [dates, setDates] = useState({ start: '2019-01-01T00:00:00.000Z', end: '2019-04-01T00:00:00.000Z' });
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 1000,
    latitude: -50,
    longitude: -60,
    zoom: 3.5
  })
  const style = useMemo(() => {
    const startTimestampMs = new Date(dates.start).getTime()
    const startTimestampDays = Math.round(startTimestampMs / 1000 / 60 / 60 / 24)
    const s = { ...defaultMapStyle }
    // s.layers[2].filter = ['has', startTimestampDays.toString()]
    s.layers[2].paint['circle-radius'] = ["to-number", ['get', startTimestampDays.toString()]]
    // s.layers[2].paint['circle-radius'] = ["case", ["has", startTimestampDays.toString()], 3, 0]
    return s
  }, [dates])


  return (serviceWorkerReady) && (<>
    <ReactMapGL
      {...viewport}
      onViewportChange={(viewport) => setViewport(viewport)}
      mapStyle={style}
      onClick={(e) => {
        console.log(e)
      }}
    />
    <Timebar
      enablePlayback
      start={dates.start}
      end={dates.end}
      absoluteStart={'2019-01-01T00:00:00.000Z'}
      absoluteEnd={'2020-01-01T00:00:00.000Z'}
      onChange={(start, end) => { setDates({
        start,
        end
      }) }}
    />
  </>)
}


export default Map