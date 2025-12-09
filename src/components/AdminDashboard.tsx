import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Clock, MapPin, User as UserIcon, Phone, FileText, Users, Filter, Check, X, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { User, Location } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type AdminDashboardProps = {
  user: User;
  accessToken: string | null;
  locations: Location[];
  onNavigate: (page: 'home') => void;
  onLogout: () => void;
};

type BookingRecord = {
  booking_id: string;
  user_id: string;
  user_email: string;
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

export function AdminDashboard({ user, accessToken, locations, onNavigate, onLogout }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-099d3103/admin/bookings`,
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
        alert('Failed to fetch bookings. Please ensure you have admin access.');
      }
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (booking: BookingRecord, action: 'approve' | 'reject') => {
    setSelectedBooking(booking);
    setActionType(action);
    setAdminNotes(booking.admin_notes || '');
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !actionType) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-099d3103/admin/bookings/${selectedBooking.booking_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            status: actionType === 'approve' ? 'approved' : 'rejected',
            admin_notes: adminNotes
          })
        }
      );

      if (response.ok) {
        alert(`Booking ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setIsDialogOpen(false);
        setSelectedBooking(null);
        setAdminNotes('');
        setActionType(null);
        fetchAllBookings();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update booking');
      }
    } catch (error: any) {
      console.error('Error updating booking:', error);
      alert(`Failed to update booking: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    const locationMatch = filterLocation === 'all' || booking.location_id === filterLocation;
    return statusMatch && locationMatch;
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
              <h1 className="text-2xl">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                Admin
              </Badge>
              <span className="text-gray-700">{user.name}</span>
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
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('pending')}>
            <div className="text-gray-600 mb-2">Pending Review</div>
            <div className="text-3xl text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('approved')}>
            <div className="text-gray-600 mb-2">Approved</div>
            <div className="text-3xl text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('rejected')}>
            <div className="text-gray-600 mb-2">Rejected</div>
            <div className="text-3xl text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <Label className="text-gray-700">Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <Label className="text-gray-700">Location:</Label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              No bookings match your current filters.
            </p>
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
                      <p className="text-sm text-gray-500">User: {booking.user_email}</p>
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

                  <div className="border-t pt-4 mb-4">
                    <div className="text-sm text-gray-500 mb-1">Purpose</div>
                    <p className="text-gray-700">{booking.purpose}</p>
                  </div>

                  {booking.admin_notes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm text-blue-900 mb-1">Admin Notes</div>
                          <p className="text-blue-800">{booking.admin_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex space-x-3 border-t pt-4">
                      <Button 
                        onClick={() => handleOpenDialog(booking, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleOpenDialog(booking, 'reject')}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Booking ID: <span className="font-mono">{selectedBooking?.booking_id}</span>
              </p>
              <p className="text-sm text-gray-600">
                {selectedBooking?.location_name} - {selectedBooking?.date} ({selectedBooking?.start_time} - {selectedBooking?.end_time})
              </p>
            </div>

            <div>
              <Label className="text-sm mb-2 block">
                Admin Notes {actionType === 'reject' ? '(Required for rejection)' : '(Optional)'}
              </Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? "Add any special instructions or notes for the user..."
                    : "Please provide a reason for rejection..."
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={isSubmitting || (actionType === 'reject' && !adminNotes.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
