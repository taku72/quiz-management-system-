# Quiz Management System 🎓

A comprehensive, modern quiz management system built with Next.js 15, TypeScript, and Tailwind CSS. This application provides separate interfaces for administrators to create and manage quizzes, and for students to take quizzes and track their progress. Features both Supabase database integration and local mock data fallback.

## ✨ Features

### 🔐 Authentication System
- Role-based access control (Admin/Student)
- Secure login with session management using React Context
- Automatic fallback between database and local authentication

### 👨‍💼 Admin Panel
- **Dashboard Overview**: Real-time statistics and recent activity monitoring
- **Quiz Creation**: Support for multiple-choice and true/false questions with point allocation
- **Quiz Management**: Preview, edit, delete, and activate/deactivate quizzes
- **Results Analytics**: Monitor student performance with sorted recent attempts
- **Student Tracking**: View individual student progress and quiz attempts

### 🎓 Student Panel
- **Available Quizzes**: Browse and start active quizzes with clear instructions
- **Interactive Quiz Interface**: Progress tracking with timer and question navigation
- **Instant Feedback**: Detailed results with correct answer explanations
- **Quiz History**: Track past attempts and performance trends
- **Performance Dashboard**: Personal statistics and achievements

### 🎨 Modern UI/UX
- Fully responsive design for all devices (mobile, tablet, desktop)
- Beautiful gradient backgrounds and smooth animations
- Interactive cards and progress indicators
- Clean, professional styling with Tailwind CSS v4
- Accessible components with proper ARIA labels
- Modal dialogs for quiz preview and editing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Default Accounts

The system includes default accounts for testing. Please change passwords in production:

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full quiz management and analytics

### Student
- **Username**: `student1`
- **Password**: `student123`
- **Access**: Quiz taking and personal history

*Note: Demo account credentials are no longer displayed on the login form for security*

## 🛠 Tech Stack

### Core Framework & Language
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18+

### Frontend & Styling
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Icons**: Lucide React 0.542.0
- **State Management**: React Context API
- **Form Handling**: Native React state management

### Database & Backend
- **Primary Database**: Supabase (PostgreSQL)
- **Database Client**: @supabase/supabase-js 2.56.1
- **Fallback Storage**: In-memory data structures
- **Database Schema**: PostgreSQL with JSONB for flexible question storage

### Development Tools
- **Build Tool**: Next.js built-in (with Turbopack)
- **Linting**: ESLint 9 with Next.js configuration
- **Type Checking**: TypeScript compiler
- **Package Manager**: npm
- **Code Quality**: ESLint with custom rules

### Additional Libraries
- **Utility Functions**: clsx 2.1.1 for conditional classes
- **Class Merging**: tailwind-merge 3.3.1
- **UI Components**: @headlessui/react 2.2.7 (for accessibility)

## 📁 Project Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── favicon.ico              # App favicon
│   ├── globals.css              # Global Tailwind CSS styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page with auth routing
├── components/                   # React components
│   ├── admin/                   # Admin dashboard components
│   │   ├── AdminDashboard.tsx   # Main admin interface
│   │   ├── CreateQuizForm.tsx   # Quiz creation/editing form
│   │   ├── QuizList.tsx         # Quiz management with CRUD
│   │   └── QuizResults.tsx      # Analytics and results display
│   ├── student/                 # Student interface components
│   │   ├── StudentDashboard.tsx # Student quiz browser
│   │   ├── QuizAttempt.tsx      # Interactive quiz interface
│   │   └── StudentHistory.tsx   # Personal quiz history
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx           # Custom button component
│       ├── Card.tsx             # Card wrapper components
│       ├── Input.tsx            # Form input components
│       └── LoadingSpinner.tsx   # Loading state indicator
├── contexts/                    # React Context providers
│   └── AuthContext.tsx          # Authentication state management
├── lib/                         # Utilities and services
│   ├── supabase.ts              # Supabase client configuration
│   ├── database.ts              # Database service functions
│   ├── data.ts                  # Mock data fallback
│   └── utils.ts                 # Utility functions
└── types/                       # TypeScript definitions
    └── index.ts                 # Type definitions for Quiz, User, etc.
```

## 🎯 Key Components

### Admin Components
- `AdminDashboard`: Main admin interface with tabs
- `CreateQuizForm`: Interactive quiz creation form
- `QuizList`: Quiz management with CRUD operations
- `QuizResults`: Analytics and performance tracking

### Student Components
- `StudentDashboard`: Student home with available quizzes
- `QuizAttempt`: Interactive quiz-taking interface
- `StudentHistory`: Personal quiz history and statistics

### Shared Components
- `LoginForm`: Authentication interface
- `Layout`: Common layout with navigation
- `Button`, `Input`, `Card`: Reusable UI components

## 🔧 Configuration

### Adding New Question Types
To add new question types, update:
1. `src/types/index.ts` - Add new question type
2. `src/components/admin/CreateQuizForm.tsx` - Add creation UI
3. `src/components/student/QuizAttempt.tsx` - Add display logic

### Database Integration
The system is designed with Supabase as the primary database:

#### Current Setup
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Tables**: users, quizzes, quiz_attempts
- **Features**: Real-time subscriptions, automatic RLS policies
- **Fallback**: Automatic fallback to mock data when Supabase is unavailable

#### Database Schema
- **users**: User authentication and role management
- **quizzes**: Quiz storage with JSONB questions array
- **quiz_attempts**: Student quiz attempts with scoring and timing

#### Alternative Databases
The system can be easily adapted for:
- PostgreSQL with Prisma
- MongoDB with Mongoose
- Firebase Firestore
- Any SQL/NoSQL database with minor modifications

## 📊 Sample Data

The system includes sample data:
- 2 sample quizzes (JavaScript Basics, React Fundamentals)
- 2 default users (1 admin, 1 student)
- Sample quiz attempts for testing analytics

## 🔄 Recent Updates

### v0.1.0 Features
- ✅ **Recent Attempts Sorting**: Quiz results now display most recent attempts first
- ✅ **Quiz Preview**: Admin can preview quizzes before publishing
- ✅ **Quiz Editing**: Full edit functionality for existing quizzes
- ✅ **Enhanced UI**: Improved modal dialogs and responsive design
- ✅ **Security**: Removed demo credentials from login form
- ✅ **Database Integration**: Full Supabase integration with fallback support

### Key Improvements
- **Admin Panel**: Enhanced with preview and edit modals
- **Results Display**: Proper chronological sorting of quiz attempts
- **User Experience**: Cleaner login interface without exposed credentials
- **Code Quality**: Improved TypeScript types and error handling

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework (v15.5.2)
- **Tailwind CSS** for the utility-first CSS framework (v4)
- **Supabase** for the PostgreSQL database and real-time features
- **Lucide React** for the beautiful icon library (v0.542.0)
- **React Team** for React 19.1.0 and concurrent features
- **TypeScript Team** for excellent type safety
- **Vercel** for hosting and deployment platform
- **Headless UI** for accessible component primitives

## 📋 Development Notes

### Environment Setup
- Uses `.env.local` for Supabase configuration
- Automatic fallback to mock data when database unavailable
- ESLint configuration optimized for Next.js and TypeScript

### Performance Features
- Next.js App Router for optimal performance
- Turbopack for fast development builds
- Tailwind CSS v4 with PostCSS for efficient styling
- React 19 with concurrent features

### Security Considerations
- Row Level Security (RLS) enabled on Supabase
- No demo credentials exposed in production
- TypeScript for type safety and reduced runtime errors

## � Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

---

**Built with ❤️ using Next.js and TypeScript**
