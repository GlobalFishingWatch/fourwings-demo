// var vtpbf = require('vt-pbf')
// var VectorTile = require('vector-tile').VectorTile

// var data = fs.readFileSync(__dirname + '/fixtures/rectangle-1.0.0.pbf')
// var tile = new VectorTile(new Pbf(data))
// var orig = tile.layers['geojsonLayer'].feature(0).toGeoJSON(0, 0, 1)

// var buff = vtpbf(tile)
// fs.writeFileSync('my-tile.pbf', buff)

import Pbf from 'pbf'
import vtpbf from 'vt-pbf'
import { VectorTile } from '@mapbox/vector-tile'
import geojsonVt from 'geojson-vt'
import tilebelt from '@mapbox/tilebelt'


self.addEventListener('install', event => {
  console.log('install sw')
  // cleaning up old cache values...
})

self.addEventListener('activate', event => {
  console.log('activate sw')
  // self.clients.claim()

  // const allClients = clients.matchAll({
  //   includeUncontrolled: true
  // }).then((a) => {
  //   console.log(a)
  // });
  
  // Claim control of clients right after activating
  // This allows 
  event.waitUntil(self.clients.claim().then(() => {
    console.log('Now ready to handle fetches?');
  }));
  console.log('Now ready to handle fetches!');
})


// self.importScripts('readTile.js');

const getSquareGeom = (tileBBox, cell, numCells) => {
  const col = cell % numCells
  const row = Math.floor(cell / numCells)
  const [minX, minY, maxX, maxY] = tileBBox
  const width = maxX - minX
  const height = maxY - minY

  const squareMinX = minX + (col/numCells) * width
  const squareMaxX = minX + ((col+1)/numCells) * width
  const squareMinY = minY+ (row/numCells) * height
  const squareMaxY = minY + ((row+1)/numCells) * height
  return {
    "type": "Polygon",
    "coordinates": [
      [
        [
          squareMinX,
          squareMinY
        ],
        [
          squareMaxX,
          squareMinY
        ],
        [
          squareMaxX,
          squareMaxY
        ],
        [
          squareMinX,
          squareMaxY
        ],
        [
          squareMinX,
          squareMinY
        ]
      ]
    ]
  }
}

self.addEventListener('fetch', (e) => {
  // if (e.request.url.match(/pbf$/) !== null) {
    if (/heatmap/.test(e.request.url) === true) {
      const originalUrl = e.request.url

      const TILESET = 'fishing_64cells'
      // const TILESET = 'fishing'
      const TILESET_NUM_CELLS = 64

      const url = new URL(originalUrl)
      const geomType = url.searchParams.get('geomType')
      const [z, x, y] = originalUrl.match(/heatmap\/(\d+)\/(\d+)\/(\d+)/).slice(1,4).map(d => parseInt(d))
      const tileBBox = tilebelt.tileToBBOX([x,y,z])

      // const finalUrl = originalUrl.replace('http://heatmap', `https://fst-tiles-jzzp2ui3wq-uc.a.run.app/v1/${TILESET}/tile/heatmap`)
      const finalUrl = `https://fst-tiles-jzzp2ui3wq-uc.a.run.app/v1/${TILESET}/tile/heatmap/${z}/${x}/${y}`

      const p = fetch(finalUrl)

      const p2 = p.then(f => {
        return f.arrayBuffer().then(function(buffer) {
          var tile = new VectorTile(new Pbf(buffer))

          const tileLayer = tile.layers[TILESET]
          const features = []
          
          const OFFSET = new Date('2019-01-01T00:00:00.000Z').getTime() / 1000 / 60 / 60 / 24
          const INTERVAL_DAY = 90
          const ABS_START_DAY = new Date('2019-01-01T00:00:00.000Z').getTime() / 1000 / 60 / 60 / 24
          const ABS_END_DAY = new Date('2019-12-01T00:00:00.000Z').getTime() / 1000 / 60 / 60 / 24

          for (let i = 0; i < tileLayer.length; i++) {
            const feature = tileLayer.feature(i).toGeoJSON(x,y,z)
            
            const values = feature.properties
            const cell = values.cell
            const row = Math.floor(cell / TILESET_NUM_CELLS)
            // Skip every col and row, dividing num features by 4
            // if (geomType !== 'square' && (cell % 2 !== 0 || row % 2 !== 0)) {
            //   continue
            // }

            if (geomType === 'square') {
              feature.geometry = getSquareGeom(tileBBox, values.cell, TILESET_NUM_CELLS)
            }


            // console.log(values)
            delete values.cell
            const valuesWithinInterval = []
            // go from abs start to abs end
            for (let d = ABS_START_DAY; d < ABS_END_DAY; d++) {
            // for (let d = ABS_START_DAY; d < ABS_END_DAY; d+= 10) {
              // compute total at d aggregating all values within interval
              let total = 0
              for (let dd = d; dd < Math.min(d + INTERVAL_DAY, ABS_END_DAY); dd++) {
                if (values[dd] !== undefined) {
                  // total += values[dd]
                  total += 1
                  // total = 3
                }
              }
              if (total > 0) {
                valuesWithinInterval[d - OFFSET] = total
                // valuesWithinInterval[d] = 3
              }
            }
            feature.properties = valuesWithinInterval

            features.push(feature)
          }
          const geoJSON = {
            "type": "FeatureCollection",
            features
          }

          const tileindex = geojsonVt(geoJSON)
          const newTile = tileindex.getTile(z, x, y)
          const newBuff = vtpbf.fromGeojsonVt({ 'fishing': newTile })

          return new Response(newBuff, {
            status: f.status,
            statusText: f.statusText,
            headers: f.headers
          })
          
        });
        
      })

      e.respondWith(p2)
  }
})

