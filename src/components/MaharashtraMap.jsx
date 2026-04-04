import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { districtGrievanceDensity } from '../data/mockData';
import maharashtraGeoJSON from '../data/maharashtraGeoJSON';

function getColor(density) {
  if (density > 50) return '#D32F2F';
  if (density > 40) return '#E64A19';
  if (density > 30) return '#FF9933';
  if (density > 20) return '#FFB74D';
  if (density > 10) return '#FFCC80';
  return '#FFF3E0';
}

function style(feature) {
  const name = feature.properties.name || feature.properties.NAME_2 || feature.properties.district;
  const density = districtGrievanceDensity[name] || 0;
  return {
    fillColor: getColor(density),
    weight: 1,
    opacity: 1,
    color: '#666',
    fillOpacity: 0.7,
  };
}

function onEachFeature(feature, layer) {
  const name = feature.properties.name || feature.properties.NAME_2 || feature.properties.district;
  const density = districtGrievanceDensity[name] || 0;
  layer.bindTooltip(`<strong>${name}</strong><br/>तक्रारी: ${density}`, {
    sticky: true,
    className: 'leaflet-tooltip',
  });
}

export default function MaharashtraMap() {
  return (
    <MapContainer
      center={[19.7515, 75.7139]}
      zoom={6.5}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', background: '#f5f5f5' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {maharashtraGeoJSON && (
        <GeoJSON data={maharashtraGeoJSON} style={style} onEachFeature={onEachFeature} />
      )}
    </MapContainer>
  );
}
