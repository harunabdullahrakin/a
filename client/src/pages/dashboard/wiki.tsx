import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWikiArticleSchema, WikiArticle, InsertWikiArticle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  BookOpen,
  Atom,
  FlaskRound,
  Globe,
  Microscope,
  Rocket,
  Database 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const WikiManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null>(null);

  // Fetch all wiki articles
  const { data: articles = [], isLoading } = useQuery<WikiArticle[]>({
    queryKey: ["/api/wiki"],
  });

  // Form setup for adding/editing articles
  const form = useForm<InsertWikiArticle>({
    resolver: zodResolver(insertWikiArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      icon: "book",
      isFeatured: false,
    },
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (articleData: InsertWikiArticle) => {
      const res = await apiRequest("POST", "/api/wiki", articleData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wiki"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wiki/featured"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Article Created",
        description: "Wiki article has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertWikiArticle }) => {
      const res = await apiRequest("PUT", `/api/wiki/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wiki"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wiki/featured"] });
      setEditingArticle(null);
      form.reset();
      toast({
        title: "Article Updated",
        description: "Wiki article has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wiki/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wiki"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wiki/featured"] });
      toast({
        title: "Article Deleted",
        description: "Wiki article has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertWikiArticle) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditArticle = (article: WikiArticle) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      content: article.content,
      category: article.category,
      icon: article.icon,
      isFeatured: article.isFeatured,
    });
  };

  const handleDeleteArticle = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingArticle(null);
    form.reset();
  };

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "flask": return <FlaskRound className="h-5 w-5" />;
      case "atom": return <Atom className="h-5 w-5" />;
      case "globe": return <Globe className="h-5 w-5" />;
      case "microscope": return <Microscope className="h-5 w-5" />;
      case "rocket": return <Rocket className="h-5 w-5" />;
      case "database": return <Database className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wiki Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Create and manage scientific articles for the wiki</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center text-xs sm:text-sm py-2" onClick={() => form.reset()}>
                <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Add New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New Wiki Article</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Create a new scientific article for the wiki. Fill in all the details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Article Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter article title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Chemistry">Chemistry</SelectItem>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="Biology">Biology</SelectItem>
                              <SelectItem value="Astronomy">Astronomy</SelectItem>
                              <SelectItem value="Earth Science">Earth Science</SelectItem>
                              <SelectItem value="Technology">Technology</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an icon" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flask">
                                <div className="flex items-center">
                                  <FlaskRound className="h-4 w-4 mr-2" /> FlaskRound
                                </div>
                              </SelectItem>
                              <SelectItem value="atom">
                                <div className="flex items-center">
                                  <Atom className="h-4 w-4 mr-2" /> Atom
                                </div>
                              </SelectItem>
                              <SelectItem value="globe">
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" /> Globe
                                </div>
                              </SelectItem>
                              <SelectItem value="microscope">
                                <div className="flex items-center">
                                  <Microscope className="h-4 w-4 mr-2" /> Microscope
                                </div>
                              </SelectItem>
                              <SelectItem value="rocket">
                                <div className="flex items-center">
                                  <Rocket className="h-4 w-4 mr-2" /> Rocket
                                </div>
                              </SelectItem>
                              <SelectItem value="database">
                                <div className="flex items-center">
                                  <Database className="h-4 w-4 mr-2" /> Database
                                </div>
                              </SelectItem>
                              <SelectItem value="book">
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-2" /> Book
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write the article content here" 
                            className="resize-none min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Article</FormLabel>
                          <FormDescription>
                            Display this article on the homepage
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Dialog */}
          {editingArticle && (
            <Dialog open={!!editingArticle} onOpenChange={(open) => !open && setEditingArticle(null)}>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Edit Wiki Article</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Update the details for this wiki article.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter article title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                <SelectItem value="Physics">Physics</SelectItem>
                                <SelectItem value="Biology">Biology</SelectItem>
                                <SelectItem value="Astronomy">Astronomy</SelectItem>
                                <SelectItem value="Earth Science">Earth Science</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an icon" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="flask">
                                  <div className="flex items-center">
                                    <FlaskRound className="h-4 w-4 mr-2" /> FlaskRound
                                  </div>
                                </SelectItem>
                                <SelectItem value="atom">
                                  <div className="flex items-center">
                                    <Atom className="h-4 w-4 mr-2" /> Atom
                                  </div>
                                </SelectItem>
                                <SelectItem value="globe">
                                  <div className="flex items-center">
                                    <Globe className="h-4 w-4 mr-2" /> Globe
                                  </div>
                                </SelectItem>
                                <SelectItem value="microscope">
                                  <div className="flex items-center">
                                    <Microscope className="h-4 w-4 mr-2" /> Microscope
                                  </div>
                                </SelectItem>
                                <SelectItem value="rocket">
                                  <div className="flex items-center">
                                    <Rocket className="h-4 w-4 mr-2" /> Rocket
                                  </div>
                                </SelectItem>
                                <SelectItem value="database">
                                  <div className="flex items-center">
                                    <Database className="h-4 w-4 mr-2" /> Database
                                  </div>
                                </SelectItem>
                                <SelectItem value="book">
                                  <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-2" /> Book
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write the article content here" 
                              className="resize-none min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Article</FormLabel>
                            <FormDescription>
                              Display this article on the homepage
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setEditingArticle(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Saving...' : 'Update Article'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Wiki Articles Table */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Wiki Articles
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage all scientific articles for the wiki
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-xs sm:text-sm text-gray-500">Loading articles...</p>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <h3 className="text-base sm:text-lg font-medium text-gray-600">No articles found</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Create your first article by clicking the 'Add New Article' button</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="py-3 text-xs sm:text-sm font-medium">Title</TableHead>
                      <TableHead className="hidden sm:table-cell py-3 text-xs sm:text-sm font-medium">Category</TableHead>
                      <TableHead className="hidden md:table-cell py-3 text-xs sm:text-sm font-medium">Icon</TableHead>
                      <TableHead className="py-3 text-xs sm:text-sm font-medium">Featured</TableHead>
                      <TableHead className="text-right py-3 text-xs sm:text-sm font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium py-3 text-xs sm:text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="truncate max-w-[120px] sm:max-w-none">{article.title}</span>
                            <span className="text-xs text-gray-500 mt-1 sm:hidden">{article.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell py-3 text-xs sm:text-sm">{article.category}</TableCell>
                        <TableCell className="hidden md:table-cell py-3 text-xs sm:text-sm">
                          <div className="flex items-center">
                            {getIconComponent(article.icon)}
                            <span className="ml-2 capitalize text-xs sm:text-sm">{article.icon}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs sm:text-sm">
                          {article.isFeatured ? (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
                              <span className="text-xs sm:text-sm">Featured</span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                              onClick={() => handleEditArticle(article)}
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 sm:h-8 sm:w-8 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-md mx-4">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs sm:text-sm">
                                    This will permanently delete the article "{article.title}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm"
                                    onClick={() => handleDeleteArticle(article.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WikiManagement;
