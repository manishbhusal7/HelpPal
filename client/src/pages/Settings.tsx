import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface SettingsProps {
  userId: number | undefined;
}

export default function Settings({ userId }: SettingsProps) {
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });

  // Profile form schema
  const profileFormSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    avatarInitials: z.string().min(1, {
      message: "Avatar initials are required.",
    }).max(2, {
      message: "Avatar initials can be a maximum of 2 characters.",
    })
  });

  // Password form schema
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatarInitials: user?.avatarInitials || "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated.",
    });
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });
    setIsChangingPassword(false);
    passwordForm.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Settings</h2>
          <p className="text-sm text-neutral-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Account Settings</h1>
        <p className="text-neutral-500">Manage your account preferences and information</p>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Account Connections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <span className="text-lg font-medium">{user?.avatarInitials}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Profile Photo</h3>
                      <p className="text-xs text-neutral-500">We use your initials for your avatar</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="avatarInitials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar Initials</FormLabel>
                          <FormControl>
                            <Input placeholder="JD" maxLength={2} {...field} />
                          </FormControl>
                          <FormDescription>
                            Up to 2 characters that will be used for your avatar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-900">Password</h3>
                
                {!isChangingPassword ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-neutral-500">Update your password to protect your account</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-2">
                        <Button type="submit">Update Password</Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsChangingPassword(false);
                            passwordForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                    <p className="text-xs text-neutral-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Login Sessions</h3>
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-neutral-500">Started 2 hours ago · Web Browser · United States</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-success-500 border-success-200">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-900">Display</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Theme</p>
                      <p className="text-xs text-neutral-500">Choose your preferred theme</p>
                    </div>
                    <Select defaultValue="light">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Currency</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default Currency</p>
                    <p className="text-xs text-neutral-500">Used for displaying monetary values</p>
                  </div>
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Privacy</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Usage Analytics</p>
                      <p className="text-xs text-neutral-500">Help us improve by sharing usage data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Personalized Recommendations</p>
                      <p className="text-xs text-neutral-500">Receive tailored financial advice</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your financial account connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="material-icons text-2xl text-primary-500 mr-3">account_balance</span>
                    <div>
                      <p className="text-sm font-medium">Bank of America</p>
                      <p className="text-xs text-neutral-500">Connected 2 months ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>
                
                <div className="flex justify-between items-center p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="material-icons text-2xl text-primary-500 mr-3">credit_card</span>
                    <div>
                      <p className="text-sm font-medium">Chase</p>
                      <p className="text-xs text-neutral-500">Connected 3 weeks ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>
              </div>
              
              <div className="p-4 border border-dashed border-neutral-300 rounded-lg text-center">
                <span className="material-icons text-neutral-400 text-3xl mb-2">add_circle_outline</span>
                <h3 className="text-sm font-medium text-neutral-900 mb-1">Connect a New Account</h3>
                <p className="text-xs text-neutral-500 mb-3">Link your financial accounts to get better insights</p>
                <Button>Connect Account</Button>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-medium text-neutral-900">Data Sharing</h3>
                <p className="text-xs text-neutral-500">
                  We use industry-standard security measures to protect your data. Your bank login credentials are never stored on our servers.
                </p>
                <div className="flex items-center space-x-2 text-xs text-primary-600">
                  <span className="material-icons text-sm">shield</span>
                  <span>Learn more about our security practices</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Badge({ variant, className, children }: { variant: string, className: string, children: React.ReactNode }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
