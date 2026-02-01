import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

interface MapPolygonDrawerProps {
  value: [number, number][];
  onChange: (points: [number, number][]) => void;
}

const VIENNA_CENTER: [number, number] = [48.2082, 16.3738];

function DrawControl({
  value,
  onChange,
}: {
  value: [number, number][];
  onChange: (points: [number, number][]) => void;
}) {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const initializedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated without triggering effects
  onChangeRef.current = onChange;

  // Initialize feature group and draw control only once
  useEffect(() => {
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
    }

    const drawnItems = drawnItemsRef.current;

    // Add draw control only once
    if (!drawControlRef.current) {
      drawControlRef.current = new L.Control.Draw({
        position: "topright",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.2,
            },
          },
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
          rectangle: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
      map.addControl(drawControlRef.current);
    }

    // Handle draw events
    const handleCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      drawnItems.clearLayers();
      drawnItems.addLayer(event.layer);

      const polygon = event.layer as L.Polygon;
      const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
      const points = latLngs.map((ll): [number, number] => [ll.lat, ll.lng]);
      onChangeRef.current(points);
    };

    const handleEdited = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Edited;
      event.layers.eachLayer((layer) => {
        const polygon = layer as L.Polygon;
        const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
        const points = latLngs.map((ll): [number, number] => [ll.lat, ll.lng]);
        onChangeRef.current(points);
      });
    };

    const handleDeleted = () => {
      onChangeRef.current([]);
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
    };
  }, [map]);

  // Initialize polygon from value only once on first render
  useEffect(() => {
    if (initializedRef.current) return;
    if (!drawnItemsRef.current) return;

    const drawnItems = drawnItemsRef.current;

    if (value.length >= 3) {
      drawnItems.clearLayers();
      const polygon = L.polygon(value.map(([lat, lng]) => [lat, lng]));
      drawnItems.addLayer(polygon);
      map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
      initializedRef.current = true;
    }
  }, [map, value]);

  return null;
}

export function MapPolygonDrawer({ value, onChange }: MapPolygonDrawerProps) {
  const center =
    value.length >= 3
      ? [
          value.reduce((sum, p) => sum + p[0], 0) / value.length,
          value.reduce((sum, p) => sum + p[1], 0) / value.length,
        ] as [number, number]
      : VIENNA_CENTER;

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControl value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
