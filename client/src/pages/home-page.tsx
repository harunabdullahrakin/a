import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, FlaskRound, Atom, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CountdownTimer from "@/components/ui/countdown";
import Particles from "@/components/ui/particles";

const HomePage = () => {
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events/featured"],
  });

  const { data: wikiArticles = [] } = useQuery({
    queryKey: ["/api/wiki/featured"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Fallback carnival date if settings not yet loaded
  const carnivalDate = settings?.carnivalDate || "2023-09-15T00:00:00.000Z";

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "chemistry":
        return <FlaskRound className="h-6 w-6 text-primary" />;
      case "physics":
        return <Atom className="h-6 w-6 text-accent" />;
      case "biology":
        return <Globe className="h-6 w-6 text-secondary" />;
      default:
        return <FlaskRound className="h-6 w-6 text-primary" />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden">
        <Particles count={20} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-inter leading-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                School Science <span className="text-yellow-300">Carnival</span> 2023
              </motion.h1>
              <motion.p 
                className="mt-4 max-w-xl mx-auto md:mx-0 text-xl text-blue-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Explore, discover and innovate with amazing scientific experiments and exhibitions!
              </motion.p>
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/events">
                  <Button size="lg" className="px-8 py-6 bg-white text-primary hover:bg-gray-100">
                    Register Now
                  </Button>
                </Link>
                <Link href="/wiki">
                  <Button size="lg" variant="outline" className="px-8 py-6 border-white text-primary hover:bg-white hover:text-primary">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg animate-float">
                <CountdownTimer targetDate={carnivalDate} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-inter">Featured Events</h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Check out these exciting scientific experiences waiting for you at the carnival!
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {events.length > 0 ? (
            events.map((event) => (
              <motion.div 
                key={event.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover-effect"
                variants={item}
              >
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover" 
                  />
                  {event.isFeatured && (
                    <div className="absolute top-4 right-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {event.category}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{event.time}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-gray-100 font-inter">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={event.presenterImage || "https://via.placeholder.com/32"} 
                        alt={`${event.presenter} avatar`} 
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{event.presenter}</span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <a className="text-primary hover:text-primary-dark text-sm font-medium">
                        Learn more →
                      </a>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Show placeholder cards if no events
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover-effect"
                variants={item}
              >
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        
        <div className="text-center mt-12">
          <Link href="/events">
            <Button variant="outline" className="inline-flex items-center dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Wiki Preview Section */}
      <div className="bg-gray-100 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-inter">Science Wiki</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Browse our collection of scientific knowledge and fun facts
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {wikiArticles.length > 0 ? (
              wikiArticles.map((article) => (
                <motion.div 
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover-effect p-6"
                  variants={item}
                >
                  <div className="flex items-center mb-4">
                    <div className={`bg-${article.category === 'Chemistry' ? 'blue' : article.category === 'Physics' ? 'purple' : 'green'}-100 dark:bg-${article.category === 'Chemistry' ? 'blue' : article.category === 'Physics' ? 'purple' : 'green'}-900 rounded-lg p-3`}>
                      {getIconForCategory(article.category)}
                    </div>
                    <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-gray-100 font-inter">{article.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {article.content.substring(0, 100)}...
                  </p>
                  <Link href={`/wiki/${article.id}`}>
                    <a className="mt-4 inline-block text-primary font-medium">
                      Read More →
                    </a>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Show placeholder cards if no wiki articles
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover-effect p-6"
                  variants={item}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 animate-pulse w-12 h-12"></div>
                    <div className="ml-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                </motion.div>
              ))
            )}
          </motion.div>
          
          <div className="text-center mt-12">
            <Link href="/wiki">
              <Button variant="outline" className="inline-flex items-center dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                Browse All Wiki Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-accent py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-white font-inter"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Join the Science Carnival?
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl text-purple-100 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Register now to participate in exciting events, workshops, and exhibitions!
          </motion.p>
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/events">
              <Button className="bg-white text-accent hover:bg-gray-100">
                Register as Participant
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                Volunteer Opportunities
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
