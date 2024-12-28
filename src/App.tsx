import React from "react";
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Auth } from './components/Auth'
import AdvancedTaskFlow from './advanced-task-flow'
import './App.css'

function AppContent() {
  const { user } = useAuth()

  if (!user) {
    return <Auth />
  }

  return <AdvancedTaskFlow userId={user.id} />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App;
