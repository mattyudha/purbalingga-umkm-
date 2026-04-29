const fs = require('fs');
const path = require('path');

const kecamatanPath = path.join(__dirname, '../../public/geojson/purbalingga-kecamatan.geojson');
const maskPath = path.join(__dirname, '../../public/geojson/purbalingga-mask.geojson');

const geojson = JSON.parse(fs.readFileSync(kecamatanPath, 'utf8'));

// Bounding box dunia (sangat besar agar menutupi semuanya)
const worldOuter = [
  [180, 90],
  [-180, 90],
  [-180, -90],
  [180, -90],
  [180, 90]
];

const maskFeature = {
  type: "Feature",
  properties: { name: "Purbalingga Mask" },
  geometry: {
    type: "MultiPolygon",
    coordinates: []
  }
};

// Untuk setiap kecamatan, kita buat MultiPolygon di mana:
// polygon pertama adalah outer world, polygon kedua adalah lubang kecamatan tersebut.
// Tapi cara yang lebih benar untuk Leaflet adalah satu MultiPolygon dengan banyak lubang.
// Namun MultiPolygon dengan 1 outer ring dan banyak inner rings (lubang) biasanya didefinisikan sebagai Polygon tunggal jika lubangnya banyak.

const maskCoordinates = [worldOuter];

geojson.features.forEach(feature => {
  if (feature.geometry.type === 'Polygon') {
    // Tambahkan koordinat kecamatan sebagai lubang (inner ring)
    maskCoordinates.push(feature.geometry.coordinates[0]);
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(poly => {
      maskCoordinates.push(poly[0]);
    });
  }
});

const finalGeoJson = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { name: "Purbalingga Mask" },
    geometry: {
      type: "Polygon",
      coordinates: maskCoordinates
    }
  }]
};

fs.writeFileSync(maskPath, JSON.stringify(finalGeoJson));
console.log('Mask GeoJSON generated successfully at:', maskPath);
