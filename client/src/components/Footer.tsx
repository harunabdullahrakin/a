import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Settings } from "@shared/schema";

const Footer = () => {
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "youtube":
        return <Youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const contactInfo = settings?.contactInfo || {
    email: "info@sciencecarnival.edu",
    phone: "(123) 456-7890"
  };

  const socialLinks = settings?.socialLinks || {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    youtube: "#"
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl font-mono">SC</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold font-inter">Science Carnival</h3>
                <p className="text-gray-400">Explore, Discover, Innovate</p>
              </div>
            </div>
            <p className="mt-4 text-gray-400">
              Join us for an unforgettable celebration of science, technology, and innovation. 
              The Science Carnival brings together students, educators, and professionals for 
              a day of learning and fun!
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-inter mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Home</div>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Events</div>
                </Link>
              </li>
              <li>
                <Link href="/wiki">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Wiki</div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</div>
                </Link>
              </li>
              <li>
                <Link href="/auth">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Admin Login</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-inter mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
            <p className="text-gray-400">
              <strong>Email:</strong>{" "}
              <a href={`mailto:${contactInfo.email}`} className="hover:text-white">
                {contactInfo.email}
              </a>
            </p>
            <p className="text-gray-400 mt-2">
              <strong>Phone:</strong>{" "}
              <a href={`tel:${contactInfo.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white">
                {contactInfo.phone}
              </a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Science Carnival. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm mx-2">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm mx-2">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm mx-2">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
