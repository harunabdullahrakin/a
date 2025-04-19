import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { WikiArticle } from "@shared/schema";
import { 
  Atom, 
  FlaskRound, 
  Globe, 
  Zap, 
  BookOpen, 
  Microscope, 
  Rocket, 
  Cpu, 
  Database 
} from "lucide-react";

const WikiPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: articles = [], isLoading } = useQuery<WikiArticle[]>({
    queryKey: ["/api/wiki"],
  });

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getIconForArticle = (icon: string, category: string) => {
    // If the article has a specific icon, use it
    if (icon) {
      switch (icon.toLowerCase()) {
        case "flask": return <FlaskRound className="h-6 w-6" />;
        case "atom": return <Atom className="h-6 w-6" />;
        case "globe": return <Globe className="h-6 w-6" />;
        case "zap": return <Zap className="h-6 w-6" />;
        case "book": return <BookOpen className="h-6 w-6" />;
        case "microscope": return <Microscope className="h-6 w-6" />;
        case "rocket": return <Rocket className="h-6 w-6" />;
        case "cpu": return <Cpu className="h-6 w-6" />;
        case "database": return <Database className="h-6 w-6" />;
        default: return <Atom className="h-6 w-6" />;
      }
    }

    // Fall back to category-based icon
    switch (category.toLowerCase()) {
      case "chemistry": return <FlaskRound className="h-6 w-6" />;
      case "physics": return <Atom className="h-6 w-6" />;
      case "biology": return <Microscope className="h-6 w-6" />;
      case "astronomy": return <Rocket className="h-6 w-6" />;
      case "earth science": return <Globe className="h-6 w-6" />;
      case "technology": return <Cpu className="h-6 w-6" />;
      default: return <BookOpen className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "chemistry": return "blue";
      case "physics": return "purple";
      case "biology": return "green";
      case "astronomy": return "indigo";
      case "earth science": return "teal";
      case "technology": return "gray";
      default: return "blue";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 font-inter">Science Wiki</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our collection of scientific knowledge, explanations, and fascinating facts
        </p>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto mb-12">
        <Input
          placeholder="Search wiki articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-64 animate-pulse">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="ml-3 h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredArticles.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredArticles.map((article) => {
            const categoryColor = getCategoryColor(article.category);
            
            return (
              <motion.div key={article.id} variants={item}>
                <Card className="h-full card-hover-effect">
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <div className={`bg-${categoryColor}-100 rounded-lg p-3 text-${categoryColor}-600`}>
                        {getIconForArticle(article.icon, article.category)}
                      </div>
                      <span className={`ml-3 text-xs font-medium bg-${categoryColor}-100 text-${categoryColor}-800 px-2 py-1 rounded-full`}>
                        {article.category}
                      </span>
                    </div>
                    <CardTitle>{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 line-clamp-3">
                      {article.content}
                    </CardDescription>
                    <div className="mt-4">
                      <a href={`#article-${article.id}`} className="text-primary font-medium hover:underline">
                        Read More →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No articles found matching your search</h3>
          <p className="mt-2 text-gray-500">Try different keywords or browse all articles</p>
          <button 
            className="mt-4 text-primary font-medium hover:underline"
            onClick={() => setSearchTerm("")}
          >
            View All Articles
          </button>
        </div>
      )}
    </div>
  );
};

export default WikiPage;
