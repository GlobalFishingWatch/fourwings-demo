async function readTile(request) {
  const response = await fetch(request);

  console.log('reading tile_', request.url)
  console.log('reading tile', response, response.body)

  // build an initial index of tiles
  // var tileIndex = geojsonvt(geojson);

  // request a particular tile
  // var features = tileIndex.getTile(3, 2, 5).features;
  // console.log(features)


  // const newResponse = response.clone()

  //console.log(response.body)
  // response.arrayBuffer().then(function(buffer) {
  //   // do something with buffer
  //   // console.log(buffer)
  // });

  const buffer = await response.arrayBuffer()
  // console.log(buffer)
  const newResponse = new Response(buffer, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })

  return newResponse
  // return response
}

// export default readTile
