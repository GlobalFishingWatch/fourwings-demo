import React, {useState, useMemo, useEffect, useRef} from 'react';
import ReactMapGL, { Popup } from 'react-map-gl';
import useMapStyler from '@globalfishingwatch/map-components/components/layer-composer-hook'
import LayerComposer, { sort, defaultGenerators, TYPES, HEATMAP_GEOM_TYPES, HEATMAP_COLOR_RAMPS } from '@globalfishingwatch/layer-composer'
import Timebar from '@globalfishingwatch/map-components/components/timebar'
import styles from './Map.css'
import TrackGenerator from './TrackGenerator'

const layerComposer = new LayerComposer({
  generators: {
    ...defaultGenerators,
    track: new TrackGenerator(),
  },
})
const styleTransformations = [sort]

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: 27,
    longitude: -77,
    zoom: 4
  })
  const [geomType, setGeomType] = useState('grid')
  const [fishingVisible, setFishingVisible] = useState(true)
  const [tracksVisible, setTracksVisible] = useState(false)
  const [usingTimebar, setUsingTimebar] = useState(false)
  const [dates, setDates] = useState({ start: '2019-04-01T00:00:00.000Z', end: '2019-08-01T00:00:00.000Z' });
  
  const [idle, setIdle] = useState(false)
  const mapRef = useRef()
  useEffect(() => {
    const map = mapRef.current.getMap()
    map.on('idle', () => {
      console.log('idle')
      setIdle(true)
    })
    return () => {
      map.off('idle')
    }
  }, [mapRef])
  
  const styleConfig = useMemo(() => {
    let config = [
      {
        id: 'background',
        type: TYPES.BACKGROUND,
        color: '#0c276c'
      },
      // {
      //   type: TYPES.BASEMAP,
      //   id: 'graticules',
      // },
      {
        type: TYPES.BASEMAP,
        id: 'landmass',
      }
    ]

    if (fishingVisible) {
      config = [...config,
        {
          id: 'heatmap-anim',
          type: TYPES.HEATMAP_TYPE,
          tileset: 'fishing_demo',
          start: dates.start,
          end: dates.end,
          zoom: viewport.zoom,
          opacity: (usingTimebar || !idle) ? 1 : .001,
          visible: true,
          colorRampMult: .4,
          colorRamp: HEATMAP_COLOR_RAMPS.FISHING,
          geomType: HEATMAP_GEOM_TYPES.BLOB,
          updateColorRampOnTimeChange: false,
          singleFrame: false,
        },
        {
          id: 'heatmap',
          type: TYPES.HEATMAP_TYPE,
          tileset: 'fishing_demo',
          start: dates.start,
          end: dates.end,
          zoom: viewport.zoom,
          visible: !usingTimebar,
          colorRampMult: .4,
          colorRamp: HEATMAP_COLOR_RAMPS.FISHING,
          geomType: (geomType === 'extruded') ? HEATMAP_GEOM_TYPES.EXTRUDED : HEATMAP_GEOM_TYPES.GRIDDED,
          updateColorRampOnTimeChange: false,
          singleFrame: false,
        },
      ]
    }
    
    if (tracksVisible) {
      config = [...config, 
        {
          id: 'track',
          type: 'track',
          start: dates.start,
          end: dates.end,
          index: 1,
          color: '#ff00ff'
        },
        {
          id: 'track2',
          type: 'track',
          start: dates.start,
          end: dates.end,
          index: 2,
          color: '#ff0000'
        },
        {
          id: 'track3',
          type: 'track',
          start: dates.start,
          end: dates.end,
          index: 3,
          color: '#ffff00'
        },
      ]
    }
    return config

  }, [dates.end, dates.start, fishingVisible, geomType, idle, tracksVisible, usingTimebar, viewport.zoom])

  const [style] = useMapStyler(layerComposer, styleTransformations, styleConfig)
  const [highlighted, setHighlighted] = useState(null)

  const currentlyAt = style && fishingVisible && style.layers[2] && style.layers[2].metadata && style.layers[2].metadata.currentlyAt




  return <div className="container">
    <ul className="layers">
      <li>
        <input type="checkbox" checked={tracksVisible} onChange={(event) => setTracksVisible(event.target.checked)} />Shark tracks
      </li>
      <li>
        <input type="checkbox" checked={fishingVisible} onChange={(event) => setFishingVisible(event.target.checked)}/>Fishing activity
          <select onChange={(event) => setGeomType(event.target.value)}>
            <option value="grid">grid</option>
            <option value="extruded">extruded</option>
          </select>
      </li>
      <li>
        <input type="checkbox" />Surface temperature 
      </li>
    </ul>
    <div className="map">
      <ReactMapGL
        ref={mapRef}
        width='100%'
        height='100%'
        {...viewport}
        onViewportChange={(viewport) => setViewport(viewport)}
        mapStyle={style}
        interactiveLayerIds={fishingVisible ? ['heatmap'] : []}
        onHover={(e) => {
          if (e.features && e.features.length && currentlyAt) {
            const info = e.features[0].properties.info.split(',')
            const valueAt = e.features[0].properties[currentlyAt]
            if (valueAt) {
              setHighlighted({
                // value: e.features[0].properties[currentlyAt],
                value: info[currentlyAt],
                lngLat: e.lngLat
              })
              return
            }
          }
          setHighlighted(null)
        }}
        mapOptions={{ hash: true, showTileBoundaries: true }}
      >
        {highlighted && <Popup
          longitude={highlighted.lngLat[0]}
          latitude={highlighted.lngLat[1]}
          closeButton={false}
          closeOnClick={false}
          anchor="top">
            <div className="popup">
              {highlighted.value} vessel positions
            </div>
        </Popup>}
      </ReactMapGL>
    </div>
    <div  className="timebar" onMouseEnter={() => {setUsingTimebar(true);}}
        onMouseLeave={() => { setUsingTimebar(false); setIdle(false)}}>
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
      >
      </Timebar>
    </div>
  </div>
}

export default Map