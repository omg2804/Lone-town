# Lone Town - Mindful Dating App

A beautiful, production-ready dating application focused on meaningful connections through deep compatibility analysis.

## Features

### Core Functionality
- **Daily Exclusive Matching**: One carefully curated match per day based on compatibility
- **Deep Compatibility Analysis**: Algorithm considers emotional intelligence, values, and life goals
- **Real-time Chat**: Socket.io powered messaging with typing indicators
- **Video Call Progression**: Unlock video calls after 100 messages within 48 hours
- **State Management**: Automatic user state transitions (available, matched, pinned, frozen)
- **Mindful Timeouts**: 24-hour freeze periods and feedback systems

### Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Real-time**: WebSocket connections for chat and presence

### Design Features
- **Beautiful UI**: Modern gradient design with smooth animations
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Micro-interactions**: Hover states, loading animations, and transitions

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lone-town-dating-app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your MongoDB URI and JWT secret
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or run separately:
   # Frontend (port 5173)
   npm run dev
   
   # Backend (port 5000)
   npm run server
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/lonetown
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:5173
PORT=5000
```

## Project Structure

```
lone-town-dating-app/
├── src/                          # Frontend React application
│   ├── components/              # Reusable UI components
│   ├── contexts/               # React contexts (Auth, Socket, User)
│   ├── pages/                  # Main application pages
│   └── index.css              # Global styles
├── server/                     # Backend Node.js application
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   ├── socket/                # Socket.io handlers
│   └── middleware/            # Express middleware
└── public/                    # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### User Management
- `POST /api/user/compatibility` - Save compatibility data
- `GET /api/user/compatibility` - Get compatibility data
- `PUT /api/user/profile` - Update user profile

### Matches
- `GET /api/matches/current` - Get current active match
- `POST /api/matches/:id/pin` - Pin a match
- `POST /api/matches/:id/unpin` - Unpin a match

### Messages
- `GET /api/messages/match/:matchId` - Get messages for a match
- `POST /api/messages` - Send a message
- `PUT /api/messages/read/:matchId` - Mark messages as read

## Socket Events

### Client to Server
- `authenticate` - Authenticate user connection
- `joinMatch` - Join a match room
- `sendMessage` - Send a message
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read
- `videoCallRequest` - Request video call
- `videoCallResponse` - Respond to video call

### Server to Client
- `onlineUsers` - List of online users
- `newMessage` - New message received
- `userTyping` - User typing indicator
- `messagesRead` - Messages marked as read
- `incomingVideoCall` - Incoming video call
- `videoCallResponse` - Video call response

## Matchmaking Algorithm

The compatibility algorithm considers:

1. **Core Values** (30% weight) - Shared life values and priorities
2. **Personality Traits** (25% weight) - Big Five personality compatibility
3. **Relationship Goals** (20% weight) - Alignment in relationship intentions
4. **Lifestyle** (15% weight) - Compatible lifestyle choices
5. **Interests** (10% weight) - Shared hobbies and activities

Minimum compatibility threshold: 50%

## User States

- **Available**: Ready for new matches
- **Matched**: Has an active match
- **Pinned**: Both users have pinned the match
- **Frozen**: 24-hour timeout after unpinning

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy with automatic builds

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update MONGODB_URI in environment variables
3. Configure network access and database users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@lonetown.app or create an issue in the repository.