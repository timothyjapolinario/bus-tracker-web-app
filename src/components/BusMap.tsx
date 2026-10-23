import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type BusLocation = {
  latitude: number;
  longitude: number;
};

function FollowBus({ location }: { location: BusLocation }) {
  const map = useMap();

  useEffect(() => {
    map.panTo([location.latitude, location.longitude]);
  }, [map, location]);

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
    <div style={{ height: "100%", width: "100%" }}>
      <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
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

        <FollowBus location={location} />
      </MapContainer>
    </div>
  );
}
