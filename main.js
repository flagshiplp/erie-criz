
mapboxgl.accessToken = 'pk.eyJ1IjoiaGR1bm44MTQiLCJhIjoiY21iMTZ4NWliMDUyNTJrcHB1cHRza3gwMSJ9.jbN7OYogHdgS_qZMy2beRQ';

let geojsonData = null;

fetch('criz_boundary.geojson')
  .then(response => {
    if (!response.ok) throw new Error("Failed to load GeoJSON");
    return response.json();
  })
  .then(data => {
    geojsonData = data;
    const button = document.getElementById('checkButton');
    button.disabled = false;
    button.addEventListener("click", lookupAddress);
  })
  .catch(err => {
    console.error("Error loading CRIZ boundary:", err);
    document.getElementById('result').innerText = "Could not load CRIZ boundary.";
  });

function lookupAddress() {
  const address = document.getElementById('address').value;
  const result = document.getElementById('result');
  if (!address) {
    result.innerText = "Please enter an address.";
    return;
  }

  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.features.length === 0) {
        result.innerText = "Address not found.";
        return;
      }
      const coords = data.features[0].geometry.coordinates;
      const point = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coords
        }
      };
      const inside = geojsonData.features.some(poly =>
        turf.booleanPointInPolygon(point, poly)
      );
      result.innerText = inside ? "✅ This address IS in the CRIZ." : "❌ This address is NOT in the CRIZ.";
    })
    .catch(() => {
      result.innerText = "Error during geocoding request.";
    });
}
