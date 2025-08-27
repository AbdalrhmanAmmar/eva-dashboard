import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// إصلاح أيقونات Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// أيقونة مخصصة للدبوس
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface InteractiveMapProps {
  coordinates: { lat: number | null; lng: number | null };
  address: string;
  onLocationChange: (lat: number, lng: number) => void;
}

// 🔹 مكون لتحديث موقع الخريطة عند تغيير الإحداثيات
const MapUpdater: React.FC<{ coordinates: { lat: number | null; lng: number | null } }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.lat !== null && coordinates.lng !== null) {
      console.log("📍 Updating map center:", coordinates.lat, coordinates.lng);
      map.setView([coordinates.lat, coordinates.lng], 15);
    }
  }, [coordinates, map]);

  return null;
};

// 🔹 مكون للتعامل مع النقر أو سحب الدبوس
const LocationMarker: React.FC<{
  coordinates: { lat: number | null; lng: number | null };
  address: string;
  onLocationChange: (lat: number, lng: number) => void;
}> = ({ coordinates, address, onLocationChange }) => {
  const [position, setPosition] = useState<[number, number] | null>(
    coordinates.lat !== null && coordinates.lng !== null ? [coordinates.lat, coordinates.lng] : null
  );

  useEffect(() => {
    if (coordinates.lat !== null && coordinates.lng !== null) {
      setPosition([coordinates.lat, coordinates.lng]);
    }
  }, [coordinates]);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
          onLocationChange(pos.lat, pos.lng);
        },
      }}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-2">موقع المخزن</h3>
          <p className="text-sm text-gray-600 mb-2">{address}</p>
          <div className="text-xs text-gray-500">
            <p>خط العرض: {position[0].toFixed(6)}</p>
            <p>خط الطول: {position[1].toFixed(6)}</p>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            يمكنك سحب الدبوس لتعديل الموقع
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

// 🔹 المكون الرئيسي للخريطة
const InteractiveMap: React.FC<InteractiveMapProps> = ({ coordinates, address, onLocationChange }) => {
  const defaultCenter: [number, number] = [24.7136, 46.6753]; // الرياض كموقع افتراضي

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border shadow-soft">
      <MapContainer
        key={`${coordinates.lat}-${coordinates.lng}`} // ✅ مهم لإعادة بناء الخريطة عند تغيير العنوان
        center={coordinates.lat !== null && coordinates.lng !== null ? [coordinates.lat, coordinates.lng] : defaultCenter}
        zoom={coordinates.lat !== null && coordinates.lng !== null ? 15 : 6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater coordinates={coordinates} />

        <LocationMarker
          coordinates={coordinates}
          address={address}
          onLocationChange={onLocationChange}
        />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
