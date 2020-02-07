import React, {useState, useMemo, useEffect, useRef} from 'react';
import ReactMapGL, { Popup } from 'react-map-gl';
import useMapStyler from '@globalfishingwatch/map-components/components/map-styler-hook'
import LayerComposer, { sort, TYPES, HEATMAP_GEOM_TYPES, HEATMAP_COLOR_RAMPS } from '@globalfishingwatch/map-styler'
import Timebar from '@globalfishingwatch/map-components/components/timebar'

const layerComposer = new LayerComposer()
const styleTransformations = [sort]

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: 10,
    zoom: 4
  })
  const [geomType, setGeomType] = useState('grid')
  const [usingTimebar, setUsingTimebar] = useState(false)
  const [dates, setDates] = useState({ start: '2019-01-01T00:00:00.000Z', end: '2019-04-01T00:00:00.000Z' });
  
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
    const config = [
      {
        id: 'heatmap-anim',
        type: TYPES.HEATMAP_TYPE,
        tileset: 'fishing_demo',
        start: dates.start,
        end: dates.end,
        zoom: viewport.zoom,
        opacity: (usingTimebar || !idle) ? 1 : .001,
        colorRampMult: .1,
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
        colorRampMult: .1,
        colorRamp: HEATMAP_COLOR_RAMPS.FISHING,
        geomType: (geomType === 'extruded') ? HEATMAP_GEOM_TYPES.EXTRUDED : HEATMAP_GEOM_TYPES.GRIDDED,
        updateColorRampOnTimeChange: false,
        singleFrame: false,
      },
      {
        id: 'landmass',
        type: TYPES.CARTO_POLYGONS,
        fillColor: '#374A6D',
        color: 'white',
        opacity: .99
      },
      {
        id: 'background',
        type: TYPES.BACKGROUND,
        color: '#0c276c'
      },
    ]
    return config

  }, [dates.start, dates.end, viewport.zoom, usingTimebar, idle, geomType])

  const [style] = useMapStyler(layerComposer, styleTransformations, styleConfig)
  console.log(style)
  const [highlighted, setHighlighted] = useState(null)

  // const currentlyAt = style && style.layers[2].metadata.currentlyAt



  return <div style={{height: '100%'}}>
  <ReactMapGL
    ref={mapRef}
    width='100%'
    height='calc(100% - 116px)'
    {...viewport}
    onViewportChange={(viewport) => setViewport(viewport)}
    mapStyle={style}
    interactiveLayerIds={['heatmap']}
    onHover={(e) => {
      // if (e.features && e.features.length && currentlyAt) {
      //   const presence = e.features[0].properties.presence.split(',')
      //   const valueAt = e.features[0].properties[currentlyAt]
      //   if (valueAt) {
      //     setHighlighted({
      //       // value: e.features[0].properties[currentlyAt],
      //       value: presence[currentlyAt],
      //       lngLat: e.lngLat
      //     })
      //     return
      //   }
      // }
      // setHighlighted(null)
    }}
    mapOptions={{ hash: true, showTileBoundaries: true }}
  >
    {highlighted && <Popup
      longitude={highlighted.lngLat[0]}
      latitude={highlighted.lngLat[1]}
      closeButton={false}
      closeOnClick={false}
      anchor="top">
        <div>
          {highlighted.value} vessel positions
        </div>
    </Popup>}
      </ReactMapGL>
  <div onMouseEnter={() => {setUsingTimebar(true);}}
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
  <div style={{ position: 'absolute', background: '#fff', top: 0 }}>
    <select onChange={(event) => setGeomType(event.target.value)}>
      <option value="grid">grid</option>
      <option value="extruded">extruded</option>
    </select>
  </div>
</div>
}

export default Map