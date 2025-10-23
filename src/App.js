import React, { useEffect, useMemo, useRef, useState } from "react";

// Scotland Days Out — Leaflet map implemented without react-leaflet
// Reasons for this rewrite:
// - Avoids SSR/build-time issues caused by importing react-leaflet on the server.
// - Loads Leaflet dynamically on the client and initializes a map imperatively.
// - Keeps the existing UI, filters and favourites behavior.

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

export default function ScotlandDaysOut() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterCost, setFilterCost] = useState("all");
  const [filterWeather, setFilterWeather] = useState("all");
  const [dog, setDog] = useState(false);
  const [accessible, setAccessible] = useState(false);
  const [favourites, setFavourites] = useLocalStorage("sd_favs", []);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or map

  // Load activities data from JSON
  useEffect(() => {
    fetch('/activities.json')
      .then(res => res.json())
      .then(activities => {
        setData(activities);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load activities:', err);
        setLoading(false);
      });
  }, []);

  // map refs/state
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Initialize map when switching to map view
    if (viewMode !== "map" || !mapContainerRef.current) return;

    if (typeof window === 'undefined') return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled) return;

      const leaflet = L && L.default ? L.default : L;

      // Only initialize if not already done
      if (!mapRef.current) {
        try {
          mapRef.current = leaflet.map(mapContainerRef.current).setView([56.49, -4.2], 7);
          leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapRef.current);
          markersGroupRef.current = leaflet.layerGroup().addTo(mapRef.current);
          setLeafletLoaded(true);
        } catch (e) {
          console.error('Error initializing map:', e);
        }
      } else {
        // Map already exists, just invalidate size
        mapRef.current.invalidateSize();
        setLeafletLoaded(true);
      }
    }).catch((err) => {
      console.error('Failed to load leaflet', err);
    });

    return () => { cancelled = true; };
  }, [viewMode]);

  // update markers whenever filtered changes and map is ready
  const filtered = useMemo(() => data.filter(item => {
    if (showFavouritesOnly && !favourites.includes(item.id)) return false;
    if (filterCost !== "all") {
      if (filterCost === "free" && item.cost !== "free") return false;
      if (filterCost === "paid" && item.cost !== "paid") return false;
      if (filterCost === "mixed" && item.cost !== "mixed") return false;
    }
    if (filterWeather !== "all" && !item.weather.includes(filterWeather)) return false;
    if (dog && !item.dog_friendly) return false;
    if (accessible && !item.accessible) return false;
    if (query && !(item.name.toLowerCase().includes(query.toLowerCase()) || item.location.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  }), [data, filterCost, filterWeather, dog, accessible, query, showFavouritesOnly, favourites]);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    let L;
    try { L = require('leaflet'); } catch (e) { /* require may be unavailable in some bundlers */ }
    // Clear existing markers
    if (markersGroupRef.current && markersGroupRef.current.clearLayers) markersGroupRef.current.clearLayers();
    // Add markers
    const itemsWithCoords = filtered.filter(item => item.lat && item.lng);
    console.log('Adding markers:', itemsWithCoords.length, 'out of', filtered.length);
    itemsWithCoords.forEach(item => {
      if (L) {
        const marker = L.marker([item.lat, item.lng], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        });
        marker.bindPopup(`<div style="min-width: 200px;"><strong>${item.name}</strong><br/><small>${item.location}</small><br/><small>${item.price}</small></div>`);
        markersGroupRef.current.addLayer(marker);
        marker.on('popupopen', () => {
          // When popup opens, add a click handler to the popup content
          const popupElement = marker.getPopup().getElement();
          if (popupElement) {
            popupElement.addEventListener('click', (e) => {
              if (e.target.closest('strong') || e.target.closest('small')) {
                setSelected(item);
              }
            });
          }
        });
      }
    });
  }, [filtered, leafletLoaded]);

  // Close modal on Escape key or clicking outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selected) {
        setSelected(null);
      }
    };

    const handleClickOutside = (e) => {
      if (selected && e.target.classList.contains('modal-backdrop')) {
        setSelected(null);
      }
    };

    if (selected) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [selected]);

  const toggleFav = (id) => setFavourites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading activities...</div>
          <div className="text-slate-600">Fetching data from Scotland</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      <header className="header-gradient py-8 px-4 md:px-8 mb-8 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland — Family Days Out</h1>
              <p className="text-blue-100 mt-2 text-sm md:text-base">Discover amazing activities for the whole family</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-white">{filtered.length}</div>
              <div className="text-xs md:text-sm text-blue-100">activities</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-white p-6 rounded-2xl shadow-lg border border-cyan-100">
          <label className="block text-sm font-semibold text-slate-900">🔍 Search</label>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name or location" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />

          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-900">💰 Cost</label>
            <div className="mt-3 flex gap-2 flex-wrap">
              {[ ["all","All"],["free","🆓 Free"],["paid","💶 Paid"],["mixed","Mixed"] ].map(([key,label]) => (
                <button key={key} onClick={()=>setFilterCost(key)} className={`filter-btn ${filterCost===key?"filter-btn-active":"filter-btn-inactive"}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-900">🌤️ Weather</label>
            <div className="mt-3 flex gap-2">
              {[ ["all","All"],["sunny","☀️ Sunny"],["rainy","☔️ Rainy"] ].map(([key,label]) => (
                <button key={key} onClick={()=>setFilterWeather(key)} className={`px-3 py-2 text-sm rounded-full border transition-colors font-medium ${filterWeather===key?"bg-emerald-600 text-white border-emerald-600":"bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition">
              <input type="checkbox" checked={dog} onChange={(e)=>setDog(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
              <span className="font-medium text-slate-700">🐶 Dog friendly</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition">
              <input type="checkbox" checked={accessible} onChange={(e)=>setAccessible(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
              <span className="font-medium text-slate-700">♿️ Accessible</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-red-50 p-2 rounded-lg transition">
              <input type="checkbox" checked={showFavouritesOnly} onChange={(e)=>setShowFavouritesOnly(e.target.checked)} className="w-4 h-4 rounded accent-red-600" />
              <span className="font-medium text-slate-700">❤️ Favorites {favourites.length > 0 && `(${favourites.length})`}</span>
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">👁️ View Mode</h4>
            <div className="flex gap-2">
              <button onClick={()=>setViewMode("grid")} className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors font-medium ${viewMode==="grid"?"bg-purple-600 text-white border-purple-600 shadow-md":"bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"}`}>Grid</button>
              <button onClick={()=>setViewMode("map")} className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors font-medium ${viewMode==="map"?"bg-purple-600 text-white border-purple-600 shadow-md":"bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"}`}>Map</button>
            </div>
          </div>

        </aside>

        <section>
          {viewMode==="grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(item => (
                <article key={item.id} className="card-hover bg-white rounded-2xl p-5 shadow-md border border-cyan-100 flex flex-col overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                      <div className="text-sm text-slate-500 mt-1">📍 {item.location}</div>
                    </div>
                    <button onClick={()=>toggleFav(item.id)} className="text-2xl flex-shrink-0 transition hover:scale-110">{favourites.includes(item.id)?'❤️':'🤍'}</button>
                  </div>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="badge">{item.price}</span>
                    {item.ageRange && <span className="badge badge-emerald">{item.ageRange}</span>}
                  </div>

                  <p className="text-sm text-slate-600 flex-1 line-clamp-2">{item.description}</p>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-slate-500">{item.tags.join(' ')}</div>
                    <button onClick={()=>setSelected(item)} className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition">Details →</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ height: '600px' }}>
              <div ref={mapContainerRef} id="map" style={{ height: '100%', width: '100%' }} />
            </div>
          )}
        </section>
      </main>

      {selected && (
        <div className="modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" style={{ maxWidth: '500px' }}>
            <div className="header-gradient px-6 py-8 flex justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold">{selected.name}</h2>
                <div className="text-blue-100 mt-2">📍 {selected.location}</div>
              </div>
              <button onClick={()=>setSelected(null)} className="text-white text-2xl hover:opacity-80 transition flex-shrink-0">✕</button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4 flex-wrap items-center">
                <span className="badge">{selected.price}</span>
                {selected.ageRange && <span className="badge badge-emerald">{selected.ageRange}</span>}
                <button onClick={()=>toggleFav(selected.id)} className="ml-auto text-2xl transition hover:scale-110 flex-shrink-0">{favourites.includes(selected.id)?'❤️':'🤍'}</button>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">{selected.description}</p>

              {selected.opening_hours && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-slate-900 mb-2">🕐 Opening Hours</h3>
                  <p className="text-sm text-slate-700">{selected.opening_hours}</p>
                </div>
              )}

              {selected.website && (
                <div className="pt-4 border-t border-slate-200">
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                    🔗 Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
