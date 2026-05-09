import { useEffect, useState } from 'react'
import { AssessmentPage } from './pages/AssessmentPage'
import { LandingPage } from './pages/LandingPage'
import { RoadmapGraphPage } from './pages/RoadmapGraphPage'
import { SubscriptionPage } from './pages/SubscriptionPage'

type AppRoute = 'landing' | 'assessment' | 'plans' | 'roadmap'

function getRouteFromPath(): AppRoute {
  if (window.location.pathname === '/assessment') {
    return 'assessment'
  }

  if (window.location.pathname === '/roadmap') {
    return 'roadmap'
  }

  if (window.location.pathname === '/plans') {
    return 'plans'
  }

  return 'landing'
}

function App() {
  const [route, setRoute] = useState<AppRoute>(getRouteFromPath)

  function navigate(nextRoute: AppRoute) {
    const nextPath = nextRoute === 'assessment'
      ? '/assessment'
      : nextRoute === 'roadmap'
        ? '/roadmap'
      : nextRoute === 'plans'
        ? '/plans'
        : '/'
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
    return <AssessmentPage onBack={() => navigate('landing')} onOpenRoadmap={() => navigate('roadmap')} />
  }

  if (route === 'plans') {
    return <SubscriptionPage onBack={() => navigate('landing')} onStart={() => navigate('assessment')} />
  }

  if (route === 'roadmap') {
    return <RoadmapGraphPage onBack={() => navigate('assessment')} />
  }

  return <LandingPage onStart={() => navigate('assessment')} onPlans={() => navigate('plans')} />
}

export default App
