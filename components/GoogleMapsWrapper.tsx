"use client";

import Script from "next/script";

export default function GoogleMapsProvider() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  return (
    <Script
      id="google-maps"
      strategy="lazyOnload"
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
    />
  );
}
