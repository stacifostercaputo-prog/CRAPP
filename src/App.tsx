import React, { useState, useEffect } from 'react';
import { db, type Restroom } from './lib/supabase';
import { useAuth } from './lib/auth';
import { AuthScreens } from './components/AuthScreens';
import { MapView } from './components/MapView';
import { getCurrentLocation, calculateDistance, formatDistance, type Coordinates } from './lib/geolocation';
import { openDirections } from './lib/maps';

const DroppyMascot = ({ mood = 'happy', size = 80, animate = true }) => {
  const moods = {
    happy: { eyes: '◠', mouth: '‿', blush: true },
    excited: { eyes: '★', mouth: 'D', blush: true },
    wink: { eyes: '◠ –', mouth: '‿', blush: true },
    proud: { eyes: '◠', mouth: '▽', blush: true },
    thinking: { eyes: '•', mouth: '~', blush: false },
    sad: { eyes: '•', mouth: '︵', blush: false },
    shocked: { eyes: 'O', mouth: 'O', blush: false },
    love: { eyes: '♥', mouth: '‿', blush: true },
  };

  const currentMood = moods[mood] || moods.happy;

  return (
    <div
      className={`relative inline-flex flex-col items-center ${animate ? 'animate-bounce' : ''}`}
      style={{
        width: size,
        height: size * 1.3,
        animationDuration: '2s',
        animationIterationCount: 'infinite'
      }}
    >
      <div className="absolute -top-2 -right-1 text-yellow-400 text-xs animate-pulse">✨</div>
      <div className="absolute top-4 -left-3 text-cyan-300 text-xs animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>

      <svg viewBox="0 0 100 130" style={{ width: size, height: size * 1.3 }}>
        <ellipse cx="50" cy="125" rx="30" ry="5" fill="rgba(0,0,0,0.1)" />
        <path
          d="M50 5 C50 5, 15 50, 15 80 C15 105, 30 120, 50 120 C70 120, 85 105, 85 80 C85 50, 50 5, 50 5"
          fill="url(#dropletGradient)"
          stroke="#38BDF8"
          strokeWidth="2"
        />
        <ellipse cx="35" cy="60" rx="8" ry="12" fill="rgba(255,255,255,0.6)" />
        <ellipse cx="30" cy="55" rx="4" ry="6" fill="rgba(255,255,255,0.8)" />
        <text x="35" y="85" fontSize="14" textAnchor="middle" fill="#1E40AF">
          {currentMood.eyes.split(' ')[0]}
        </text>
        <text x="65" y="85" fontSize="14" textAnchor="middle" fill="#1E40AF">
          {currentMood.eyes.split(' ')[1] || currentMood.eyes.split(' ')[0]}
        </text>
        {currentMood.blush && (
          <>
            <ellipse cx="28" cy="90" rx="6" ry="4" fill="rgba(251,146,180,0.5)" />
            <ellipse cx="72" cy="90" rx="6" ry="4" fill="rgba(251,146,180,0.5)" />
          </>
        )}
        <text x="50" y="102" fontSize="16" textAnchor="middle" fill="#1E40AF">
          {currentMood.mouth}
        </text>
        <defs>
          <linearGradient id="dropletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const Sparkles = ({ count = 5 }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="absolute text-yellow-400 animate-pulse"
        style={{
          left: `${15 + i * 18}%`,
          top: `${10 + i * 15}%`,
          animationDelay: `${i * 0.3}s`,
          fontSize: `${12 + i * 2}px`
        }}
      >
        ✨
      </div>
    ))}
  </div>
);

