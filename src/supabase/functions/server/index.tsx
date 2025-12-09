import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Generate a unique booking ID
function generateBookingId(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BK-${dateStr}-${random}`;
}

// Send email notification (simulated)
function sendEmailNotification(to: string, subject: string, body: string) {
  console.log('=== EMAIL NOTIFICATION ===');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log('========================');
}

// User signup
app.post('/make-server-099d3103/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: 'user' // Default role
      },
      email_confirm: true // Auto-confirm email since email server isn't configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Send welcome email
    sendEmailNotification(
      email,
      'Welcome to UniBook - Account Created',
      `Hi ${name},\n\nYour UniBook account has been successfully created!\n\nYou can now login and start booking university facilities.\n\nBest regards,\nUniBook Team`
    );

    return c.json({ 
      success: true, 
      message: 'User created successfully',
      user_id: data.user?.id 
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Get bookings for a specific location and date
app.get('/make-server-099d3103/bookings', async (c) => {
  try {
    const location_id = c.req.query('location_id');
    const date = c.req.query('date');

    if (!location_id || !date) {
      return c.json({ error: 'location_id and date are required' }, 400);
    }

    // Get all bookings from KV store
    const allBookings = await kv.getByPrefix(`booking:`);
    
    // Filter by location and date
    const filteredBookings = allBookings
      .filter(booking => 
        booking.location_id === location_id && 
        booking.date === date &&
        booking.status !== 'rejected' // Don't show rejected bookings as blocked time
      )
      .map(booking => ({
        id: booking.booking_id,
        location_id: booking.location_id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status
      }));

    return c.json({ bookings: filteredBookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Create a new booking (requires authentication)
app.post('/make-server-099d3103/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized - Invalid access token' }, 401);
    }

    const bookingData = await c.req.json();
    const {
      location_id,
      location_name,
      date,
      start_time,
      end_time,
      purpose,
      organizer_name,
      organizer_contact,
      expected_attendees,
      user_email
    } = bookingData;

    // Validate required fields
    if (!location_id || !date || !start_time || !end_time || !purpose || !organizer_name || !organizer_contact || !expected_attendees) {
      return c.json({ error: 'All booking fields are required' }, 400);
    }

    // Generate booking ID
    const booking_id = generateBookingId();

    // Create booking object
    const booking = {
      booking_id,
      user_id: user.id,
      user_email,
      location_id,
      location_name,
      date,
      start_time,
      end_time,
      purpose,
      organizer_name,
      organizer_contact,
      expected_attendees: parseInt(expected_attendees),
      status: 'pending',
      created_at: new Date().toISOString(),
      admin_notes: ''
    };

    // Store in KV
    await kv.set(`booking:${booking_id}`, booking);

    // Send confirmation email to user
    sendEmailNotification(
      user_email,
      `Booking Request Submitted - ${booking_id}`,
      `Hi ${organizer_name},\n\nYour booking request has been submitted successfully!\n\n` +
      `Booking Details:\n` +
      `- Booking ID: ${booking_id}\n` +
      `- Location: ${location_name}\n` +
      `- Date: ${date}\n` +
      `- Time: ${start_time} - ${end_time}\n` +
      `- Purpose: ${purpose}\n` +
      `- Expected Attendees: ${expected_attendees}\n\n` +
      `Status: PENDING REVIEW\n\n` +
      `Your booking is currently being reviewed by our administrators. ` +
      `You will receive another email once your booking has been approved or if any changes are needed.\n\n` +
      `Best regards,\nUniBook Team`
    );

    return c.json({ 
      success: true, 
      booking_id,
      message: 'Booking created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Get user's bookings (requires authentication)
app.get('/make-server-099d3103/user-bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized - Invalid access token' }, 401);
    }

    // Get all bookings from KV store
    const allBookings = await kv.getByPrefix(`booking:`);
    
    // Filter by user ID and sort by created date (newest first)
    const userBookings = allBookings
      .filter(booking => booking.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ bookings: userBookings });
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Admin: Get all bookings (requires admin authentication)
app.get('/make-server-099d3103/admin/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized - Invalid access token' }, 401);
    }

    // Check if user is admin
    if (user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Get all bookings from KV store
    const allBookings = await kv.getByPrefix(`booking:`);
    
    // Sort by created date (newest first)
    const sortedBookings = allBookings.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ bookings: sortedBookings });
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Admin: Update booking status (requires admin authentication)
app.patch('/make-server-099d3103/admin/bookings/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized - Invalid access token' }, 401);
    }

    // Check if user is admin
    if (user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const booking_id = c.req.param('id');
    const { status, admin_notes } = await c.req.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be "approved" or "rejected"' }, 400);
    }

    // Get existing booking
    const existingBooking = await kv.get(`booking:${booking_id}`);
    if (!existingBooking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Update booking
    const updatedBooking = {
      ...existingBooking,
      status,
      admin_notes: admin_notes || '',
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`booking:${booking_id}`, updatedBooking);

    // Send status update email to user
    const statusText = status === 'approved' ? 'APPROVED' : 'REJECTED';
    const statusColor = status === 'approved' ? '✓' : '✗';
    
    sendEmailNotification(
      existingBooking.user_email,
      `Booking ${statusText} - ${booking_id}`,
      `Hi ${existingBooking.organizer_name},\n\n` +
      `Your booking request has been ${statusText.toLowerCase()}!\n\n` +
      `${statusColor} Booking Details:\n` +
      `- Booking ID: ${booking_id}\n` +
      `- Location: ${existingBooking.location_name}\n` +
      `- Date: ${existingBooking.date}\n` +
      `- Time: ${existingBooking.start_time} - ${existingBooking.end_time}\n` +
      `- Status: ${statusText}\n\n` +
      (admin_notes ? `Admin Notes:\n${admin_notes}\n\n` : '') +
      (status === 'approved' 
        ? `Please arrive at least 15 minutes before your scheduled time. If you need to cancel or make changes, please contact us immediately.\n\n`
        : `If you have any questions about this decision, please contact our administrative office.\n\n`) +
      `Best regards,\nUniBook Team`
    );

    return c.json({ 
      success: true, 
      message: `Booking ${status} successfully`,
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-099d3103/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize demo accounts (for testing purposes)
app.post('/make-server-099d3103/init-demo', async (c) => {
  try {
    const results = [];

    // Create admin account
    try {
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@university.edu',
        password: 'admin123',
        user_metadata: { 
          name: 'Admin User',
          role: 'admin'
        },
        email_confirm: true
      });
      
      if (!adminError) {
        results.push({ type: 'admin', email: 'admin@university.edu', success: true });
      } else if (adminError.message.includes('already registered')) {
        results.push({ type: 'admin', email: 'admin@university.edu', success: true, note: 'already exists' });
      } else {
        results.push({ type: 'admin', email: 'admin@university.edu', success: false, error: adminError.message });
      }
    } catch (error: any) {
      results.push({ type: 'admin', email: 'admin@university.edu', success: false, error: error.message });
    }

    // Create regular user account
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'user@university.edu',
        password: 'user123',
        user_metadata: { 
          name: 'John Student',
          role: 'user'
        },
        email_confirm: true
      });
      
      if (!userError) {
        results.push({ type: 'user', email: 'user@university.edu', success: true });
      } else if (userError.message.includes('already registered')) {
        results.push({ type: 'user', email: 'user@university.edu', success: true, note: 'already exists' });
      } else {
        results.push({ type: 'user', email: 'user@university.edu', success: false, error: userError.message });
      }
    } catch (error: any) {
      results.push({ type: 'user', email: 'user@university.edu', success: false, error: error.message });
    }

    return c.json({ 
      success: true, 
      message: 'Demo accounts initialized',
      results 
    });
  } catch (error: any) {
    console.error('Error initializing demo accounts:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);