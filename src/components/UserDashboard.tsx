import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Clock, MapPin, User as UserIcon, Phone, FileText, Users, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Location } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type UserDashboardProps = {
  user: User;
  accessToken: string | null;
  locations: Location[];
  onNavigate: (page: 'home') => void;
  onLogout: () => void;
  onViewLocation: (locationId: string) => void;
};

type BookingRecord = {
  booking_id: string;
  location_id: string;
  location_name: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  organizer_name: string;
  organizer_contact: string;
  expected_attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes?: string;
};

export function UserDashboard({ user, accessToken, locations, onNavigate, onLogout, onViewLocation }: UserDashboardProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-099d3103/user-bookings`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '?';
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => onNavigate('home')}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Home
              </Button>
              <div className="border-l h-6"></div>
              <h1 className="text-2xl">My Bookings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <Button variant="ghost" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Total Bookings</div>
            <div className="text-3xl">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Pending</div>
            <div className="text-3xl text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Approved</div>
            <div className="text-3xl text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 mb-2">Rejected</div>
            <div className="text-3xl text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <Label className="text-gray-700">Filter by Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't made any bookings yet."
                : `You don't have any ${filterStatus} bookings.`}
            </p>
            <Button onClick={() => onNavigate('home')}>
              Browse Facilities
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.booking_id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl mb-1">{booking.location_name}</h3>
                      <p className="text-sm text-gray-500">Booking ID: {booking.booking_id}</p>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} border`}>
                      <span className="mr-1">{getStatusIcon(booking.status)}</span>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Date</div>
                        <div>{new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Time</div>
                        <div>{booking.start_time} - {booking.end_time}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Expected Attendees</div>
                        <div>{booking.expected_attendees}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Organizer</div>
                        <div>{booking.organizer_name}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Contact</div>
                        <div>{booking.organizer_contact}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Submitted</div>
                        <div>{new Date(booking.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-500 mb-1">Purpose</div>
                    <p className="text-gray-700">{booking.purpose}</p>
                  </div>

                  {booking.admin_notes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Admin Notes</div>
                      <p className="text-gray-700">{booking.admin_notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewLocation(booking.location_id)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View Location
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