const StarRating = ({ rating, size = 'md', interactive = false, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${sizes[size]} ${interactive ? 'cursor-pointer transition-transform hover:scale-125' : ''}`}
          style={{ color: star <= (hoverRating || rating) ? '#FFD93D' : '#E5E7EB' }}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate && onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const AmenityBadge = ({ icon, label, active = true }) => (
  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
    ${active ? 'bg-gradient-to-r from-cyan-100 to-sky-100 text-sky-700' : 'bg-gray-100 text-gray-400'}`}>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

const RestroomCard = ({ restroom, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-sky-200 group"
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 group-hover:text-sky-600 transition-colors">{restroom.name}</h3>
        <p className="text-sm text-gray-500">{restroom.type} • {restroom.distance}</p>
      </div>
      {restroom.sponsored && (
        <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full font-bold">
          ⭐ Featured
        </span>
      )}
    </div>
    <div className="flex items-center gap-2 mb-3">
      <StarRating rating={restroom.rating} size="sm" />
      <span className="text-sm text-gray-500">({restroom.reviews} reviews)</span>
    </div>
    <div className="flex flex-wrap gap-1">
      {restroom.changingTable && <AmenityBadge icon="🍼" label="Changing" />}
      {restroom.accessible && <AmenityBadge icon="♿" label="ADA" />}
      {restroom.singleStall && <AmenityBadge icon="🚽" label="Private" />}
    </div>
  </div>
);

export default function App() {
  const { user, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    changingTable: false,
    accessible: false,
    singleStall: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);

  useEffect(() => {
    const loadRestrooms = async () => {
      try {
        const data = await db.getRestrooms();
        setRestrooms(data);
      } catch (error) {
        console.error('Failed to load restrooms:', error);
        setRestrooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestrooms();
  }, []);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    };

    loadLocation();
  }, []);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('onboarding'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const SplashScreen = () => (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 relative overflow-hidden">
      <Sparkles count={8} />
      <div className="relative z-10 flex flex-col items-center">
        <DroppyMascot mood="excited" size={100} />
        <h1 className="text-4xl font-black text-white mt-4 tracking-tight">C.R.APP</h1>
        <p className="text-white/90 text-base font-medium mt-2">Clean Restroom App</p>
        <div className="mt-6 flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
        </div>
      </div>
    </div>
  );

  const OnboardingScreen = () => (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-100 to-emerald-100 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <DroppyMascot mood="happy" size={110} />
        <h1 className="text-2xl font-black text-gray-800 mt-4 text-center">
          Find Clean Restrooms<br />
          <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">Anywhere</span>
        </h1>
        <p className="text-gray-600 text-center mt-3 max-w-xs text-sm">
          Real ratings from real people. Never fear a dirty bathroom again! 🚽✨
        </p>
        <div className="mt-6 space-y-2 w-full max-w-xs">
          {[
            { icon: '🗺️', text: 'Find restrooms on a live map', bg: 'bg-sky-100' },
            { icon: '⭐', text: 'Trust community ratings', bg: 'bg-amber-100' },
            { icon: '🍼', text: 'Filter by your needs', bg: 'bg-emerald-100' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-700 text-sm">
              <span className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center text-lg`}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <button
          onClick={() => setCurrentScreen('home')}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
        >
          Get Started! 🎉
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );

  const HomeScreen = () => {
    const restroomsWithDistance = restrooms.map(r => ({
      ...r,
      distance: userLocation
        ? calculateDistance(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
        : 0
    })).sort((a, b) => a.distance - b.distance);

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white px-3 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <DroppyMascot mood="happy" size={28} animate={false} />
            <span className="font-black text-lg bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">C.R.APP</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowMap(!showMap)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm ${showMap ? 'bg-sky-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>🗺️</button>
            <button onClick={() => setShowFilters(true)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-sm">🎚️</button>
            <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-sm">👤</button>
          </div>
        </div>

        {showMap ? (
          <div className="flex-1">
            <MapView
              restrooms={restrooms}
              userLocation={userLocation}
              onRestroomSelect={(r) => { setSelectedRestroom(r); setCurrentScreen('detail'); setShowMap(false); }}
            />
          </div>
        ) : (
          <>
            <div className="h-32 bg-gradient-to-br from-emerald-200 via-cyan-200 to-sky-200 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute border-t border-white/50" style={{ top: `${i * 20}%`, width: '100%' }} />
                ))}
              </div>
              {restroomsWithDistance.slice(0, 4).map((r, i) => (
                <div
                  key={r.id}
                  className="absolute transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform z-10"
                  style={{ left: `${20 + i * 20}%`, top: `${25 + (i % 2) * 25}%` }}
                  onClick={() => { setSelectedRestroom(r); setCurrentScreen('detail'); }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg text-xs font-bold text-white bg-gradient-to-r from-sky-400 to-cyan-400">
                    {r.rating.toFixed(1)}
                  </div>
                </div>
              ))}
              {userLocation && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                </div>
              )}
              <div className="absolute bottom-1 left-2 bg-white/90 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                📍 {userLocation ? 'Your Location' : 'Getting location...'}
              </div>
            </div>
          </>
        )}

        {!showMap && (
          <div className="flex-1 overflow-auto p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-800 text-sm">Nearby Restrooms</h2>
              <span className="text-xs text-gray-500">{restrooms.length} found</span>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-2" />
                <p className="text-xs text-gray-500">Loading restrooms...</p>
              </div>
            ) : restrooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32">
                <p className="text-gray-500 text-sm">No restrooms found yet</p>
                <p className="text-xs text-gray-400 mt-1">Be the first to add one!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {restroomsWithDistance.map((restroom) => (
                  <RestroomCard
                    key={restroom.id}
                    restroom={{
                      id: restroom.id,
                      name: restroom.name,
                      type: restroom.type,
                      distance: formatDistance(restroom.distance),
                      rating: restroom.rating,
                      reviews: restroom.review_count,
                      changingTable: restroom.changing_table,
                      accessible: restroom.accessible,
                      singleStall: restroom.single_stall,
                      sponsored: false
                    }}
                    onClick={() => { setSelectedRestroom(restroom); setCurrentScreen('detail'); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      <button
        onClick={() => setCurrentScreen('add')}
        className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center text-white text-xl font-bold hover:scale-110 transition-transform active:scale-95"
      >+</button>

      {showFilters && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full rounded-t-3xl p-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-800 mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Minimum Rating</label>
                <div className="flex gap-2">
                  {[0, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFilters(f => ({...f, minRating: val}))}
                      className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                        ${filters.minRating === val ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >{val === 0 ? 'Any' : `${val}+ ⭐`}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { key: 'changingTable', icon: '🍼', label: 'Changing Table' },
                  { key: 'accessible', icon: '♿', label: 'ADA Accessible' },
                  { key: 'singleStall', icon: '🚽', label: 'Single Stall' },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilters(f => ({...f, [key]: !f[key]}))}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl transition-all text-sm
                      ${filters[key] ? 'bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <span>{icon}</span>
                    <span className="font-medium">{label}</span>
                    {filters[key] && <span className="ml-auto text-sky-500">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setFilters({ minRating: 0, changingTable: false, accessible: false, singleStall: false })} className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 text-sm">Clear All</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg shadow-sky-200 text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  const DetailScreen = () => {
    if (!selectedRestroom) return null;
    const r = selectedRestroom;
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-32 bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 relative">
          <button onClick={() => setCurrentScreen('home')} className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-sm">←</button>
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-5xl opacity-50">🚽</span></div>
          {r.sponsored && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full font-bold text-xs">⭐ Featured</div>
          )}
        </div>
        <div className="flex-1 overflow-auto -mt-4 relative">
          <div className="bg-white rounded-t-3xl p-4">
            <h1 className="text-xl font-black text-gray-800">{r.name}</h1>
            <p className="text-gray-500 text-sm">{r.type}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(r.rating)} size="md" />
              <span className="text-lg font-bold text-gray-800">{r.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({r.review_count} reviews)</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openDirections(r.latitude, r.longitude, r.name)} className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-lg shadow-sky-200 text-sm">🧭 Directions</button>
              <button onClick={() => setCurrentScreen('rate')} className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-lg shadow-amber-200 text-sm">⭐ Rate</button>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">Amenities</h3>
              <div className="flex flex-wrap gap-1.5">
                <AmenityBadge icon="🍼" label="Changing Table" active={r.changing_table} />
                <AmenityBadge icon="♿" label="ADA Accessible" active={r.accessible} />
                <AmenityBadge icon="🚽" label="Single Stall" active={r.single_stall} />
                <AmenityBadge icon="💡" label="Well Lit" active={r.well_lit} />
                <AmenityBadge icon="🧴" label="Stocked" active={r.stocked} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">Recent Reviews</h3>
              <div className="space-y-2">
                {[
                  { name: 'Sarah M.', rating: 5, comment: 'Super clean! Best bathroom on the highway. ✨', date: '2 days ago' },
                  { name: 'Mike T.', rating: 4, comment: 'Very clean, well stocked. A bit busy during lunch.', date: '1 week ago' },
                ].map((review, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs">{review.name[0]}</div>
                        <span className="font-medium text-gray-800 text-sm">{review.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-gray-600 text-xs mt-1">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-gray-400 text-xs hover:text-gray-600 transition-colors">🚩 Report an issue</button>
          </div>
        </div>
      </div>
    );
  };

  const RateScreen = () => {
    if (!selectedRestroom) return null;
    const r = selectedRestroom;
    const [comment, setComment] = useState('');
    const [tags, setTags] = useState([]);
    const availableTags = ['Very Clean', 'Well Stocked', 'Good Lighting', 'Spacious', 'Quick Access'];

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('detail')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">Rate This Restroom</h1>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="text-center mb-4">
            <DroppyMascot mood={userRating >= 4 ? 'love' : userRating >= 1 ? 'happy' : 'thinking'} size={70} />
            <h2 className="font-bold text-lg text-gray-800 mt-2">{r.name}</h2>
            <p className="text-gray-500 text-sm">{r.type}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-gray-600 mb-2 text-sm">How clean was it?</p>
            <div className="flex justify-center">
              <StarRating rating={userRating} size="lg" interactive onRate={setUserRating} />
            </div>
            {userRating > 0 && (
              <p className="text-sky-600 font-medium mt-2 text-sm">
                {userRating === 5 ? 'Sparkling clean! ✨' : userRating === 4 ? 'Very clean!' : userRating === 3 ? 'Acceptable' : userRating === 2 ? 'Needs improvement' : 'Not great...'}
              </p>
            )}
          </div>
          <div className="mt-4">
            <p className="text-gray-600 mb-2 text-sm">Quick tags (optional)</p>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
                    ${tags.includes(tag) ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white' : 'bg-gray-100 text-gray-600'}`}
                >{tag}</button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 mb-2 text-sm">Add a comment (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-sky-300 focus:outline-none resize-none text-sm"
              rows={2}
            />
          </div>
        </div>
        <div className="p-4 pt-0">
          <button
            onClick={async () => {
              if (!user) {
                setShowAuth(true);
                return;
              }
              if (r && userRating > 0) {
                try {
                  await db.createReview({
                    restroom_id: r.id,
                    user_id: user.id,
                    rating: userRating,
                    comment: comment || '',
                    tags: tags
                  });
                  setCurrentScreen('home');
                  setUserRating(0);
                  const data = await db.getRestrooms();
                  setRestrooms(data);
                } catch (error) {
                  console.error('Failed to submit review:', error);
                }
              }
            }}
            disabled={userRating === 0}
            className={`w-full py-3 rounded-2xl font-bold transition-all text-sm
              ${userRating > 0 ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >Submit Review 🎉</button>
        </div>
      </div>
    );
  };

  const AddScreen = () => {
    if (!user) {
      return (
        <div className="h-full flex flex-col bg-white">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-3 flex items-center gap-2">
            <button onClick={() => setCurrentScreen('home')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
            <h1 className="text-white font-bold">Add a Restroom</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <DroppyMascot mood="thinking" size={70} />
            <h2 className="text-xl font-bold text-gray-800 mt-4">Sign in to Add</h2>
            <p className="text-gray-500 text-sm mt-2 text-center">Create a free account to contribute restrooms and help the community!</p>
            <button
              onClick={() => setShowAuth(true)}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200"
            >Sign In / Sign Up</button>
          </div>
        </div>
      );
    }

    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [amenities, setAmenities] = useState({ changingTable: false, accessible: false, singleStall: false });
    const types = ['Gas Station', 'Restaurant', 'Hotel', 'Park', 'Retail', 'Coffee Shop'];

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('home')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">Add a Restroom</h1>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="text-center mb-4">
            <DroppyMascot mood="proud" size={70} />
            <p className="text-gray-600 mt-2 text-sm">Help others find clean restrooms! 🙏</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Using Current Location</p>
                <p className="text-xs text-gray-500">Lakeway, TX 78734</p>
              </div>
              <button className="ml-auto text-emerald-600 font-medium text-xs">Change</button>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Business Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Buc-ee's, Starbucks"
              className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-300 focus:outline-none text-sm"
            />
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Type *</label>
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${type === t ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white' : 'bg-gray-100 text-gray-600'}`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Amenities</label>
            <div className="space-y-1.5">
              {[
                { key: 'changingTable', icon: '🍼', label: 'Changing Table' },
                { key: 'accessible', icon: '♿', label: 'ADA Accessible' },
                { key: 'singleStall', icon: '🚽', label: 'Single Stall' },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setAmenities(a => ({...a, [key]: !a[key]}))}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-xl transition-all text-sm
                    ${amenities[key] ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  <span>{icon}</span>
                  <span className="font-medium">{label}</span>
                  {amenities[key] && <span className="ml-auto text-emerald-500">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 pt-0">
          <button
            onClick={() => setCurrentScreen('home')}
            disabled={!name || !type}
            className={`w-full py-3 rounded-2xl font-bold transition-all text-sm
              ${name && type ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >Add Restroom 🚽✨</button>
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const [profile, setProfile] = useState<any>(null);
    const [favoriteCount, setFavoriteCount] = useState(0);

    useEffect(() => {
      const loadProfile = async () => {
        if (user) {
          const data = await db.getUserProfile(user.id);
          setProfile(data);
          const favorites = await db.getFavorites(user.id);
          setFavoriteCount(favorites?.length || 0);
        }
      };
      loadProfile();
    }, [user]);

    if (!user) {
      return (
        <div className="h-full flex flex-col bg-gray-50">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 flex items-center gap-2">
            <button onClick={() => setCurrentScreen('home')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
            <h1 className="text-white font-bold">Profile</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <DroppyMascot mood="thinking" size={70} />
            <h2 className="text-xl font-bold text-gray-800 mt-4">Sign in to Continue</h2>
            <p className="text-gray-500 text-sm mt-2 text-center">Create an account to save reviews, add restrooms, and track your contributions!</p>
            <button
              onClick={() => setShowAuth(true)}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-200"
            >Sign In / Sign Up</button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('home')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">Profile</h1>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="bg-white p-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full mx-auto flex items-center justify-center">
              <DroppyMascot mood="proud" size={50} animate={false} />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mt-3">{profile?.username || 'User'}</h2>
            <p className="text-gray-500 text-sm">Member since {new Date(profile?.created_at || user.created_at).getFullYear()}</p>
            <div className="flex justify-center gap-6 mt-3">
              <div className="text-center">
                <p className="font-bold text-xl text-sky-500">{profile?.review_count || 0}</p>
                <p className="text-xs text-gray-500">Reviews</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-emerald-500">{profile?.restroom_added_count || 0}</p>
                <p className="text-xs text-gray-500">Added</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-amber-500">🏆</p>
                <p className="text-xs text-gray-500">{profile?.badge || 'New'}</p>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-1.5">
            {[
              { icon: '⭐', label: 'My Reviews', badge: String(profile?.review_count || 0), screen: 'myReviews' },
              { icon: '🚽', label: 'Restrooms I Added', badge: String(profile?.restroom_added_count || 0), screen: 'myRestrooms' },
              { icon: '❤️', label: 'Favorites', badge: String(favoriteCount), screen: 'favorites' },
              { icon: '👑', label: 'Upgrade to Pro', highlight: true, screen: 'upgrade' },
              { icon: '⚙️', label: 'Settings', screen: 'settings' },
              { icon: '❓', label: 'Help & Support', screen: 'help' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrentScreen(item.screen)}
                className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all text-sm
                  ${item.highlight ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <span>{item.icon}</span>
                <span className={`font-medium ${item.highlight ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${item.highlight ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-600'}`}>{item.badge}</span>
                )}
                {!item.badge && <span className={`ml-auto ${item.highlight ? 'text-white/70' : 'text-gray-400'}`}>→</span>}
              </button>
            ))}
          </div>
          <div className="p-3">
            <button
              onClick={async () => {
                await signOut();
                setCurrentScreen('home');
              }}
              className="w-full py-2.5 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors text-sm"
            >Log Out</button>
          </div>
        </div>
      </div>
    );
  };

  const FavoritesScreen = () => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadFavorites = async () => {
        if (user) {
          const data = await db.getFavorites(user.id);
          setFavorites(data || []);
        }
        setLoading(false);
      };
      loadFavorites();
    }, [user]);

    const handleRemoveFavorite = async (restroomId: string) => {
      if (user) {
        await db.removeFavorite(user.id, restroomId);
        setFavorites(favorites.filter(f => f.restroom_id !== restroomId));
      }
    };

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">Favorites</h1>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-2" />
              <p className="text-xs text-gray-500">Loading favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <DroppyMascot mood="sad" size={70} />
              <h3 className="text-lg font-bold text-gray-800 mt-4">No Favorites Yet</h3>
              <p className="text-gray-500 text-sm mt-2 text-center px-8">Start favoriting restrooms to quickly find your go-to spots!</p>
              <button onClick={() => setCurrentScreen('home')} className="mt-4 px-6 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold text-sm">Find Restrooms</button>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1" onClick={() => { setSelectedRestroom(fav.restrooms); setCurrentScreen('detail'); }}>
                      <h3 className="font-bold text-gray-800">{fav.restrooms.name}</h3>
                      <p className="text-sm text-gray-500">{fav.restrooms.type}</p>
                    </div>
                    <button onClick={() => handleRemoveFavorite(fav.restroom_id)} className="text-red-500 text-lg">❤️</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(fav.restrooms.rating)} size="sm" />
                    <span className="text-sm text-gray-500">({fav.restrooms.review_count})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SettingsScreen = () => {
    const [preferences, setPreferences] = useState<any>({
      notifications_enabled: true,
      location_tracking: true,
      dark_mode: false,
      distance_unit: 'miles'
    });

    useEffect(() => {
      const loadPreferences = async () => {
        if (user) {
          const data = await db.getUserPreferences(user.id);
          if (data) setPreferences(data);
        }
      };
      loadPreferences();
    }, [user]);

    const updatePref = async (key: string, value: any) => {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      if (user) {
        await db.updateUserPreferences(user.id, updated);
      }
    };

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">Settings</h1>
        </div>
        <div className="flex-1 overflow-auto p-3">
          <div className="bg-white rounded-2xl p-4 mb-3">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">Enable Notifications</p>
                  <p className="text-xs text-gray-500">Get updates about nearby restrooms</p>
                </div>
                <button onClick={() => updatePref('notifications_enabled', !preferences.notifications_enabled)} className={`w-11 h-6 rounded-full transition-colors ${preferences.notifications_enabled ? 'bg-sky-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences.notifications_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">Location Tracking</p>
                  <p className="text-xs text-gray-500">Find restrooms near you</p>
                </div>
                <button onClick={() => updatePref('location_tracking', !preferences.location_tracking)} className={`w-11 h-6 rounded-full transition-colors ${preferences.location_tracking ? 'bg-sky-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences.location_tracking ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">Dark Mode</p>
                  <p className="text-xs text-gray-500">Coming soon!</p>
                </div>
                <button disabled className="w-11 h-6 rounded-full bg-gray-200 cursor-not-allowed">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 mb-3">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Distance Unit</h3>
            <div className="flex gap-2">
              <button onClick={() => updatePref('distance_unit', 'miles')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${preferences.distance_unit === 'miles' ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white' : 'bg-gray-100 text-gray-600'}`}>Miles</button>
              <button onClick={() => updatePref('distance_unit', 'kilometers')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${preferences.distance_unit === 'kilometers' ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white' : 'bg-gray-100 text-gray-600'}`}>Kilometers</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">About</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">Version 1.0.0</p>
              <button className="text-sky-600 font-medium">Terms of Service</button>
              <button className="text-sky-600 font-medium block">Privacy Policy</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MyRestroomsScreen = () => {
    const [myRestrooms, setMyRestrooms] = useState<Restroom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadRestrooms = async () => {
        if (user) {
          const data = await db.getUserRestrooms(user.id);
          setMyRestrooms(data);
        }
        setLoading(false);
      };
      loadRestrooms();
    }, [user]);

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">Restrooms I Added</h1>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2" />
              <p className="text-xs text-gray-500">Loading restrooms...</p>
            </div>
          ) : myRestrooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <DroppyMascot mood="thinking" size={70} />
              <h3 className="text-lg font-bold text-gray-800 mt-4">No Restrooms Added</h3>
              <p className="text-gray-500 text-sm mt-2 text-center px-8">Be a hero! Add restrooms to help your community.</p>
              <button onClick={() => setCurrentScreen('add')} className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-sm">Add Restroom</button>
            </div>
          ) : (
            <div className="space-y-2">
              {myRestrooms.map((restroom) => (
                <div key={restroom.id} onClick={() => { setSelectedRestroom(restroom); setCurrentScreen('detail'); }} className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">{restroom.name}</h3>
                      <p className="text-sm text-gray-500">{restroom.type}</p>
                    </div>
                    <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">Your add</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(restroom.rating)} size="sm" />
                    <span className="text-sm text-gray-500">({restroom.review_count} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const MyReviewsScreen = () => {
    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadReviews = async () => {
        if (user) {
          const data = await db.getUserReviews(user.id);
          setMyReviews(data || []);
        }
        setLoading(false);
      };
      loadReviews();
    }, [user]);

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-3 flex items-center gap-2">
          <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
          <h1 className="text-white font-bold">My Reviews</h1>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2" />
              <p className="text-xs text-gray-500">Loading reviews...</p>
            </div>
          ) : myReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <DroppyMascot mood="wink" size={70} />
              <h3 className="text-lg font-bold text-gray-800 mt-4">No Reviews Yet</h3>
              <p className="text-gray-500 text-sm mt-2 text-center px-8">Share your experiences to help others find clean restrooms!</p>
              <button onClick={() => setCurrentScreen('home')} className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-bold text-sm">Find Restrooms</button>
            </div>
          ) : (
            <div className="space-y-2">
              {myReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">{review.restrooms?.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">{review.restrooms?.type || ''}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {review.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const HelpScreen = () => (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-3 flex items-center gap-2">
        <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
        <h1 className="text-white font-bold">Help & Support</h1>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="text-center mb-6">
          <DroppyMascot mood="happy" size={70} />
          <h2 className="text-lg font-bold text-gray-800 mt-3">How can we help?</h2>
        </div>
        <div className="space-y-2">
          {[
            { icon: '📖', title: 'Getting Started', desc: 'Learn the basics of C.R.APP' },
            { icon: '❓', title: 'FAQs', desc: 'Frequently asked questions' },
            { icon: '🎯', title: 'How to Rate', desc: 'Tips for writing helpful reviews' },
            { icon: '📍', title: 'Adding Restrooms', desc: 'Guide to adding new locations' },
            { icon: '💬', title: 'Contact Support', desc: 'Get in touch with our team' },
            { icon: '🐛', title: 'Report a Bug', desc: 'Help us improve the app' },
          ].map((item, i) => (
            <button key={i} className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
        <div className="bg-sky-50 rounded-2xl p-4 mt-4 text-center">
          <p className="text-sm text-gray-700 mb-2">Still need help?</p>
          <button className="px-6 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold text-sm">Email Support</button>
        </div>
      </div>
    </div>
  );

  const UpgradeScreen = () => (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-3 flex items-center gap-2">
        <button onClick={() => setCurrentScreen('profile')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm">←</button>
        <h1 className="text-white font-bold">Upgrade to Pro</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">👑</div>
          <h2 className="text-2xl font-black text-gray-800">C.R.APP Pro</h2>
          <p className="text-gray-600 text-sm mt-2">Unlock premium features</p>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg border-2 border-amber-200">
          <div className="text-center mb-4">
            <span className="text-3xl font-black text-gray-800">$4.99</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <div className="space-y-3 mb-4">
            {[
              'Remove all ads',
              'Offline maps access',
              'Advanced filters',
              'Priority support',
              'Custom badges',
              'Detailed analytics',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform">Start Free Trial</button>
          <p className="text-xs text-gray-500 text-center mt-2">7-day free trial, cancel anytime</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-center mb-4">
            <span className="text-3xl font-black text-gray-800">$49.99</span>
            <span className="text-gray-500 text-sm">/year</span>
            <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Save 17%</span>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-bold">Choose Yearly</button>
        </div>
      </div>
    </div>
  );

  const UpgradeBanner = () => {
    if (!showUpgradeBanner) return null;
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 p-3 flex items-center gap-3 shadow-lg">
        <span className="text-2xl">👑</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Upgrade to Pro</p>
          <p className="text-white/90 text-xs">Remove ads & unlock features</p>
        </div>
        <button onClick={() => setCurrentScreen('upgrade')} className="bg-white text-amber-600 px-4 py-1.5 rounded-full font-bold text-xs">Upgrade</button>
        <button onClick={() => setShowUpgradeBanner(false)} className="text-white/70 text-lg">×</button>
      </div>
    );
  };

  const screens = {
    splash: SplashScreen,
    onboarding: OnboardingScreen,
    home: HomeScreen,
    detail: DetailScreen,
    rate: RateScreen,
    add: AddScreen,
    profile: ProfileScreen,
    favorites: FavoritesScreen,
    settings: SettingsScreen,
    myRestrooms: MyRestroomsScreen,
    myReviews: MyReviewsScreen,
    help: HelpScreen,
    upgrade: UpgradeScreen
  };
  const CurrentScreen = screens[currentScreen] || HomeScreen;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="relative">
        <div className="w-72 h-[600px] bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl">
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-50" />
            <div className="w-full h-full pt-6">
              <CurrentScreen />
              {!['splash', 'onboarding', 'upgrade'].includes(currentScreen) && <UpgradeBanner />}
            </div>
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-900 rounded-full" />
          </div>
        </div>
        <div className="text-center mt-3 text-slate-500 text-xs">Click through the app to explore! ✨</div>
      </div>
      {showAuth && <AuthScreens onClose={() => setShowAuth(false)} />}
    </div>
  );
}
