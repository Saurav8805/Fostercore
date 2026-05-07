# Fosterclient - Frontend

Frontend for Foster Kids Management System built with Next.js 14, React, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3001`

## ⚠️ Important

**Backend Required:** This frontend needs the Fostercore backend running on `http://localhost:5000`

```bash
# In Fostercore directory
cd ../Fostercore
npm run dev
```

## 📝 Environment Variables

Update `.env` with your backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔌 API Client

Use the API client in `src/lib/api.ts` for all backend calls:

```typescript
import { authApi, studentsApi, staffApi } from '@/lib/api';

// Example: Login
const response = await authApi.login(mobile, password);

// Example: Get students
const data = await studentsApi.list();
```

## 📁 Structure

```
src/
├── app/              # Pages (dashboard, login)
├── components/       # UI components
└── lib/
    ├── api.ts       # API client (use this!)
    └── supabase.ts  # Supabase client
```

## 🎯 Features

- Student management
- Staff management
- Attendance tracking
- Fee management
- Academic progress
- Behavior tracking
- Homework management

## 🔐 User Roles

- **Admin (6)**: Full access
- **Teacher (7)**: Assigned students
- **Faculty (8)**: Extended access
- **Student (19)**: Personal data only

## 🚀 Production

```bash
npm run build
npm start
```

## 📄 License

Proprietary software for Foster Kids Play School Chain.
