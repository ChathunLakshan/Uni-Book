import { useState, useEffect } from 'react';
import { ArrowLeft, Users, MapPin, Calendar as CalendarIcon, Clock, AlertCircle, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Location } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type LocationDetailProps = {
  location: Location;
  onBack: () => void;
  user: User | null;
  accessToken: string | null;
  onNavigate: (page: 'login' | 'signup') => void;
  onLogout: () => void;
};

type Booking = {
  id: string;
  location_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
};

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export function LocationDetail({ location, onBack, user, accessToken, onNavigate, onLogout }: LocationDetailProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [organizerName, setOrganizerName] = useState(user?.name || '');
  const [organizerContact, setOrganizerContact] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchBookings();
    }
  }, [selectedDate, location.id]);

  const fetchBookings = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-099d3103/bookings?location_id=${location.id}&date=${dateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTimeSlotBooked = (time: string): boolean => {
    if (!selectedDate) return false;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    return bookings.some(booking => {
      if (booking.date !== dateStr || booking.status === 'rejected') return false;
      
      const slotTime = parseInt(time.replace(':', ''));
      const bookingStart = parseInt(booking.start_time.replace(':', ''));
      const bookingEnd = parseInt(booking.end_time.replace(':', ''));
      
      return slotTime >= bookingStart && slotTime < bookingEnd;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to make a booking');
      onNavigate('login');
      return;
    }

    if (!selectedDate || !startTime || !endTime) {
      alert('Please select date and time');
      return;
    }

    const startTimeNum = parseInt(startTime.replace(':', ''));
    const endTimeNum = parseInt(endTime.replace(':', ''));

    if (endTimeNum <= startTimeNum) {
      alert('End time must be after start time');
      return;
    }

    const attendees = parseInt(expectedAttendees);
    if (isNaN(attendees) || attendees <= 0) {
      alert('Please enter a valid number of expected attendees');
      return;
    }

    if (attendees > location.capacity) {
      alert(`Expected attendees cannot exceed capacity of ${location.capacity}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-099d3103/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          location_id: location.id,
          location_name: location.name,
          date: selectedDate.toISOString().split('T')[0],
          start_time: startTime,
          end_time: endTime,
          purpose,
          organizer_name: organizerName,
          organizer_contact: organizerContact,
          expected_attendees: attendees,
          user_email: user.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      alert(`Booking submitted successfully!\n\nBooking ID: ${data.booking_id}\n\nYou will receive a confirmation email once your booking is reviewed by an administrator.`);
      
      // Reset form
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setOrganizerContact('');
      setExpectedAttendees('');
      
      // Refresh bookings
      fetchBookings();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(`Failed to create booking: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableEndTimes = TIME_SLOTS.filter(time => {
    if (!startTime) return false;
    return parseInt(time.replace(':', '')) > parseInt(startTime.replace(':', ''));
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Locations
            </Button>
            {user && (
              <Button variant="ghost" onClick={onLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Location Hero */}
      <div className="relative h-96">
        <ImageWithFallback
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl mb-4">{location.name}</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-2" />
                <span className="text-lg">Capacity: {location.capacity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Details */}
          <div className="space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl mb-4">About This Facility</h2>
              <p className="text-gray-700 leading-relaxed">{location.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {location.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div>
              <h2 className="text-2xl mb-4">Booking Rules & Guidelines</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-amber-900">
                    Please read and follow all rules carefully. Violations may result in booking cancellation.
                  </p>
                </div>
                <ul className="space-y-2">
                  {location.rules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl mb-6">Book This Facility</h2>

              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 mb-3">Please login to make a booking</p>
                  <div className="flex space-x-2">
                    <Button onClick={() => onNavigate('login')} className="flex-1">
                      Login
                    </Button>
                    <Button onClick={() => onNavigate('signup')} variant="outline" className="flex-1">
                      Sign Up
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label>Select Date</Label>
                  <div className="mt-2 border rounded-lg p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="space-y-4">
                    <div>
                      <Label>Available Time Slots for {selectedDate.toLocaleDateString()}</Label>
                      {isLoading ? (
                        <p className="text-sm text-gray-500 mt-2">Loading availability...</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {TIME_SLOTS.map((time) => {
                            const booked = isTimeSlotBooked(time);
                            return (
                              <div
                                key={time}
                                className={`text-center py-2 rounded text-sm ${
                                  booked
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                              >
                                {time}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                          <span>Booked</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Select value={startTime} onValueChange={setStartTime} disabled={!user}>
                          <SelectTrigger id="startTime">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time} disabled={isTimeSlotBooked(time)}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Select value={endTime} onValueChange={setEndTime} disabled={!user || !startTime}>
                          <SelectTrigger id="endTime">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableEndTimes.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Details */}
                <div>
                  <Label htmlFor="purpose">Purpose of Booking</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Describe the event or activity..."
                    required
                    disabled={!user}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="organizerName">Organizer Name</Label>
                  <Input
                    id="organizerName"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="Full name"
                    required
                    disabled={!user}
                  />
                </div>

                <div>
                  <Label htmlFor="organizerContact">Contact Number</Label>
                  <Input
                    id="organizerContact"
                    type="tel"
                    value={organizerContact}
                    onChange={(e) => setOrganizerContact(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                    disabled={!user}
                  />
                </div>

                <div>
                  <Label htmlFor="expectedAttendees">Expected Attendees</Label>
                  <Input
                    id="expectedAttendees"
                    type="number"
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(e.target.value)}
                    placeholder={`Max: ${location.capacity}`}
                    min="1"
                    max={location.capacity}
                    required
                    disabled={!user}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!user || isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </Button>

                {user && (
                  <p className="text-sm text-gray-600 text-center">
                    Your booking will be reviewed by an administrator. You'll receive a confirmation email with your booking ID.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
