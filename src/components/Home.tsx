import { useState } from 'react';
import { Search, Calendar, MapPin, Users, Menu, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Location } from '../App';
import { getHeroBackgroundImage, getUniversityLogo } from '../utils/facilityImages';
import universityPlaygroundImg from './assets/images/locations/logo.png';

type HomeProps = {
  locations: Location[];
  onViewLocation: (locationId: string) => void;
  onNavigate: (page: 'login' | 'signup' | 'user-dashboard' | 'admin-dashboard') => void;
  user: User | null;
  onLogout: () => void;
};

export function Home({ locations, onViewLocation, onNavigate, user, onLogout }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">UniBook</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  {user.role === 'admin' ? (
                    <Button onClick={() => onNavigate('admin-dashboard')} variant="outline">
                      Admin Dashboard
                    </Button>
                  ) : (
                    <Button onClick={() => onNavigate('user-dashboard')} variant="outline">
                      My Bookings
                    </Button>
                  )}
                  <Button onClick={onLogout} variant="ghost">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => onNavigate('login')} variant="ghost">
                    Login
                  </Button>
                  <Button onClick={() => onNavigate('signup')}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {user ? (
                <>
                  <div className="text-gray-700 px-4 py-2">Welcome, {user.name}</div>
                  {user.role === 'admin' ? (
                    <Button 
                      onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }} 
                      variant="outline" 
                      className="w-full"
                    >
                      Admin Dashboard
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => { onNavigate('user-dashboard'); setMobileMenuOpen(false); }} 
                      variant="outline" 
                      className="w-full"
                    >
                      My Bookings
                    </Button>
                  )}
                  <Button onClick={onLogout} variant="ghost" className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} 
                    variant="ghost" 
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }} 
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 rounded-[5px]">
          {/* University Logo */}
          
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
              Book University Facilities with Ease.
              <div className="text-2xl md:text-3xl lg:text-4xl mt-4">
                Wayamba University Of Sri Lanka
              </div>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Reserve playgrounds, auditoriums, and more for your events
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for a facility..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl mb-2">5</div>
              <div className="text-gray-600">Premium Locations</div>
            </div>
            <div>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl mb-2">2,750+</div>
              <div className="text-gray-600">Total Capacity</div>
            </div>
            <div>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl mb-2">24/7</div>
              <div className="text-gray-600">Online Booking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Locations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">
            Our Facilities
          </h2>
          <p className="text-xl text-gray-600">
            Choose from our premium university locations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64">
                <ImageWithFallback
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl mb-2">{location.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {location.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Capacity: {location.capacity}</span>
                  </div>
                </div>
                <Button
                  onClick={() => onViewLocation(location.id)}
                  className="w-full"
                >
                  View Details & Book
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No facilities found matching your search.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl">UniBook</span>
              </div>
              <p className="text-gray-400">
                Making university facility booking simple and efficient.
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>FAQ</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: bookings@university.edu</li>
                <li>Phone: (555) 123-4567</li>
                <li>Office Hours: Mon-Fri 9AM-5PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 UniBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
