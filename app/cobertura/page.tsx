"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Phone, Clock, ChevronDown, Locate, ArrowLeft, ChevronUp, X, Calendar } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CustomerHeader from "@/components/customer-header"
import Script from "next/script"

// Add type declaration for google maps
declare global {
  interface Window {
    google: any
  }
}

type LocationStatus = "standard" | "new" | "remodeling"

interface Location {
  id: number
  name: string
  address: string
  phone: string
  type: LocationStatus
  isOpen: boolean
  schedule: {
    days: string
    hours: string
  }[]
  lat: number
  lng: number
  polygonPath?: any[]
}

const getFlagSvgString = (number: number) => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="linear-gradient-${number}" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
      <stop offset="0"></stop>
      <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
    </linearGradient>
    <clipPath id="clip-Bandera_con_${number}">
      <rect width="40" height="40"></rect>
    </clipPath>
  </defs>
  <g id="Bandera_con_${number}" clip-path="url(#clip-Bandera_con_${number})">
    <g transform="translate(-330 -428.859)">
      <g transform="translate(334.607 430.452)">
        <path d="M239.559,121.6h-1.547V84.8a.7.7,0,0,1,.774-.605h0a.7.7,0,0,1,.773.605Z" transform="translate(-237.723 -84.196)"></path>
        <g transform="translate(0 3.375)">
          <path d="M237.585,92.769h30.188l-6.853,8.5,6.951,8.464H237.585c-.17,0-.308-.216-.308-.482v-16C237.277,92.985,237.415,92.769,237.585,92.769Z" transform="translate(-237.277 -92.769)" fill="#e1051a"></path>
        </g>
        <path d="M237.585,92.769h30.188l-6.853,8.5,6.951,8.464H237.585c-.17,0-.308-.216-.308-.482v-16C237.277,92.985,237.415,92.769,237.585,92.769Z" transform="translate(-237.277 -89.394)" opacity="0.38" fill="url(#linear-gradient-${number})" style="mix-blend-mode: color-burn; isolation: isolate;"></path>
        <text transform="translate(11.393 15.406)" fill="#fff" font-size="11" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">
          <tspan x="4" y="1">${number}</tspan>
        </text>
      </g>
    </g>
  </g>
