import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Slider, Text } from "@mantine/core";

interface MapRadiusPickerProps {
  center: [number, number] | null;
  radius: number;
  onCenterChange: (center: [number, number]) => void;
  onRadiusChange: (radius: number) => void;
}

const VIENNA_CENTER: [number, number] = [48.2082, 16.3738];
const DEFAULT_RADIUS = 5;

// Fix for default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({
  onCenterChange,
}: {
  onCenterChange: (center: [number, number]) => void;
}) {
  useMapEvents({
    click: (e) => {
      onCenterChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map object reference is stable
  }, [center]);

  return null;
}

export function MapRadiusPicker({
  center,
  radius,
  onCenterChange,
  onRadiusChange,
}: MapRadiusPickerProps) {
  const mapCenter = center || VIENNA_CENTER;
  const radiusInMeters = (radius || DEFAULT_RADIUS) * 1000;

  return (
    <div>
      {!center && (
        <Text size="sm" c="orange" fw={500} mb="xs" style={{ padding: "8px", backgroundColor: "var(--mantine-color-orange-light)", borderRadius: "4px" }}>
          Click anywhere on the map to set the center point
        </Text>
      )}
      {center && (
        <Text size="sm" c="dimmed" mb="xs">
          Click to move the center point, or adjust the radius below
        </Text>
      )}
      <div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden", border: !center ? "2px dashed var(--mantine-color-orange-5)" : undefined }}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onCenterChange={onCenterChange} />
          <MapCenterUpdater center={center} />
          {center && (
            <>
              <Marker position={center} icon={defaultIcon} />
              <Circle
                center={center}
                radius={radiusInMeters}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.2,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Text size="sm" fw={500} mb="xs">
          Radius: {radius || DEFAULT_RADIUS} km
        </Text>
        <Slider
          value={radius || DEFAULT_RADIUS}
          onChange={onRadiusChange}
          min={1}
          max={50}
          step={1}
          marks={[
            { value: 1, label: "1km" },
            { value: 10, label: "10km" },
            { value: 25, label: "25km" },
            { value: 50, label: "50km" },
          ]}
        />
      </div>
    </div>
  );
}
