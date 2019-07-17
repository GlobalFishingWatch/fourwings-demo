import React, {Component} from 'react';
import ReactMapGL from 'react-map-gl';

const mapStyle = {
  "version": 8,
  "name": "Blank",
  "bearing": 0,
  "pitch": 0,
  "sources": {
      "countries": {
        "type": "geojson",
        "data": "https://gist.githubusercontent.com/nerik/512ff38b8b5f254c89b3e2541af5157e/raw/22f0555c8c5896874fe40111affa4290f2374ebb/countries.json"
      },
      "test": {
        "type": "geojson",
        "data": "https://gist.githubusercontent.com/nerik/96dd9747b5e1464f172cf2addf7f1185/raw/a14b5da8eb60cd5cf2c3c51788633174096ddec4/map.geojson"
      },
      "points": {
        "type": "vector",
        "maxzoom": 6,
        // tiles,
        "tiles": [
          "https://api-dot-world-fishing-827.appspot.com/v2/tilesets/test-chile-seconds-transport-v1/{z}%2F{x}%2F{y}.pbf"
        ]
      }
  },
  "layers": [
      {
          "id": "background",
          "type": "background",
          "paint": {"background-color": "rgba(0,0,0,0)"}
      },
      {
          "id": "countries",
          "type": "line",
          "source": "countries",
          "layout": {},
          "paint": {}
      },
      {
        "id": "test",
        "type": "line",
        "source": "test",
        "layout": {},
        "paint": {
          "line-color": "blue"
        }
      },
      {
        "id": "points",
        "type": "circle",
        "source": "points",
        // "source-layer": "chile_transporters",
        "source-layer": "chile_transport",
        "layout": {},
        "paint": {
          "circle-radius": 3,
          "circle-color": "hsl(0, 100%, 77%)"
        },
      //   "filter": [
      //     "all",
      //     [">", "timestamp", (new Date(2018, 0, 1).getTime()) / 1000],
      //     ["<", "timestamp", (new Date(2019, 0, 1).getTime()) / 1000]
      // ]
      }
  ]
}

class Map extends Component {

  state = {
    viewport: {
      width: 800,
      height: 600,
      latitude: -50,
      longitude: -60,
      zoom: 3.5
    },
    serviceWorkerReady: false
  };

  componentDidMount() {
    navigator.serviceWorker.ready.then(() => {
      console.log('From app: service worker is ready')
      this.setState({ serviceWorkerReady: true })
    })
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('From app: received message from worker', event)
    })
    setTimeout(() => {
      fetch('https://gist.githubusercontent.com/nerik/96dd9747b5e1464f172cf2addf7f1185/raw/a14b5da8eb60cd5cf2c3c51788633174096ddec4/map.geojson')
      .then(() => {
        console.log('I Fetched a thing...')
      })
    }, 5000);
  }

  render() {
    const { serviceWorkerReady } = this.state
    // waut for SW to be ready, otherwise there's a race condition
    // between SW install and map first render (=first tiles fetches don't get intercepted)
    return (serviceWorkerReady) && <ReactMapGL
      {...this.state.viewport}
      onViewportChange={(viewport) => this.setState({viewport})}
      mapStyle={mapStyle}
    />
  }
}

export default Map