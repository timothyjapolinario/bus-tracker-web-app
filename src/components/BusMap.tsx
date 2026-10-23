import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type BusLocation = {
  latitude: number;
  longitude: number;
};

function FollowBus({
  location,
  enabled,
  onUserDrag,
}: {
  location: BusLocation;
  enabled: boolean;
  onUserDrag: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (enabled) {
      map.panTo([location.latitude, location.longitude]);
    }
  }, [enabled, location, map]);

  useEffect(() => {
    map.on("dragstart", onUserDrag);
    return () => {
      map.off("dragstart", onUserDrag);
    };
  }, [map, onUserDrag]);

  return null;
}

const busIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background: #2563eb;
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px #0005;
      font-size: 20px;
    ">🚌</div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

export function BusMap() {
  const [location, setLocation] = useState({
    latitude: 15.7101754,
    longitude: -121.1024842,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isFollowing, setIsFollowing] = useState(true);
  useEffect(() => {
    let active = true;

    const fetchLocation = async () => {
      try {
        const response = await fetch(
          "https://bustracker-api-c4bxb2a0hpd9agfx.westus3-01.azurewebsites.net/api/Bus/location",
        );
        if (!response.ok) {
          throw new Error(`Location request failed: ${response.status}`);
        }

        const nextLocation: BusLocation = await response.json();
        if (
          active &&
          Number.isFinite(nextLocation.latitude) &&
          Number.isFinite(nextLocation.longitude)
        ) {
          setLocation(nextLocation);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Could not fetch bus location:", error);
      }
    };

    void fetchLocation();
    const interval = setInterval(() => void fetchLocation(), 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setIsFollowing(true)}
          disabled={isFollowing}
          style={{
            border: 0,
            borderRadius: 6,
            padding: "9px 12px",
            background: isFollowing ? "#1d4ed8" : "white",
            color: isFollowing ? "white" : "#1e293b",
            boxShadow: "0 1px 5px #0004",
            cursor: isFollowing ? "default" : "pointer",
            fontWeight: 600,
          }}
        >
          {isFollowing ? "Following bus" : "Center on bus"}
        </button>
        <span
          style={{
            borderRadius: 6,
            padding: "8px 10px",
            background: "white",
            boxShadow: "0 1px 5px #0004",
            color: "#334155",
            fontSize: 13,
          }}
        >
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={45}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[location.latitude, location.longitude]}
          icon={busIcon}
        />

        <FollowBus
          location={location}
          enabled={isFollowing}
          onUserDrag={() => setIsFollowing(false)}
        />
      </MapContainer>
    </div>
  );
}
