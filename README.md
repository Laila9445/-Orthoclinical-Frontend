# Welcome to your Nurse Dashboard App 👋

This is a comprehensive React Native application built with [Expo](https://expo.dev) for nurse management in a medical clinic. The app includes complete authentication, dashboard management, appointment tracking, and profile management features.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Features

### Authentication
- **Login System**: Secure authentication with any email + password "nurse123"
- **Persistent Storage**: Login state saved using AsyncStorage
- **Biometric Authentication**: Optional biometric login support
- **Protected Routes**: All dashboard screens require authentication

### Nurse Dashboard
- **Header Section**: Dynamic greeting (Good Morning/Afternoon/Evening) with current date
- **Patient Queue**: Real-time display of patients waiting with doctor assignment
- **Tasks Management**: 
  - Interactive checklist for daily tasks
  - Add new tasks functionality
  - Mark tasks as complete/incomplete
- **Responsive Design**: Works seamlessly on different screen sizes

### Appointments
- **View Appointments**: Filter by status (upcoming, completed, canceled)
- **Clinic Filtering**: Filter by different clinic locations
- **Appointment Actions**: Complete, reschedule, or cancel appointments
- **Booking System**: Full appointment booking workflow

### Nurse Profile
- **Personal Information**: View and edit name, email, phone
- **Profile Picture**: Change profile picture (UI ready)
- **Password Management**: Change password functionality
- **Additional Info**: Employee ID, department, experience

### Navigation
- **Sidebar Menu**: Easy navigation between all screens
- **Protected Routes**: Automatic redirect if not authenticated
- **Logout**: Secure logout with state cleanup

## Login Credentials

To access the nurse dashboard:
- **Email**: Any email (e.g., nurse@clinic.com)
- **Password**: nurse123

## Project Structure

```
- app/
  ├── DashboardScreen.js        # Main dashboard route
  ├── NurseProfileScreen.js     # Profile route
  ├── Appointments.js           # Appointments route
  └── _layout.tsx              # Root layout with AuthProvider
- screens/
  ├── DashboardScreen.js        # Dashboard UI component
  ├── NurseProfileScreen.js     # Profile UI component
  ├── Appointments.js          # Appointments UI component
  └── LoginScreen.js           # Login UI component
- context/
  └── AuthContext.js           # Authentication context and logic
```

## Dependencies

- React Native & Expo
- Expo Router for navigation
- AsyncStorage for persistent storage
- Expo Local Authentication for biometric login
- React Navigation for routing
- Various Expo vector icons

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
