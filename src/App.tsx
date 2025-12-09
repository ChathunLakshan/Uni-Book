import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { LocationDetail } from './components/LocationDetail';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Import images from src folder
import universityPlaygroundImg from './assets/images/locations/university-playground.jpg';
import auditoriumImg from './assets/images/locations/auditorium.jpg';
import indoorStadiumImg from './assets/images/locations/indoor-stadium.jpg';
import miniAuditoriumImg from './assets/images/locations/mini-auditorium.jpg';
import studentCenterImg from './assets/images/locations/student-center.jpg';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

export type Location = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  rules: string[];
  image: string;
  amenities: string[];
};

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'location' | 'user-dashboard' | 'admin-dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locations: Location[] = [
    {
      id: 'university-playground',
      name: 'University Playground',
      description: 'A spacious outdoor facility perfect for sports events, team practices, and recreational activities. Features include well-maintained grass fields, running tracks, and spectator seating.',
      capacity: 500,
      rules: [
        'All participants must sign a liability waiver',
        'Proper athletic attire and footwear required',
        'No glass containers allowed',
        'Events must end by 10:00 PM',
        'Organizer responsible for cleanup',
        'Emergency contact must be provided'
      ],
      image: universityPlaygroundImg,
      amenities: ['Changing Rooms', 'Restrooms', 'Water Fountains', 'First Aid Station', 'Parking']
    },
    {
      id: 'auditorium',
      name: 'Auditorium',
      description: 'A premier venue for large-scale events, conferences, and performances. Equipped with state-of-the-art sound system, professional lighting, and comfortable seating for hundreds of attendees.',
      capacity: 800,
      rules: [
        'Professional event coordination required for events over 300 people',
        'Technical rehearsal must be scheduled 24 hours in advance',
        'No food or beverages in seating area',
        'All decorations must be approved by facility manager',
        'Sound levels must not exceed 95 decibels',
        'Security personnel required for events over 500 attendees'
      ],
      image: auditoriumImg,
      amenities: ['Stage', 'Sound System', 'Projector & Screen', 'Green Room', 'Backstage Area', 'Air Conditioning']
    },
    {
      id: 'indoor-stadium',
      name: 'Indoor Stadium',
      description: 'A versatile indoor facility perfect for basketball, volleyball, badminton, and other court sports. Climate-controlled environment with professional-grade flooring and equipment.',
      capacity: 300,
      rules: [
        'Only non-marking shoes allowed on court',
        'Booking includes setup and cleanup time',
        'Equipment checkout requires student ID',
        'No outdoor shoes on playing surface',
        'Temperature control set between 68-72°F',
        'Maximum 4-hour booking slots'
      ],
      image: indoorStadiumImg,
      amenities: ['Locker Rooms', 'Showers', 'Equipment Storage', 'Seating Area', 'Score Board', 'Water Stations']
    },
    {
      id: 'mini-auditorium',
      name: 'Mini Auditorium',
      description: 'An intimate venue ideal for seminars, workshops, presentations, and small performances. Features modern AV equipment and flexible seating arrangements.',
      capacity: 150,
      rules: [
        'Setup must be completed 30 minutes before event start',
        'Catering allowed with prior approval',
        'AV equipment training required for operators',
        'Room must be returned to original configuration',
        'No smoking or vaping',
        'Guest WiFi available for attendees'
      ],
      image: miniAuditoriumImg,
      amenities: ['Podium', 'Microphone System', 'WiFi', 'Whiteboard', 'Projector', 'Flexible Seating']
    },
    {
      id: 'student-center',
      name: 'Student Center',
      description: 'A vibrant multi-purpose facility serving as the heart of campus life. Perfect for large student gatherings, cultural events, club activities, and social functions. Features spacious halls, modern amenities, and flexible spaces to accommodate diverse student needs.',
      capacity: 1000,
      rules: [
        'Student organization registration required for event hosting',
        'Events must comply with university code of conduct',
        'Alcohol prohibited without special approval',
        'Music and entertainment must end by 11:00 PM on weekdays, midnight on weekends',
        'Minimum 2-week advance booking required for events over 500 people',
        'Organizers must provide event staffing plan',
        'Decorations must be fire-safe and approved in advance',
        'Cleanup must be completed within 2 hours of event end'
      ],
      image: studentCenterImg,
      amenities: ['Meeting Rooms', 'Lounge Areas', 'Food Court', 'WiFi', 'Study Spaces', 'Game Room', 'Event Hall', 'Outdoor Terrace', 'Audio/Visual Equipment', 'Parking']
    }
  ];

  useEffect(() => {
    // Initialize demo accounts on first load
    const initDemoAccounts = async () => {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-099d3103/init-demo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
      } catch (error) {
        console.log('Demo accounts may already exist');
      }
    };
    
    initDemoAccounts();
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: metadata.name || 'User',
          role: metadata.role || 'user'
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        setAccessToken(data.session.access_token);
        const metadata = data.session.user.user_metadata;
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: metadata.name || 'User',
          role: metadata.role || 'user'
        });
        
        if (metadata.role === 'admin') {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage('home');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-099d3103/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      alert('Signup successful! Please login with your credentials.');
      setCurrentPage('login');
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(`Signup failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setCurrentPage('home');
  };

  const handleViewLocation = (locationId: string) => {
    setSelectedLocation(locationId);
    setCurrentPage('location');
  };

  const handleNavigate = (page: 'home' | 'login' | 'signup' | 'user-dashboard' | 'admin-dashboard') => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && (
        <Home 
          locations={locations}
          onViewLocation={handleViewLocation}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'login' && (
        <Login 
          onLogin={handleLogin}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'signup' && (
        <Signup 
          onSignup={handleSignup}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'location' && selectedLocation && (
        <LocationDetail 
          location={locations.find(l => l.id === selectedLocation)!}
          onBack={() => setCurrentPage('home')}
          user={user}
          accessToken={accessToken}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'user-dashboard' && user && (
        <UserDashboard 
          user={user}
          accessToken={accessToken}
          locations={locations}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onViewLocation={handleViewLocation}
        />
      )}
      {currentPage === 'admin-dashboard' && user?.role === 'admin' && (
        <AdminDashboard 
          user={user}
          accessToken={accessToken}
          locations={locations}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;