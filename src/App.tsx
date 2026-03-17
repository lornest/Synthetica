import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import MainLayout from './components/MainLayout'
import NotificationToast from './components/NotificationToast'
import DailyInsights from './components/DailyInsights'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <Header />
        <MainLayout />
      </div>
      <NotificationToast />
      <DailyInsights />
    </ErrorBoundary>
  )
}
