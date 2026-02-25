"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX PARA ÍCONES DO LEAFLET EM NEXT.JS ---
// Os caminhos padrão dos ícones falham no Webpack do Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type MapaProps = {
  endereco: string;
};

// Componente auxiliar para atualizar a visão do mapa quando as coordenadas mudam
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

export default function Mapa({ endereco }: MapaProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!endereco) return;

    const fetchCoords = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = encodeURIComponent(endereco);
        // Usando o proxy interno para evitar erros de CORS no Nominatim
        const res = await fetch(`/api/geocode?q=${query}`);
        const data = await res.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          console.warn("Nominatim geocoding failed for:", endereco);
          setError("Endereço não localizado no mapa.");
        }
      } catch (err) {
        console.error("Erro ao geocodificar com Nominatim:", err);
        setError("Erro ao carregar serviços de geolocalização.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [endereco]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100">
        <div className="text-slate-300 font-medium flex flex-col items-center gap-2">
           <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
           <span className="text-[10px] uppercase tracking-widest font-bold">Localizando Endereço...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
        <p className="text-slate-400 text-sm font-medium">{error}</p>
        <p className="text-slate-300 text-[10px] mt-2 italic px-4">"{endereco}"</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-white relative z-0">
      {coords ? (
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={16}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false} // Desabilitado para um visual mais limpo na página de detalhes
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>
              <div className="text-xs font-bold text-slate-900">Localização do Imóvel</div>
            </Popup>
          </Marker>
          <RecenterMap lat={coords.lat} lng={coords.lng} />
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full bg-slate-50 rounded-2xl">
          <span className="text-slate-300 text-[10px] uppercase tracking-widest font-bold">Aguardando endereço...</span>
        </div>
      )}
    </div>
  );
}
