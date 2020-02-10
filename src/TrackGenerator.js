import data1 from './track'
import data2 from './track2'
import data3 from './track3'

class TrackGenerator {
  type = 'track'

  _getStyleSources = (config) => {
    const startTs = new Date(config.start).getTime()
    const endTs = new Date(config.end).getTime()
    const points = [null,data1,data2,data3][config.index].features
    const track = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": []
          }
        }
      ]
    }

    points.forEach(p => {
      const ts = new Date(p.properties.timestamp).getTime()
      if (ts > startTs && ts < endTs) {
        track.features[0].geometry.coordinates.push(p.geometry.coordinates)
      }
    })

    const source = {
      type: 'geojson',
      data: track
    }
    return [{ id: config.id, ...source }]
  }
  _getStyleLayers = (config) => {
    const layer = {
      id: `${config.id}_lines`,
      source: config.id,
      type: 'line',
      paint: {
        'line-width': 1,
        'line-color': config.color,
      },
    }
    return [layer]
  }

  getStyle = (config) => {
    return {
      id: config.id,
      sources: this._getStyleSources(config),
      layers: this._getStyleLayers(config),
    }
  }
}

export default TrackGenerator
