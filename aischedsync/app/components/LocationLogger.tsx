"use client"; // very important for Next.js App Router

import { useEffect } from "react";

export default function LocationLogger() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Current Location:", latitude, longitude);
          // you can trigger your task notification function here
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }, 600000); // every 1 min 

    return () => clearInterval(intervalId); // clear on unmount
  }, []);

  return null; // invisible component
}
