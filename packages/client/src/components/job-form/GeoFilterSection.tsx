import { GeoFilterType } from "@cronny/types";
import { Paper, SegmentedControl, Text } from "@mantine/core";
import { Suspense, lazy } from "react";

const MapPolygonDrawer = lazy(() =>
  import("./MapPolygonDrawer").then((m) => ({ default: m.MapPolygonDrawer }))
);
const MapRadiusPicker = lazy(() =>
  import("./MapRadiusPicker").then((m) => ({ default: m.MapRadiusPicker }))
);

interface GeoFilterSectionProps {
  filterType: GeoFilterType;
  polygonPoints: [number, number][];
  radiusCenter: [number, number] | null;
  radius: number;
  onFilterTypeChange: (type: GeoFilterType) => void;
  onPolygonChange: (points: [number, number][]) => void;
  onRadiusCenterChange: (center: [number, number]) => void;
  onRadiusChange: (radius: number) => void;
}

export function GeoFilterSection({
  filterType,
  polygonPoints,
  radiusCenter,
  radius,
  onFilterTypeChange,
  onPolygonChange,
  onRadiusCenterChange,
  onRadiusChange,
}: GeoFilterSectionProps) {
  return (
    <Paper p="md" withBorder>
      <Text fw={500} size="sm" mb="sm">
        Geographic Filter
      </Text>

      <SegmentedControl
        value={filterType}
        onChange={(value) => onFilterTypeChange(value as GeoFilterType)}
        data={[
          { value: "none", label: "None" },
          { value: "radius", label: "Radius" },
          { value: "polygon", label: "Polygon" },
        ]}
        fullWidth
        mb="md"
      />

      {filterType === "none" && (
        <Text size="sm" c="dimmed">
          Results will not be filtered by location.
        </Text>
      )}

      {filterType === "radius" && (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <MapRadiusPicker
            center={radiusCenter}
            radius={radius}
            onCenterChange={onRadiusCenterChange}
            onRadiusChange={onRadiusChange}
          />
        </Suspense>
      )}

      {filterType === "polygon" && (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <Text size="sm" c="dimmed" mb="xs">
            Use the drawing tool on the right to draw a polygon area
          </Text>
          <MapPolygonDrawer value={polygonPoints} onChange={onPolygonChange} />
          {polygonPoints.length >= 3 && (
            <Text size="xs" c="dimmed" mt="xs">
              Polygon has {polygonPoints.length} points
            </Text>
          )}
        </Suspense>
      )}
    </Paper>
  );
}

function MapLoadingPlaceholder() {
  return (
    <div
      style={{
        height: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--mantine-color-dark-6)",
        borderRadius: "8px",
      }}
    >
      <Text c="dimmed">Loading map...</Text>
    </div>
  );
}
