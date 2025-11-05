import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

type MapaProps = {
  endereco: string;
};

export default function Mapa({ endereco }: MapaProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!endereco) return;

    const fetchCoods = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            endereco
          )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
        );
        const data = await res.json();
        if (data.status === "OK") {
          const { lat, lng } = data.results[0].geometry.location;
          setCoords({ lat, lng });
        } else {
          console.error("Erro ao buscar coordenadas:", data.status);
        }
      } catch (err) {
        console.error("Erro no fetch", err);
      }
    };
    fetchCoods();
  }, [endereco]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      {coords ? (
        <GoogleMap mapContainerStyle={containerStyle} center={coords} zoom={15}>
          <Marker position={coords} />
        </GoogleMap>
      ) : (
        <p className="text-gray-500">Carregando mapa...</p>
      )}
    </LoadScript>
  );
}