</svg>`.trim();
}

const FlagIcon = ({ number }: { number: number }) => (
  <div 
    className="w-10 h-10 shrink-0"
    dangerouslySetInnerHTML={{ __html: getFlagSvgString(number) }}
  />
)

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180)
}

// --- Polygons ---

// San Isidro (Standard)
const sanIsidroPoly = [
    { lat: -12.060, lng: -77.050 },
    { lat: -12.055, lng: -77.035 },
    { lat: -12.060, lng: -77.020 },
    { lat: -12.050, lng: -77.010 },
    { lat: -12.065, lng: -76.995 },
    { lat: -12.085, lng: -76.995 },
    { lat: -12.095, lng: -77.005 },
    { lat: -12.110, lng: -77.000 },
    { lat: -12.110, lng: -77.030 },
    { lat: -12.105, lng: -77.055 },
    { lat: -12.085, lng: -77.065 },
];

// Santa Anita (Standard)
const santaAnitaPoly = [
    { lat: -12.035, lng: -76.975 },
    { lat: -12.035, lng: -76.950 },
    { lat: -12.025, lng: -76.930 },
    { lat: -12.060, lng: -76.920 },
    { lat: -12.080, lng: -76.935 },
    { lat: -12.100, lng: -76.950 },
    { lat: -12.100, lng: -76.970 },
    { lat: -12.085, lng: -76.995 },
    { lat: -12.065, lng: -76.995 },
    { lat: -12.050, lng: -76.980 },
];

// SJL (Standard)
const sjlPoly = [
    { lat: -11.950, lng: -77.010 },
    { lat: -11.950, lng: -76.960 },
    { lat: -12.000, lng: -76.940 },
    { lat: -12.025, lng: -76.930 },
    { lat: -12.035, lng: -76.950 },
    { lat: -12.035, lng: -76.975 },
    { lat: -12.050, lng: -76.980 },
    { lat: -12.050, lng: -77.010 },
    { lat: -12.000, lng: -77.025 },
];

// Benavides (New - Reduced Area but covering Miraflores/Barranco inland - Further reduced to avoid sea)
const benavidesPoly = [
    { lat: -12.110, lng: -77.028 }, // NW (Slightly East to avoid sea edge)
    { lat: -12.110, lng: -77.000 }, // NE
    { lat: -12.125, lng: -76.980 }, // E
    { lat: -12.130, lng: -76.975 }, // SE
    { lat: -12.135, lng: -76.985 }, // S
    { lat: -12.140, lng: -77.005 }, // S
    { lat: -12.150, lng: -77.018 }, // SW (Inland Barranco)
    { lat: -12.135, lng: -77.030 }, // W (Inland Miraflores)
    { lat: -12.120, lng: -77.028 }, // W
];

// Atocongo (Standard - Expanded Area)
const atocongoPoly = [
    { lat: -12.135, lng: -76.985 }, // NW (Expanded North to take over Benavides)
    { lat: -12.130, lng: -76.975 }, // N (Expanded North)
    { lat: -12.145, lng: -76.955 }, // NE
    { lat: -12.170, lng: -76.945 }, // E
    { lat: -12.190, lng: -76.960 }, // SE
    { lat: -12.185, lng: -76.990 }, // SW
    { lat: -12.165, lng: -76.995 }, // W
];

// Comas (Standard)
const comasPoly = [
    { lat: -11.900, lng: -77.080 },
    { lat: -11.880, lng: -77.060 },
    { lat: -11.890, lng: -77.030 },
    { lat: -11.930, lng: -77.020 },
    { lat: -11.960, lng: -77.040 },
    { lat: -11.980, lng: -77.040 },
    { lat: -11.985, lng: -77.070 },
    { lat: -11.950, lng: -77.090 },
];

// Ica (Remodeling - Irregular)
const icaPoly = [
    { lat: -14.060, lng: -75.750 },
    { lat: -14.055, lng: -75.735 },
    { lat: -14.065, lng: -75.720 },
    { lat: -14.080, lng: -75.725 },
    { lat: -14.090, lng: -75.740 },
    { lat: -14.085, lng: -75.755 },
    { lat: -14.070, lng: -75.760 },
];

// Iquitos (Remodeling - Irregular)
const iquitosPoly = [
    { lat: -3.755, lng: -73.275 },
    { lat: -3.750, lng: -73.260 },
    { lat: -3.760, lng: -73.250 },
    { lat: -3.775, lng: -73.255 },
    { lat: -3.780, lng: -73.270 },
    { lat: -3.770, lng: -73.280 },
];

const locations: Location[] = [
  {
    id: 1,
    name: "San Isidro",
    address: "Av. Paseo de la República N° 3220, local LPC-12, nivel 1, San Isidro",
    phone: "996819390",
    type: "standard",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "10:00 am - 09:00 pm" },
      { days: "Martes:", hours: "10:00 am - 09:00 pm" },
      { days: "Miércoles:", hours: "10:00 am - 09:00 pm" },
      { days: "Jueves:", hours: "10:00 am - 09:00 pm" },
      { days: "Viernes:", hours: "10:00 am - 09:00 pm" },
      { days: "Sábado:", hours: "10:00 am - 09:00 pm" },
      { days: "Domingo:", hours: "10:00 am - 09:00 pm" },
    ],
    lat: -12.09489513340838,
    lng: -77.02554750642159,
    polygonPath: sanIsidroPoly
  },
  {
    id: 2,
    name: "Atocongo",
    address: "Av. Circunvalación 1801, San Juan de Miraflores, local LC-06, nivel -1",
    phone: "996819390",
    type: "standard",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "10:00 am - 09:00 pm" },
      { days: "Martes:", hours: "10:00 am - 09:00 pm" },
      { days: "Miércoles:", hours: "10:00 am - 09:00 pm" },
      { days: "Jueves:", hours: "10:00 am - 09:00 pm" },
      { days: "Viernes:", hours: "10:00 am - 09:00 pm" },
      { days: "Sábado:", hours: "10:00 am - 09:00 pm" },
      { days: "Domingo:", hours: "10:00 am - 09:00 pm" },
    ],
    lat: -12.14684417001264,
    lng: -76.98160127573388,
    polygonPath: atocongoPoly
  },
  {
    id: 3,
    name: "Ica",
    address: "Av. Los Maestros 206, Ica",
    phone: "996819390",
    type: "remodeling",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "10:00 am - 09:00 pm" },
      { days: "Martes:", hours: "10:00 am - 09:00 pm" },
      { days: "Miércoles:", hours: "10:00 am - 09:00 pm" },
      { days: "Jueves:", hours: "10:00 am - 09:00 pm" },
      { days: "Viernes:", hours: "10:00 am - 09:00 pm" },
      { days: "Sábado:", hours: "10:00 am - 09:00 pm" },
      { days: "Domingo:", hours: "10:00 am - 09:00 pm" },
    ],
    lat: -14.074592485228264,
    lng: -75.73926179593731,
    polygonPath: icaPoly
  },
  {
    id: 4,
    name: "Santa Anita",
    address: "Av. Carretera Central N°111, Santa Anita, local FC-05, nivel 3",
    phone: "996819390",
    type: "standard",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "10:00 am - 09:00 pm" },
      { days: "Martes:", hours: "10:00 am - 09:00 pm" },
      { days: "Miércoles:", hours: "10:00 am - 09:00 pm" },
      { days: "Jueves:", hours: "10:00 am - 09:00 pm" },
      { days: "Viernes:", hours: "10:00 am - 09:00 pm" },
      { days: "Sábado:", hours: "10:00 am - 09:00 pm" },
      { days: "Domingo:", hours: "10:00 am - 09:00 pm" },
    ],
    lat: -12.056567504685788,
    lng: -76.96926920457133,
    polygonPath: santaAnitaPoly
  },
  {
    id: 5,
    name: "Comas",
    address: "Av. Los Ángeles 602, Comas 15314 - Patio de comidas nivel 3",
    phone: "996819390",
    type: "standard",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "11:30 am - 09:00 pm" },
      { days: "Martes:", hours: "11:30 am - 09:00 pm" },
      { days: "Miércoles:", hours: "11:30 am - 09:00 pm" },
      { days: "Jueves:", hours: "11:30 am - 09:00 pm" },
      { days: "Viernes:", hours: "11:30 am - 09:00 pm" },
      { days: "Sábado:", hours: "11:30 am - 09:00 pm" },
      { days: "Domingo:", hours: "11:30 am - 09:00 pm" },
    ],
    lat: -11.93605635288142,
    lng: -77.0649272935285,
    polygonPath: comasPoly
  },
  {
    id: 6,
    name: "San Juan de Lurigancho",
    address: "Av. Lurigancho, Sub Lote No. 2 Mz A, Urb. Zárate, San Juan de Lurigancho",
    phone: "996819390",
    type: "standard",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "11:30 am - 09:00 pm" },
      { days: "Martes:", hours: "11:30 am - 09:00 pm" },
      { days: "Miércoles:", hours: "11:30 am - 09:00 pm" },
      { days: "Jueves:", hours: "11:30 am - 09:00 pm" },
      { days: "Viernes:", hours: "10:30 am - 09:00 pm" },
      { days: "Sábado:", hours: "11:30 am - 09:00 pm" },
      { days: "Domingo:", hours: "11:30 am - 09:00 pm" },
    ],
    lat: -12.01599924745009,
    lng: -76.99911848248236,
    polygonPath: sjlPoly
  },
  {
    id: 7,
    name: "Iquitos",
    address: "Av. Capitan Jose Abelardo Quiñones 1050, Iquitos",
    phone: "996819390",
    type: "remodeling",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "11:30 am - 09:00 pm" },
      { days: "Martes:", hours: "11:30 am - 09:00 pm" },
      { days: "Miércoles:", hours: "11:30 am - 09:00 pm" },
      { days: "Jueves:", hours: "11:30 am - 09:00 pm" },
      { days: "Viernes:", hours: "11:30 am - 09:00 pm" },
      { days: "Sábado:", hours: "11:30 am - 09:00 pm" },
      { days: "Domingo:", hours: "11:30 am - 09:00 pm" },
    ],
    lat: -3.7644227801746433,
    lng: -73.26717250281239,
    polygonPath: iquitosPoly
  },
  {
    id: 8,
    name: "Benavides",
    address: "Av. Benavides 3863, local 1, Santiago de Surco",
    phone: "996819390",
    type: "standard",
    isOpen: false,
    schedule: [
      { days: "Lunes:", hours: "10:00 am - 09:00 pm" },
      { days: "Martes:", hours: "10:00 am - 09:00 pm" },
      { days: "Miércoles:", hours: "10:00 am - 09:00 pm" },
      { days: "Jueves:", hours: "10:00 am - 09:00 pm" },
      { days: "Viernes:", hours: "10:00 am - 09:00 pm" },
      { days: "Sábado:", hours: "10:00 am - 09:00 pm" },
      { days: "Domingo:", hours: "10:00 am - 09:00 pm" },
    ],
    lat: -12.12809383694953,
    lng: -76.99508397573416,
    polygonPath: benavidesPoly
  },
]

const PROXIMITY_CLOSE_KM = 5; // Green
const PROXIMITY_MEDIUM_KM = 10; // Turquoise

export default function CoberturaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openSchedules, setOpenSchedules] = useState<number[]>([])
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any | null>(null)
  const [polygons, setPolygons] = useState<any[]>([])
  const searchMarkerRef = useRef<any | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => {
        setCurrentTime(new Date())
    }, 60000) 
    return () => clearInterval(interval)
  }, [])

  const toggleSchedule = (id: number) => {
    setOpenSchedules(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Filter removed to show all locations regardless of search query
  const filteredLocations = locations;

  const getStatusColor = (location: Location) => {
    if (location.type === 'remodeling') return "#9CA3AF" // Grey
    if (location.type === 'new') return "#1000a3" // Blue
    
    // Standard locations: check distance if user location is known
    if (userLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng)
        if (dist <= PROXIMITY_CLOSE_KM) return "#6BCB77" // Green (Very Close)
        if (dist <= PROXIMITY_MEDIUM_KM) return "#65DDB7" // Turquoise (Medium Close)
    }
    
    return "#D87272" // Default Red
  }
  
  const getPolygonColor = (location: Location) => {
      return getStatusColor(location)
  }

  const checkIsOpen = (schedule: { days: string; hours: string }[]) => {
    if (!currentTime) return false
    const dayOfWeek = currentTime.getDay()
    const scheduleIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const todaySchedule = schedule[scheduleIndex]
    if (!todaySchedule) return false
    const timeRange = todaySchedule.hours
    const match = timeRange.match(/(\d+):(\d+)\s+(am|pm)\s+-\s+(\d+):(\d+)\s+(am|pm)/i)
    if (!match) return false
    const [_, startH, startM, startAmPm, endH, endM, endAmPm] = match
    let startHour = parseInt(startH)
    if (startAmPm.toLowerCase() === 'pm' && startHour !== 12) startHour += 12
    if (startAmPm.toLowerCase() === 'am' && startHour === 12) startHour = 0
    let endHour = parseInt(endH)
    if (endAmPm.toLowerCase() === 'pm' && endHour !== 12) endHour += 12
    if (endAmPm.toLowerCase() === 'am' && endHour === 12) endHour = 0
    const startMinutes = startHour * 60 + parseInt(startM)
    const endMinutes = endHour * 60 + parseInt(endM)
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  }

  useEffect(() => {
    if (!googleMapRef.current) return;

    polygons.forEach(p => p.setMap(null));
    const newPolygons: any[] = [];

    locations.forEach((location) => {
        if (location.polygonPath && location.polygonPath.length > 0) {
             const color = getPolygonColor(location);
             
             const poly = new window.google.maps.Polygon({
                paths: location.polygonPath,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.35,
                map: googleMapRef.current,
            });
            newPolygons.push(poly);
        }
    });
    setPolygons(newPolygons);

  }, [userLocation]) 

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current || !googleMapRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        // Fallback to search logic if needed, but Autocomplete usually handles this.
        return;
    }

    const location = place.geometry.location;
    const lat = location.lat();
    const lng = location.lng();

    // Update state
    setSearchQuery(place.name || place.formatted_address || "");
    setUserLocation({ lat, lng });

    // Map operations
    googleMapRef.current.setCenter(location);
    googleMapRef.current.setZoom(14);

    // Manage Marker
    if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
    }

    searchMarkerRef.current = new window.google.maps.Marker({
        map: googleMapRef.current,
        position: location,
        title: place.name,
        icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#F59E0B", // Orange
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
        }
    });
  }

  const initMap = () => {
    if (mapRef.current && !googleMapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -12.046374, lng: -77.042793 },
        zoom: 11,
        mapTypeControl: true,
        streetViewControl: true,
        zoomControl: true,
        fullscreenControl: true,
        panControl: true, 
        mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_LEFT,
        },
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })
      googleMapRef.current = map

      // Initialize Autocomplete
      if (inputRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
              fields: ["geometry", "name", "formatted_address"],
          });
          autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
      }

      locations.forEach((location) => {
        const svgString = getFlagSvgString(location.id);
        const encodedSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);

        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.name,
          icon: {
            url: encodedSvg,
            scaledSize: new window.google.maps.Size(50, 50),
            anchor: new window.google.maps.Point(13, 50),
          },
        })

        marker.addListener("click", () => {
             map.panTo(marker.getPosition() as any);
             map.setZoom(15);
        });
      })
      
      const newPolygons: any[] = [];
      locations.forEach((location) => {
        if (location.polygonPath && location.polygonPath.length > 0) {
             const color = getPolygonColor(location);
             const poly = new window.google.maps.Polygon({
                paths: location.polygonPath,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.35,
                map: map,
            });
            newPolygons.push(poly);
        }
      });
      setPolygons(newPolygons);
    }
  }

  const handleLocationClick = (location: Location) => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: location.lat, lng: location.lng })
      googleMapRef.current.setZoom(15)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        if (googleMapRef.current) {
          googleMapRef.current.panTo({ lat: latitude, lng: longitude })
          googleMapRef.current.setZoom(12)
          
          // Clear search marker if exists
          if (searchMarkerRef.current) {
              searchMarkerRef.current.setMap(null);
              searchMarkerRef.current = null;
          }
          
          // Use a separate marker for user location or reuse logic?
          // The original code added a new marker every time. Let's clean that up too if we want.
          // For now, stick to adding it, but typically you'd want one user location marker.
          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: googleMapRef.current,
            title: "Tu ubicación",
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#2563EB", 
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
            }
          })
        }
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        alert("No se pudo obtener tu ubicación.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        // If autocomplete didn't trigger (e.g. raw text), we can try manual geocoding
        // or just let autocomplete handle it.
        // Often it's better to rely on the Place Changed event if the user selected something.
        // If they just typed and hit enter, the Autocomplete widget might not have fired.
        // Let's keep the old manual geocode as a fallback.
        
        if (!searchQuery) return;
        
        // Trigger manual geocode if needed, but usually the Autocomplete is preferred.
        // We'll leave the manual logic for when user types something not in the dropdown?
        // Google Autocomplete usually forces a selection or returns the text.
        
        // Let's fallback to the previous geocoding logic if autocompleteRef didn't fire recently?
        // Or just run it.
        
        if (!window.google || !window.google.maps || !googleMapRef.current) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                setUserLocation({ lat, lng });
                googleMapRef.current.setCenter(location);
                googleMapRef.current.setZoom(14);

                if (searchMarkerRef.current) {
                    searchMarkerRef.current.setMap(null);
                }

                searchMarkerRef.current = new window.google.maps.Marker({
                    map: googleMapRef.current,
                    position: location,
                    title: searchQuery,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#F59E0B",
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 2,
                    }
                });
            }
        });
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <CustomerHeader />
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCyHI_5Y6cx8D3SRm5pBPU9c2pYBlHuS58&callback=initMap&libraries=places`} 
        strategy="afterInteractive"
        onReady={() => {
           if (window.google && window.google.maps && !googleMapRef.current) {
             initMap();
           }
        }}
      />
      <Script id="google-map-init" strategy="afterInteractive">
        {`
          function initMap() {
            if (typeof window !== 'undefined') {
                // Trigger a custom event or just rely on onReady which checks for window.google
            }
          }
        `}
      </Script>
      
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Sidebar (List) */}
        <div
          className="w-full lg:w-[570px] flex flex-col bg-white border-r border-gray-200 z-10 shadow-xl lg:shadow-none h-full overflow-y-auto"
        >
          {/* Header Sidebar */}
          <div className="p-6 pb-2 bg-white shrink-0">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#1000a3] mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </Link>

            <h1 className="text-[28px] font-extrabold text-center text-gray-900 mb-[10px] font-secondary uppercase tracking-tight">
              Nuestra cobertura
            </h1>

            <p className="text-[16px] text-gray-500 mb-[20px]">
              Encuentra el local más cercano, ingresando tu dirección.
            </p>

            <div className="my-4 w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar local o dirección en Google Maps..."
                className="w-full h-12 rounded-lg py-2 pl-10 pr-10 border border-gray-300 focus:border-[#1000a3] focus:ring-[#1000a3] cursor-pointer"
              />
              {searchQuery && (
                <button 
                    onClick={() => {
                        setSearchQuery("");
                        if (searchMarkerRef.current) {
                            searchMarkerRef.current.setMap(null);
                            searchMarkerRef.current = null;
                        }
                    }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <button 
                onClick={handleUseCurrentLocation}
                className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#1000a3] mb-4 transition-colors cursor-pointer border border-gray-300 rounded-lg px-4 py-2 w-full justify-center hover:bg-gray-50 shadow-sm"
            >
              <Locate className="h-5 w-5 mr-2" />
              Usar ubicación actual
            </button>
          </div>

          {/* List */}
          <div className="px-6 space-y-4 flex-1 pb-10">
            {filteredLocations.map((location) => {
                const isOpen = checkIsOpen(location.schedule);
                const statusColor = getStatusColor(location);
                
                return (
              <div
                key={location.id}
                className="border border-gray-200 rounded-xl p-[10px] hover:border-[#1000a3]/30 transition-colors bg-white shadow-sm cursor-pointer"
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {/* Flag Icon using the SVG component */}
                    <FlagIcon number={location.id} />
                    
                    <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                    
                    {/* Dynamic Status Dot */}
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>

                  <Link href="/carta" passHref>
                    <Button className="bg-[#e2e200] hover:bg-[#d4d400] text-[#1000a3] font-bold text-sm px-4 py-2 h-auto rounded-lg cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        Ordena aquí
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#1000a3] text-white">
                    Recojo en tienda
                  </span>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#1000a3] text-white">
                    Delivery
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-black" strokeWidth={2} />
                    <p className="leading-tight">{location.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-black" strokeWidth={2} />
                    <p>{location.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 shrink-0 text-black" strokeWidth={2} />
                    <p className="flex items-center gap-1">
                      Horarios 
                      {isOpen ? (
                         <span className="text-[#6BCB77] font-medium ml-1">(Abierto)</span>
                      ) : (
                         <span className="text-[#DC2626] font-medium ml-1">(Cerrado)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pl-8">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSchedule(location.id);
                    }}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer group"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver horarios
                    {openSchedules.includes(location.id) ? (
                      <ChevronUp className="h-4 w-4 ml-1 group-hover:text-[#1000a3]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1 group-hover:text-[#1000a3]" />
                    )}
                  </button>
                  
                  {/* Horarios desplegables */}
                  {openSchedules.includes(location.id) && (
                    <div className="mt-3 space-y-2 text-sm text-gray-600 animate-in fade-in slide-in-from-top-1 duration-200 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {location.schedule.map((sch, index) => (
                        <div key={index} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                          <span className="font-semibold text-gray-800 text-xs uppercase tracking-wide w-24">{sch.days.replace(':', '')}</span>
                          <span className="text-gray-600 text-xs font-medium">{sch.hours}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Right side: Map - Sticky */}
        <div className="hidden lg:block flex-1 relative h-full bg-white">
           <div ref={mapRef} className="w-full h-full" />
        </div>
      </main>
    </div>
  )
}
