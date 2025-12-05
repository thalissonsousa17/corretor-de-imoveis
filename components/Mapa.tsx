"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";

type MapaProps = {
  endereco: string;
};

export default function Mapa({ endereco }: MapaProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        }
      } catch (err) {
        console.error("Erro ao buscar coordenadas", err);
      }
    };

    fetchCoods();
  }, [endereco]);

  if (!isMounted) return <p className="text-gray-500">Carregando mapa...</p>;

  return coords ? (
    <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden">
      <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={coords} zoom={15}>
        <Marker position={coords} />
      </GoogleMap>
    </div>
  ) : (
    <p className="text-gray-500">Carregando mapa...</p>
  );
}
