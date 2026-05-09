import { useEffect, useState } from 'react'
import { AssessmentPage } from './pages/AssessmentPage'
import { LandingPage } from './pages/LandingPage'

type AppRoute = 'landing' | 'assessment'

function getRouteFromPath(): AppRoute {
  return window.location.pathname === '/assessment' ? 'assessment' : 'landing'
}

function App() {
  const [route, setRoute] = useState<AppRoute>(getRouteFromPath)

  function navigate(nextRoute: AppRoute) {
    const nextPath = nextRoute === 'assessment' ? '/assessment' : '/'
    window.history.pushState(null, '', nextPath)
    setRoute(nextRoute)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromPath())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (route === 'assessment') {
    return <AssessmentPage onBack={() => navigate('landing')} />
  }

  return <LandingPage onStart={() => navigate('assessment')} />
}

export default App
