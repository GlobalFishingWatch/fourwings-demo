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

self.addEventListener('fetch', (e) => {
  // if (e.request.url.match(/pbf$/) !== null) {
    if (/heatmap/.test(e.request.url) === true) {
      const originalUrl = e.request.url
      const url = originalUrl.replace('http://heatmap', 'http://34.69.224.29/v1/fishing/heatmap')
      const [z, x, y] = originalUrl.match(/heatmap\/(\d+)\/(\d+)\/(\d+)/).slice(1,4).map(d => parseInt(d))
      const p = fetch(url)

      const p2 = p.then(f => {
        return f.arrayBuffer().then(function(buffer) {
          var tile = new VectorTile(new Pbf(buffer))
          const tileLayer = tile.layers['fishing']
          const features = []
          
          const INTERVAL_DAY = 10
          const ABS_START_DAY = new Date('2019-01-01T00:00:00.000Z').getTime() / 1000 / 60 / 60 / 24
          const ABS_END_DAY = new Date('2020-01-01T00:00:00.000Z').getTime() / 1000 / 60 / 60 / 24
          const ABS_INTERVAL_DAY = ABS_END_DAY - ABS_START_DAY

          for (let i = 0; i < tileLayer.length; i++) {
            const feature = tileLayer.feature(i).toGeoJSON(x,y,z)
            // console.log(feature)
            // feature.geometry.coordinates[0] = feature.geometry.coordinates[0] - 10
            // console.log(feature.toGeoJSON(x,y,z))

            const values = feature.properties
            // console.log(values)
            delete values.cell
            const valuesWithinInterval = {}
            // go from abs start to abs end
            for (let d = ABS_START_DAY; d < ABS_END_DAY; d++) {
              // const total = values[d]
              // compute total at d aggregating all values within interval
              let total = 0
              for (let dd = d; dd < Math.min(d + INTERVAL_DAY, ABS_END_DAY); dd++) {
                if (values[dd] !== undefined) {
                  total += values[dd]
                }
              }
              if (total > 0) {
                valuesWithinInterval[d] = total
              }
            }
            // console.log(valuesWithinInterval)
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

