# Quiz Management System 🎓

A comprehensive, modern quiz management system built with Next.js, TypeScript, and Tailwind CSS. This application provides separate interfaces for administrators to create and manage quizzes, and for students to take quizzes and track their progress.

## ✨ Features

### 🔐 Authentication System
- Role-based access control (Admin/Student)
- Secure login with session management
- Demo accounts for testing

### 👨‍💼 Admin Panel
- **Dashboard Overview**: Real-time statistics and recent activity
- **Quiz Creation**: Support for multiple-choice and true/false questions
- **Quiz Management**: Edit, delete, activate/deactivate quizzes
- **Results Analytics**: Monitor student performance and pass rates
- **Student Tracking**: View individual student progress

### 🎓 Student Panel
- **Available Quizzes**: Browse and start active quizzes
- **Interactive Quiz Interface**: Progress tracking with timer
- **Instant Feedback**: Detailed results with correct answer explanations
- **Quiz History**: Track past attempts and performance trends
- **Performance Dashboard**: Personal statistics and achievements

### 🎨 Modern UI/UX
- Responsive design for all devices
- Beautiful gradient backgrounds and animations
- Interactive cards and progress indicators
- Clean, professional styling with Tailwind CSS
- Accessible components with proper ARIA labels

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

## 🔑 Demo Accounts

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full quiz management and analytics

### Student
- **Username**: `student1`
- **Password**: `student123`
- **Access**: Quiz taking and personal history

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Storage**: In-memory (easily replaceable with database)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── student/          # Student-specific components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utilities and data
└── types/                # TypeScript type definitions
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
Replace the mock data in `src/lib/data.ts` with your preferred database:
- PostgreSQL with Prisma
- MongoDB with Mongoose
- Supabase
- Firebase

## 📊 Sample Data

The system includes sample data:
- 1 JavaScript fundamentals quiz
- 3 demo users (1 admin, 2 students)
- Sample quiz attempts for testing

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

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- Vercel for hosting and deployment platform

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

---

**Built with ❤️ using Next.js and TypeScript**
