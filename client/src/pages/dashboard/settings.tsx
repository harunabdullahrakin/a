import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, Settings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Clock, Link, Mail, Phone, MapPin, Globe, Code, FileCode, 
  Image, Navigation, FileText, Copyright, ExternalLink, Palette, 
  Layout, Footprints, LayoutDashboard, Menu, Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("carnival");

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Settings) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Setup form with initial values
  const form = useForm<Settings>({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: settings || {
      id: 1,
      carnivalDate: new Date().toISOString(),
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        youtube: ""
      },
      contactInfo: {
        email: "",
        phone: "",
        address: ""
      },
      websiteSettings: {
        title: "School Science Carnival - Explore, Discover, Create",
        description: "Explore the wonders of science at our annual School Science Carnival. Join us for exciting experiments, competitions, and discovery.",
        favicon: "",
        headerCode: "",
        footerCode: ""
      },
      navbarSettings: {
        logo: "",
        logoText: "SC",
        primaryColor: "#3b82f6",
        registrationLink: "https://example.com/register"
      },
      footerSettings: {
        logoText: "Science Carnival",
        tagline: "Explore, Discover, Innovate",
        description: "Join us for an unforgettable celebration of science, technology, and innovation.",
        privacyPolicyLink: "#",
        termsLink: "#",
        copyrightText: "© Science Carnival. All rights reserved."
      }
    },
  });

  // Update form when settings are loaded
  useState(() => {
    if (settings) {
      form.reset(settings);
    }
  });

  const onSubmit = (data: Settings) => {
    updateMutation.mutate(data);
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure carnival date, social links, and contact information</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="carnival" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 flex flex-wrap">
                <TabsTrigger value="carnival" className="mb-1">Carnival Settings</TabsTrigger>
                <TabsTrigger value="website" className="mb-1">Website Settings</TabsTrigger>
                <TabsTrigger value="navbar" className="mb-1">Navbar Settings</TabsTrigger>
                <TabsTrigger value="footer" className="mb-1">Footer Settings</TabsTrigger>
                <TabsTrigger value="social" className="mb-1">Social Media</TabsTrigger>
                <TabsTrigger value="contact" className="mb-1">Contact Info</TabsTrigger>
              </TabsList>
              
              {/* Carnival Date Settings */}
              <TabsContent value="carnival">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Carnival Date Configuration
                    </CardTitle>
                    <CardDescription>
                      Set the date for the science carnival. This date will be used for the countdown timer on the homepage.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="carnivalDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carnival Date</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  field.onChange(date.toISOString());
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange(new Date().toISOString())}
                            >
                              Today
                            </Button>
                          </div>
                          {field.value && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <Clock className="inline-block mr-1 h-3 w-3" />
                              Countdown to: {format(new Date(field.value), "PPP 'at' p")}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Carnival Date"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Media Links */}
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Link className="mr-2 h-5 w-5" />
                      Social Media Links
                    </CardTitle>
                    <CardDescription>
                      Configure the social media links displayed in the footer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/sciencecarnival" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/sciencecarnival" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/sciencecarnival" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLinks.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/sciencecarnival" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Social Links"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Navbar Settings Tab */}
              <TabsContent value="navbar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Menu className="mr-2 h-5 w-5" />
                      Navbar Configuration
                    </CardTitle>
                    <CardDescription>
                      Customize the navigation bar appearance and registration link.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="navbarSettings.logoText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Logo Text
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="SC" {...field} />
                            </FormControl>
                            <FormDescription>
                              Short text displayed in the navbar logo (1-2 characters recommended)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="navbarSettings.siteTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Type className="mr-2 h-4 w-4" /> Site Title
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Science Carnival" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your site name displayed next to the logo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="navbarSettings.logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Image className="mr-2 h-4 w-4" /> Logo Image
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <FileUpload
                                accept="image/svg+xml,image/png,image/jpeg"
                                maxSizeMB={1}
                                onFileSelect={(base64) => field.onChange(base64)}
                                buttonText="Upload Logo"
                                currentValue={field.value}
                              />
                              {field.value && (
                                <div className="flex items-center mt-2">
                                  <span className="text-sm text-muted-foreground mr-2">Current logo:</span>
                                  <div className="border p-2 rounded bg-white">
                                    <img 
                                      src={field.value} 
                                      alt="Logo preview" 
                                      className="h-12 object-contain" 
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Logo image to display in the navbar (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="navbarSettings.primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Palette className="mr-2 h-4 w-4" /> Primary Color
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="color" {...field} className="w-16 h-10 p-1" />
                              <Input 
                                type="text" 
                                value={field.value} 
                                onChange={field.onChange} 
                                placeholder="#3b82f6" 
                                className="w-32"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Main color used for buttons and highlights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="navbarSettings.displayMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Layout className="mr-2 h-4 w-4" /> Default Logo Display
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || "logo-text"}
                            value={field.value || "logo-text"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select default logo display" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="logo-only">Logo Only</SelectItem>
                              <SelectItem value="logo-text">Logo + Text</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How the logo should be displayed in the navbar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="navbarSettings.registrationLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <ExternalLink className="mr-2 h-4 w-4" /> Registration Link
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/register" {...field} />
                          </FormControl>
                          <FormDescription>
                            External link for the "Register Now" button on the homepage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Navbar Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Footer Settings Tab */}
              <TabsContent value="footer">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Footprints className="mr-2 h-5 w-5" />
                      Footer Configuration
                    </CardTitle>
                    <CardDescription>
                      Customize the footer appearance and content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="footerSettings.logoText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> Logo Text
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Science Carnival" {...field} />
                          </FormControl>
                          <FormDescription>
                            Text displayed next to the logo in the footer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerSettings.tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> Tagline
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Explore, Discover, Innovate" {...field} />
                          </FormControl>
                          <FormDescription>
                            Short tagline displayed under the logo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerSettings.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> Description
                          </FormLabel>
                          <FormControl>
                            <textarea 
                              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md" 
                              placeholder="Join us for an unforgettable celebration of science..." 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description displayed in the footer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerSettings.privacyPolicyLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Link className="mr-2 h-4 w-4" /> Privacy Policy Link
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="#" {...field} />
                          </FormControl>
                          <FormDescription>
                            Link to your privacy policy page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerSettings.termsLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Link className="mr-2 h-4 w-4" /> Terms of Service Link
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="#" {...field} />
                          </FormControl>
                          <FormDescription>
                            Link to your terms of service page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerSettings.copyrightText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Copyright className="mr-2 h-4 w-4" /> Copyright Text
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="© Science Carnival. All rights reserved." {...field} />
                          </FormControl>
                          <FormDescription>
                            Copyright text displayed at bottom of footer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Footer Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Website Settings Tab */}
              <TabsContent value="website">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5" />
                      Website Title & Description
                    </CardTitle>
                    <CardDescription>
                      Change your website title, description and favicon. These settings will be applied to all pages.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="websiteSettings.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileCode className="mr-2 h-4 w-4" /> Website Title
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="School Science Carnival - Explore, Discover, Create" {...field} />
                          </FormControl>
                          <FormDescription>
                            This appears in browser tabs and search results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteSettings.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileCode className="mr-2 h-4 w-4" /> Meta Description
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Explore the wonders of science at our annual School Science Carnival..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Used by search engines to display a brief summary of your website.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteSettings.favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Image className="mr-2 h-4 w-4" /> Favicon (Icon)
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <FileUpload
                                accept="image/svg+xml,image/png,image/jpeg,image/gif"
                                maxSizeMB={1}
                                onFileSelect={(base64) => field.onChange(base64)}
                                buttonText="Upload Favicon"
                                currentValue={field.value}
                              />
                              {field.value && (
                                <div className="flex items-center mt-2">
                                  <span className="text-sm text-muted-foreground mr-2">Current favicon:</span>
                                  <div className="border p-2 rounded">
                                    <img 
                                      src={field.value} 
                                      alt="Favicon preview" 
                                      className="w-8 h-8 object-contain" 
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjNDM2N2Y4Ij48cGF0aCBkPSJNMjU2IDEyOGMxNy43IDAgMzItMTQuMyAzMi0zMnMtMTQuMy0zMi0zMi0zMi0zMiAxNC4zLTMyIDMyIDE0LjMgMzIgMzIgMzJ6bTEzOC4zIDE3LjJjLTI4LjItMzYuNS02My41LTc1LjItMTAxLjctMTA2LjVDMjc0IDI2LjcgMjY1LjEgMjQgMjU2IDI0cy0xOCAyLjctMzYuNiAxNC43Yy0zOC4yIDMxLjMtNzMuNSA3MC0xMDEuNyAxMDYuNUM1NC4yIDE5MSAzMS4zIDIzNy4xIDMxLjMgMjgwcy0yMi45IDg5IDE3LjkgMTM0LjdjMjguMiAzNi41IDYzLjUgNzUuMiAxMDEuNyAxMDYuNSAxOC42IDEyIDI3LjUgMTQuNyAzNi42IDE0LjdzMTgtMi43IDM2LjYtMTQuN2MzOC4yLTMxLjMgNzMuNS03MCAxMDEuNy0xMDYuNSA0MC44LTQ1LjggNjMuOC05MS45IDYzLjgtMTM0LjdzLTIzLTg5LTYzLjgtMTM0LjhabS02Ni4zIDExOS42YzI5LjkgLjEgMzQuNCAxWE0yNzAuMiAyODEuMWMtOS43IDE1LjktMjEuNiAyOS01My42IDI5LTMyLjggMC00NC45LTEzLjktNTQuNi0zMC4xbDYuNy0zLjljMTIuOSA4LjEgMzQuMSAxNC41IDQ4LjkgMTQuNSAxNC44IDAgMzUuOS02LjMgNDguOS0xNC40bDYuNyAzLjlWMjgxelptLTQuMS0zNC41Yy0yLjkgNS44LTYuMSAxMS45LTE0LjkgMTEuOS04LjggMC0xMi01LjUtMTUuMy0xMS4yLTIuNC00LjEtNS0xLjgtNS41LjVhNjcuMyA2Ny4zIDAgMCAwIDIwLjQgMzQuN2MxMC4zIDcgMjUuNCAxMS4xIDQwLjQgMTEuMXMzMC4xLTQuMSA0MC40LTExLjFhNjcuMyA2Ny4zIDAgMCAwIDIwLjQtMzQuN2MtLjMtMS4zLTEuOS03LjQtNS41LS41LTMuMyA1LjctNi41IDExLjItMTUuMyAxMS4ycy0xMi4zLTYuMS0xNS4xLTExLjljLTIuOC01LjgtNS40LTUuOC04LS4xWiIvPjwvc3ZnPg=='
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="flex mt-2">
                                <Input 
                                  placeholder="...or enter a URL to icon image" 
                                  {...field} 
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload an SVG/PNG file or enter a URL for your site icon.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Website Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="mr-2 h-5 w-5" />
                      Custom Code
                    </CardTitle>
                    <CardDescription>
                      Add custom HTML/JavaScript code to the header or footer of your website.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="websiteSettings.headerCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Code className="mr-2 h-4 w-4" /> Header Code
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md"
                              placeholder="<!-- Add custom header code like analytics or meta tags -->"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This code will be inserted inside the &lt;head&gt; tag.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteSettings.footerCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Code className="mr-2 h-4 w-4" /> Footer Code
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md"
                              placeholder="<!-- Add custom footer code like scripts or widgets -->"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This code will be inserted before the closing &lt;/body&gt; tag.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Custom Code"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Set the contact information displayed on the contact page and in the footer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" /> Email Address
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="info@sciencecarnival.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" /> Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" /> Address
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="123 Science Street, Education City, ED 12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Contact Info"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
    </div>
  );
};

export default SettingsPage;
