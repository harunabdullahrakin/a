import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import HomePage from "@/pages/home-page";
import EventsPage from "@/pages/events-page";
import WikiPage from "@/pages/wiki-page";
import ContactPage from "@/pages/contact-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SetupPage from "@/pages/setup-page";
import Dashboard from "@/pages/dashboard/index";
import DashboardEvents from "@/pages/dashboard/events";
import DashboardWiki from "@/pages/dashboard/wiki";
import DashboardSettings from "@/pages/dashboard/settings";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadContent from "@/components/HeadContent";

// Simple redirect component for /admin route
const AdminRedirect = () => {
  return <Redirect to="/auth" />;
};

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Switch>
        {/* Setup Page - No navigation/footer */}
        <Route path="/setup" component={SetupPage} />
        
        {/* Admin Route - redirects to auth page */}
        <Route path="/admin" component={AdminRedirect} />
        
        {/* Main routes with navigation and footer */}
        <Route>
          <Navbar />
          <main className="flex-grow">
            <Switch>
              <Route path="/">
                <HomePage />
              </Route>
              <Route path="/events">
                <EventsPage />
              </Route>
              <Route path="/wiki">
                <WikiPage />
              </Route>
              <Route path="/contact">
                <ContactPage />
              </Route>
              <Route path="/auth">
                <AuthPage />
              </Route>
              <ProtectedRoute path="/dashboard">
                <Dashboard />
              </ProtectedRoute>
              <ProtectedRoute path="/dashboard/events">
                <DashboardEvents />
              </ProtectedRoute>
              <ProtectedRoute path="/dashboard/wiki">
                <DashboardWiki />
              </ProtectedRoute>
              <ProtectedRoute path="/dashboard/settings">
                <DashboardSettings />
              </ProtectedRoute>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </main>
          <Footer />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="carnival-theme">
        <AuthProvider>
          <HeadContent />
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
