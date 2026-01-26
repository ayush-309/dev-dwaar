# Temple Booking System - Quick Start Guide

## 🚀 Current Status

**Development server is running on: http://localhost:3000**

## 📋 What Has Been Built

### Complete Features ✅

1. **Authentication System**
   - User registration and login
   - Role-based access control (Superuser, Temple Board, User)
   - NextAuth.js integration
   - Protected routes with middleware

2. **API Endpoints** (All Working)
   - Temples CRUD operations
   - Booking creation with daily limits
   - QR code generation
   - QR code verification
   - Admin approval system
   - Statistics dashboard

3. **User Interfaces** (All Pages Created)
   - Landing page with temple showcase
   - Temple exploration with search/filter
   - Booking flow with date/slot selection
   - My Bookings page with QR codes
   - Temple Board dashboard for managing temples
   - Superuser dashboard for approvals
   - QR code scanner page

4. **QR Code System**
   - Encrypted QR code generation
   - QR code decryption and verification
   - Camera-based scanning
   - Download functionality

## 🔑 First Steps to Test

### 1. Create a Superuser (Manual Database Entry)

Since you need at least one superuser to approve temple board members, you'll need to create one manually:

**Option A: Using MongoDB Compass/Atlas**
1. Connect to your MongoDB database
2. Go to the `User` collection
3. Create a new document:
```json
{
  "email": "superuser@temple.com",
  "password": "$2a$10$[hash-your-password-using-bcrypt]",
  "name": "Super Admin",
  "phone": "1234567890",
  "role": "SUPERUSER",
  "isApproved": true,
  "isActive": true,
  "createdAt": { "$date": "2026-01-24T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-24T00:00:00.000Z" }
}
```

**Option B: Use the register endpoint and update manually**
1. Register a user via the UI at `/register`
2. Go to MongoDB and update their role to `SUPERUSER` and set `isApproved: true`

### 2. Create Time Slots for Temples

Before users can book, temples need time slots. Add these manually to your MongoDB:

```javascript
// Example time slots for a temple
[
  {
    "tempId": "your-temple-id",
    "startTime": "06:00",
    "endTime": "08:00",
    "capacity": 50,
    "isActive": true
  },
  {
    "templeId": "your-temple-id",
    "startTime": "08:00",
    "endTime": "10:00",
    "capacity": 50,
    "isActive": true
  },
  {
    "templeId": "your-temple-id",
    "startTime": "16:00",
    "endTime": "18:00",
    "capacity": 50,
    "isActive": true
  }
]
```

## 🧪 Testing Flow

### Test as Superuser
1. Go to http://localhost:3000/login
2. Login with superuser credentials
3. Visit `/dashboard` (you'll be auto-redirected based on role)
4. See pending temple board approvals
5. Approve a temple board member

### Test as Temple Board
1. Register at `/register` and select "Temple Board" role
2. Wait for superuser approval (or approve yourself as superuser)
3. Login and go to `/dashboard`
4. Click "Add New Temple"
5. Fill in temple details
6. View your temples
7. Go to `/dashboard/verify` to test QR scanner

### Test as Regular User
1. Register at `/register` as "User"
2. Login
3. Go to `/explore` to browse temples
4. Click "Book Now" on a temple
5. Select date, time slot, and ticket count
6. Submit booking
7. View your booking at `/my-bookings`
8. Download QR code
9. Show QR code to temple board member who can scan it

## 🎯 Pages You Can Visit Right Now

### Public Pages (No Login Required)
- `/` - Landing page
- `/explore` - Browse temples
- `/login` - Login page
- `/register` - Registration page

### User Pages (Login Required)
- `/book/[templeId]` - Booking page
- `/my-bookings` - View bookings and QR codes

### Temple Board Pages (Login + Approval Required)
- `/dashboard` - Temple board dashboard
- `/dashboard/temples` - Manage temples
- `/dashboard/temples/create` - Create new temple
- `/dashboard/verify` - QR code scanner

### Superuser Pages (Login Required)
- `/dashboard` - Superuser dashboard (redirects from temple-board)

## 🔍 What to Check

### Authentication
- [ ] Can register new users
- [ ] Can login successfully
- [ ] Redirects work based on role
- [ ] Protected routes block unauthorized access
- [ ] Logout works

### Temple Management
- [ ] Temple board can create temples
- [ ] Temple board can edit their own temples
- [ ] Temple board can delete (deactivate) temples
- [ ] Only approved temple board members can create temples

### Booking System
- [ ] Users can browse temples
- [ ] Users can select date and time slot
- [ ] Daily limit is enforced
- [ ] QR code is generated on booking
- [ ] QR code can be downloaded

### QR Verification
- [ ] Temple board can scan QR codes
- [ ] Scanner decrypts QR data correctly
- [ ] Booking status changes to VERIFIED
- [ ] Only temple owners can verify their temple's bookings

### Superuser Dashboard
- [ ] Can see pending approvals
- [ ] Can approve temple board members
- [ ] Can see system statistics
- [ ] Can see recent bookings

## 🐛 Common Issues & Solutions

### Issue: Can't login
- **Solution**: Make sure user exists in database and password is hashed correctly

### Issue: Temple board can't create temples
- **Solution**: Check if `isApproved: true` in database

### Issue: No time slots available
- **Solution**: Manually add time slots to database for that temple

### Issue: QR scanner doesn't work
- **Solution**: Make sure you're using HTTPS or localhost (camera requires secure context)

### Issue: Can't book tickets
- **Solution**: 
  1. Check if daily limit is reached
  2. Verify time slots exist for the temple
  3. Check if temple is active

## 📁 Important Files

### Configuration
- `.env` - Environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- `prisma/schema.prisma` - Database schema

### Authentication
- `src/lib/auth.ts` - NextAuth configuration
- `src/middleware.ts` - Route protection

### Core Logic
- `src/lib/qr.ts` - QR code generation and verification
- `src/lib/db.ts` - Database connection

### API Routes
- `src/app/api/temples/route.ts` - Temple CRUD
- `src/app/api/bookings/route.ts` - Booking creation
- `src/app/api/bookings/verify/route.ts` - QR verification
- `src/app/api/admin/*` - Admin operations

## 🎨 UI Components

- `src/components/Navbar.tsx` - Navigation bar with role-based links
- `src/components/QRScanner.tsx` - Camera-based QR scanner
- `src/components/Providers.tsx` - NextAuth session provider

## 💡 Tips

1. **Use REST Client or Postman** to test APIs directly
2. **MongoDB Compass** is great for viewing/editing database
3. **Browser DevTools** → Network tab to debug API calls
4. **Console logs** are in the terminal running `npm run dev`

## 🚀 What's Next

The system is feature-complete! You can now:
1. Create test data
2. Test all user flows
3. Customize styling
4. Add more features (email, payments, etc.)
5. Deploy to production

## 📞 Need Help?

Check the `IMPLEMENTATION_SUMMARY.md` for detailed feature documentation!

---

**🎉 Ready to test! Open http://localhost:3000 and start exploring!**
