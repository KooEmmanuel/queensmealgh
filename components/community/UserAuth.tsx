"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, 
  LogOut, 
  Settings, 
  Crown, 
  Star, 
  MessageSquare,
  Heart,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  postCount: number;
  commentCount: number;
  likeCount: number;
  reputation: number;
  badges: string[];
  isVerified: boolean;
  lastActive: string;
}

interface UserAuthProps {
  onUserLogin: (user: UserProfile) => void;
  onUserLogout: () => void;
  currentUser?: UserProfile | null;
}

export function UserAuth({ onUserLogin, onUserLogout, currentUser }: UserAuthProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('community-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        onUserLogin(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('community-user');
      }
    }
  }, [onUserLogin]);

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`/api/community/username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      setUsernameAvailable(!data.exists);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    setFormData({ ...formData, username });
    if (username.length >= 3) {
      checkUsernameAvailability(username);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleRegister = async () => {
    if (!formData.username || !formData.displayName || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Username taken",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/community/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        const user = data.user;
        localStorage.setItem('community-user', JSON.stringify(user));
        onUserLogin(user);
        setIsRegisterOpen(false);
        setFormData({ username: '', displayName: '', email: '', password: '', bio: '' });
        setUsernameAvailable(null);
        
        toast({
          title: "Welcome to the community!",
          description: `You're now registered as ${user.displayName}`,
        });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: (error as Error).message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/community/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const user = data.user;
        localStorage.setItem('community-user', JSON.stringify(user));
        onUserLogin(user);
        setIsLoginOpen(false);
        setFormData({ username: '', displayName: '', email: '', password: '', bio: '' });
        
        toast({
          title: "Welcome back!",
          description: `Hello ${user.displayName}`,
        });
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Please check your credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('community-user');
    onUserLogout();
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  };

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 1000) return { color: 'bg-purple-100 text-purple-800', text: 'Legend', icon: Crown };
    if (reputation >= 500) return { color: 'bg-gold-100 text-gold-800', text: 'Expert', icon: Star };
    if (reputation >= 100) return { color: 'bg-blue-100 text-blue-800', text: 'Veteran', icon: Star };
    if (reputation >= 50) return { color: 'bg-green-100 text-green-800', text: 'Regular', icon: Star };
    return { color: 'bg-gray-100 text-gray-800', text: 'Newcomer', icon: User };
  };

  if (currentUser) {
    const reputationBadge = getReputationBadge(currentUser.reputation);
    const BadgeIcon = reputationBadge.icon;

    return (
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
              <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
              <AvatarFallback className="bg-green-100 text-green-800 text-sm sm:text-base">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">
                  {currentUser.displayName}
                </h3>
                {currentUser.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                <Badge className={`${reputationBadge.color} text-xs`}>
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  {reputationBadge.text}
                </Badge>
                <span className="text-xs text-gray-500">
                  {currentUser.reputation} points
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 shrink-0"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs">
              <div>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">{currentUser.postCount}</div>
                <div className="text-gray-500">Posts</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">{currentUser.commentCount}</div>
                <div className="text-gray-500">Comments</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">{currentUser.likeCount}</div>
                <div className="text-gray-500">Likes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Login Form */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-gradient-green-orange">Join the Community</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Connect with fellow food enthusiasts and share your culinary experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-orange-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border-orange-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsRegisterOpen(true)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Don't have an account? Register here
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Register Modal */}
      {isRegisterOpen && (
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-gradient-green-orange">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join our community and start sharing your food stories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-username" className="text-sm font-medium text-gray-700">Username *</Label>
              <div className="relative">
                <Input
                  id="register-username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="border-green-200 focus:border-orange-500 focus:ring-orange-500"
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
                {usernameAvailable === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {usernameAvailable === false && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {usernameAvailable === true && (
                <p className="text-xs text-green-600">Username is available!</p>
              )}
              {usernameAvailable === false && (
                <p className="text-xs text-red-600">Username is already taken</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-display" className="text-sm font-medium text-gray-700">Display Name *</Label>
              <Input
                id="register-display"
                placeholder="How should others see your name?"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="border-green-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">Email *</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-green-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">Password *</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-green-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-bio" className="text-sm font-medium text-gray-700">Bio (optional)</Label>
              <Input
                id="register-bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="border-green-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRegister}
                disabled={isLoading || usernameAvailable === false || !formData.username || !formData.displayName || !formData.email || !formData.password}
                className="flex-1 bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsRegisterOpen(false)}
                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}