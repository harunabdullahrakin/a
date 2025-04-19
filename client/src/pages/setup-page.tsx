import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import Particles from "@/components/ui/particles";
import { Beaker, Atom, CircleDot, Database, Server, User as UserIcon } from "lucide-react";

// Form validation schema
const setupFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SetupFormValues = z.infer<typeof setupFormSchema>;

const SetupPage = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [setupCompleted, setSetupCompleted] = useState(false);
  
  // Check if admin already exists
  const { data: adminExists, isLoading } = useQuery<boolean>({
    queryKey: ["/api/setup/check"]
  });
  
  // Use useEffect to handle redirection when data changes
  useEffect(() => {
    if (adminExists) {
      navigate("/auth");
    }
  }, [adminExists, navigate]);

  // Setup mutation
  const setupMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/setup", userData);
      return res.json();
    },
    onSuccess: (user: User) => {
      toast({
        title: "Setup Complete",
        description: "Admin account created successfully. You can now log in.",
      });
      setSetupCompleted(true);
      // After a short delay, redirect to login
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SetupFormValues) => {
    setupMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  // If admin already exists or setup completed, show appropriate message
  if (adminExists || setupCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
        <div className="absolute inset-0 z-0">
          <Particles className="absolute inset-0" />
        </div>
        
        <Card className="w-full max-w-md shadow-lg relative z-10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Setup Completed</CardTitle>
            <CardDescription>
              Admin account has already been created. Redirecting to login page...
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="absolute inset-0 z-0">
        <Particles className="absolute inset-0" />

        <div className="absolute top-1/4 left-1/4 animate-float-slow text-blue-500 opacity-20">
          <Beaker size={64} />
        </div>
        <div className="absolute top-3/4 left-1/3 animate-float text-purple-500 opacity-20">
          <Database size={72} />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-spin-slow text-indigo-500 opacity-20">
          <Atom size={80} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float-slow text-teal-500 opacity-20">
          <CircleDot size={64} />
        </div>
        <div className="absolute top-1/2 right-1/2 animate-pulse text-green-500 opacity-20">
          <Server size={72} />
        </div>
      </div>
      
      <Card className="w-full max-w-md shadow-lg relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white">
              <Server size={24} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">First-time Setup</CardTitle>
          <CardDescription className="text-center">
            Create your admin account to manage the Science Carnival website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" /> Admin Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be your login username
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use a strong password with at least 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={setupMutation.isPending}
              >
                {setupMutation.isPending ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;