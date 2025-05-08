const myParcelsLayer = L.layerGroup().addTo(map);
const myRecintosLayer = L.layerGroup().addTo(map);
// Crear el mapa (asegurate de que el div con id 'map' esté en tu HTML)
const map = L.map('map').setView([40.7128, -74.0060], 13); // Puedes cambiar estas coordenadas y zoom según tu ubicación

// Agregar una capa base, por ejemplo OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



document.getElementById('my-parcels-layer').addEventListener('change', function () {
  if (this.checked) {
    fetch('/api/my-parcels')
      .then(res => res.json())
      .then(data => {
        data.parcels.forEach(parcel => {
          L.geoJSON(parcel.geoJson).addTo(myParcelsLayer);
        });
      });
  } else {
    myParcelsLayer.clearLayers();
  }
});


document.getElementById('my-recintos-layer').addEventListener('change', function () {
  if (this.checked) {
    fetch('/api/my-parcels')
      .then(res => res.json())
      .then(data => {
        data.recintos.forEach(recinto => {
          L.geoJSON(recinto.geoJson).addTo(myRecintosLayer);
        });
      });
  } else {
    myRecintosLayer.clearLayers();
  }
});
