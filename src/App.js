import React, {useState, useEffect, useMemo} from 'react';
import ReactMapGL from 'react-map-gl';
import Timebar from '@globalfishingwatch/map-components/components/timebar'
// import { useThrottle } from 'use-throttle';

const baseIntensity = .02
const baseRadius = 35

const OFFSET = new Date('2019-01-01T00:00:00.000Z').getTime() / 1000 / 60 / 60 / 24

const heatmapColor = [
  "interpolate",
  ["linear"],
  ["heatmap-density"],
  0,"rgba(0, 0, 255, 0)",
  0.1,"#0c276c",
  0.25,"#3B9088",
  0.4,"#EEFF00",
  1,"#ffffff"
]



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
      "data": 'https://gist.githubusercontent.com/nerik/512ff38b8b5f254c89b3e2541af5157e/raw/22f0555c8c5896874fe40111affa4290f2374ebb/countries.json',
    },
    "composite": {
      "url": "mapbox://satellitestudio-nerik.dy3yrxjz",
      "type": "vector",
    },
    "heatmap-playback-point": {
      type: "vector",
      // tiles: ['http://34.69.224.29/v1/fishing_hour/heatmap/{z}/{x}/{y}'],
      // tiles: ['http://34.69.224.29/v1/fishing/heatmap/{z}/{x}/{y}'],
      // tiles: ['http://34.69.224.29/v1/fishing/heatmap/{z}/{x}/{y}?filters=flag==\'ESP\' and timestamp > \'2019-12-01T00:00:00\''],
      tiles: ['http://heatmap/{z}/{x}/{y}?geomType=point'],
    },
    "heatmap-playback-square": {
      type: "vector",
      tiles: ['http://heatmap/{z}/{x}/{y}?geomType=square'],
    },
  },
  "layers": [
      {
        "id": "background",
        "type": "background",
        "paint": {"background-color": "#0a1738"}
      },
      {
        "id": "heatmap-playback-square",
        "type": "fill",
        "source": "heatmap-playback-square",
        "source-layer": 'fishing',
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-opacity": 0.99, // forces layer to render in translucent pass - https://github.com/mapbox/mapbox-gl-js/issues/5831
          "fill-color": "red"
        }
      },
      {
        "id": "heatmap-playback",
        "type": "heatmap",
        source: 'heatmap-playback-point',
        "source-layer": 'fishing',
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          'heatmap-color' : heatmapColor,
          'heatmap-radius': [
            "interpolate",
            [ "exponential", 2 ],
            [ "zoom" ],
            0,
            baseRadius,
            16,
            baseRadius * 256
          ],
          'heatmap-intensity': [
            "interpolate",
            [ "exponential", 2 ],
            [ "zoom" ],
            0,
            baseIntensity,
            16,
            16 * baseIntensity
          ],
          'heatmap-intensity-transition': {
              "duration": 0,
              "delay": 0
          },
          'heatmap-opacity': [
            "interpolate",
            ["linear"],
            [ "zoom" ],
            0,
            1,
            8,
            1,
            10,
            0
          ],
          'heatmap-weight' : 1
        }
      },
      {
        id: 'heatmap-playback-circle',
        type: 'circle',
        source: 'heatmap-playback-point',
        "source-layer": 'fishing',
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "circle-radius": 2,
          "circle-opacity": 1,
          "circle-color": "hsla(0, 0%, 0%, 0)",
          "circle-stroke-width": .5,
          "circle-stroke-color": "hsl(100, 100%, 50%)"
        },
        // filter: ['has', new Date('2019-01-02T00:00:00+00:00').toISOString()]
        // filter: ['has', '18136']
      },
      // {
      //   "id": "countries",
      //   "type": "fill",
      //   "source": "countries",
      //   "layout": {},
      //   "paint": {
      //     "fill-outline-color": "#0a1738",
      //     "fill-opacity": 0.99, // forces layer to render in translucent pass - https://github.com/mapbox/mapbox-gl-js/issues/5831
      //     "fill-color": "#374a6d"
      //   }
      // },
      {
          "id": "gshhs-f-l1-full-res-shoreline-2eohvk",
          "type": "fill",
          "source": "composite",
          "source-layer": "GSHHS_f_L1_full_res_shoreline-2eohvk",
          "layout": {},
          "paint": {
            "fill-outline-color": "#0a1738",
            "fill-opacity": 0.99, // forces layer to render in translucent pass - https://github.com/mapbox/mapbox-gl-js/issues/5831
            "fill-color": "#374a6d"
          }
      },
      {
        "id": "heatmap-playback-extruded-square",
        "type": "fill-extrusion",
        "source": "heatmap-playback-square",
        "source-layer": 'fishing',
        "layout": {
          "visibility": "none"
        },
        "paint": {
            "fill-extrusion-color": "hsl(0, 97%, 56%)",
            "fill-extrusion-height": 100000
        }
      },
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
  const [mode, setMode] = useState('heatmap')
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 950,
    latitude: 0,
    longitude: 160,
    zoom: 4
  })
  const style = useMemo(() => {
    const startTimestampMs = new Date(dates.start).getTime()
    const startTimestampDays = Math.round(startTimestampMs / 1000 / 60 / 60 / 24)
    const s = { ...defaultMapStyle }

    const SQUARE_INDEX = 1
    const HEATMAP_INDEX = 2
    // const POINT_INDEX = 3
    // const COUNTRIES_INDEX = 4
    const EXTRUDED_INDEX = 5

    

    // s.layers[POINT_INDEX].filter = ['has', startTimestampDays.toString()]
    // s.layers[POINT_INDEX].paint['circle-radius'] = ["to-number", ['get', (startTimestampDays - OFFSET).toString()]]
    // s.layers[POINT_INDEX].paint['circle-radius'] = ["to-number", ['get', startTimestampDays.toString()]]
    // s.layers[POINT_INDEX].paint['circle-radius'] = ["case", ["has", startTimestampDays.toString()], 3, 0]
    console.log(mode)
    if (mode === 'heatmap') {
      s.layers[HEATMAP_INDEX].paint['heatmap-weight'] = ["to-number", ['get', (startTimestampDays - OFFSET).toString()]]
      // s.layers[HEATMAP_INDEX].paint['heatmap-weight'] = ["to-number", ['get', startTimestampDays.toString()]]
      s.layers[SQUARE_INDEX].paint['fill-color'] = "#0A1738"
    } else if (mode === 'square') {
      s.layers[SQUARE_INDEX].paint['fill-color'] = [
        "interpolate",
        ["linear"],
        ["to-number", ['get', (startTimestampDays - OFFSET).toString()]],
        0,"rgba(0, 0, 0, 0)",
        1,"#0c276c",
        15,"#3B9088",
        30,"#EEFF00",
        40,"#ffffff"
      ]
    }

    if (mode === 'extruded_square') {
      s.layers[EXTRUDED_INDEX].paint['fill-extrusion-color'] = [
        "interpolate",
        ["linear"],
        ["to-number", ['get', (startTimestampDays - OFFSET).toString()]],
        0,"rgba(0, 0, 0, 0)",
        1,"#0c276c",
        15,"#3B9088",
        30,"#EEFF00",
        40,"#ffffff"
      ]
      s.layers[EXTRUDED_INDEX].paint['fill-extrusion-height'] = [
        "interpolate",
        ["linear"],
        ["to-number", ['get', (startTimestampDays - OFFSET).toString()]],
        0,0,
        1,10000,
        15,150000,
        30,300000,
        40,400000
      ]
      s.layers[EXTRUDED_INDEX].layout.visibility = 'visible'
    } else {
      s.layers[EXTRUDED_INDEX].layout.visibility = 'none'
    }

    s.layers[HEATMAP_INDEX].layout.visibility = (mode === 'heatmap') ? 'visible' : 'none'
    s.layers[SQUARE_INDEX].layout.visibility = (mode === 'square') ? 'visible' : 'none'
    // s.layers[EXTRUDED_INDEX].layout.visibility = (mode === 'square_extruded') ? 'visible' : 'none'
    return s
  }, [dates, mode])

  // make throttling dealy higher when data gets more complex?
  // const throttledStyle = useThrottle(style, 100)
  return (serviceWorkerReady) && (<>
    <ReactMapGL
      {...viewport}
      onViewportChange={(viewport) => setViewport(viewport)}
      mapStyle={style}
      onClick={(e) => {
        console.log(e)
      }}
      mapOptions={{ hash: true, showTileBoundaries: true }}
      mapboxApiAccessToken='pk.eyJ1Ijoic2F0ZWxsaXRlc3R1ZGlvLW5lcmlrIiwiYSI6ImNrNGluM2E5bTAxcjEza21sYXdoeGRxNWcifQ.YxNL-IWYAwp5wTs58BC_iA'
    />
    <Timebar
      enablePlayback
      start={dates.start}
      end={dates.end}
      absoluteStart={'2019-01-01T00:00:00.000Z'}
      absoluteEnd={'2020-01-01T00:00:00.000Z'}
      onChange={(start, end) => { 
        setDates({
          start,
          end
        })
      }}
    />
    <div style={{ position: 'absolute', background: '#fff', top: 0 }}>
      <select onChange={(event) => setMode(event.target.value)}>
        <option value="heatmap">heatmap</option>
        <option value="square">square</option>
        <option value="extruded_square">extruded</option>
      </select>
    </div>
  </>)
}


export default Map