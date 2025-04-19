import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  BookOpen,
  Settings,
  PieChart,
  Clock
} from "lucide-react";
import { Event, WikiArticle } from "@shared/schema";

const Dashboard = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  const { data: wikiArticles = [] } = useQuery<WikiArticle[]>({
    queryKey: ["/api/wiki"],
  });
  
  const { data: settings } = useQuery<{carnivalDate: string}>({
    queryKey: ["/api/settings"],
  });

  const carnivalDate = settings?.carnivalDate 
    ? new Date(settings.carnivalDate) 
    : new Date("2023-09-15");
  
  const totalEvents = events.length;
  const featuredEvents = events.filter((event: Event) => event.isFeatured).length;
  
  const totalArticles = wikiArticles.length;
  const featuredArticles = wikiArticles.filter((article: WikiArticle) => article.isFeatured).length;
  
  const daysRemaining = Math.max(
    0, 
    Math.floor((carnivalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access the dashboard.</p>
              <Link href="/">
                <button className="text-primary hover:underline">Return to Home</button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back, {user.username}!</p>
        </div>
        <div className="mt-4 md:mt-0 overflow-x-auto">
          <Tabs defaultValue="overview" onValueChange={(value) => navigateTo(`/dashboard${value === 'overview' ? '' : `/${value}`}`)}>
            <TabsList className="flex w-full sm:w-auto">
              <TabsTrigger className="flex-1 sm:flex-initial text-xs sm:text-sm" value="overview">Overview</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-initial text-xs sm:text-sm" value="events">Events</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-initial text-xs sm:text-sm" value="wiki">Wiki</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-initial text-xs sm:text-sm" value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Total Events</p>
                <p className="text-xl sm:text-3xl font-bold">{totalEvents}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-4">
              {featuredEvents} featured events
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Wiki Articles</p>
                <p className="text-xl sm:text-3xl font-bold">{totalArticles}</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-4">
              {featuredArticles} featured articles
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Days Remaining</p>
                <p className="text-xl sm:text-3xl font-bold">{daysRemaining}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-4">
              Until carnival starts
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Configuration</p>
                <p className="text-xl sm:text-3xl font-bold">Settings</p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                <Settings className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-4">
              Date & social links
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Link href="/dashboard/events">
          <Card className="cursor-pointer hover:shadow-md transition-all h-full">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                Manage Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <p className="text-gray-600 text-xs sm:text-sm">
                Create, edit or delete events for the science carnival
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/wiki">
          <Card className="cursor-pointer hover:shadow-md transition-all h-full">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                Manage Wiki
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <p className="text-gray-600 text-xs sm:text-sm">
                Add scientific articles and knowledge to the wiki
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/settings" className="sm:col-span-2 lg:col-span-1">
          <Card className="cursor-pointer hover:shadow-md transition-all h-full">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-600" />
                Configure Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <p className="text-gray-600 text-xs sm:text-sm">
                Update countdown timer, social links and contact info
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Dashboard Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-gray-600 text-xs sm:text-sm">
              Welcome to the Science Carnival admin dashboard. From here, you can manage all aspects of your science carnival website.
            </p>
            
            <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
              <h3 className="font-medium mb-2 text-sm sm:text-base">Quick Tips:</h3>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                <li>• Create featured events to highlight them on the homepage</li>
                <li>• Update the carnival countdown date in Settings</li>
                <li>• Add diverse wiki articles to build your science knowledge base</li>
                <li>• Customize contact information and social media links</li>
              </ul>
            </div>
            
            <div className="pt-2 sm:pt-4">
              <Link href="/">
                <button className="text-primary hover:underline text-xs sm:text-sm flex items-center">
                  View the public website
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
