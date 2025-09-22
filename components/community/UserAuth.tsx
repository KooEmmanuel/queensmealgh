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
  AlertCircle
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
    if (!formData.username || !formData.displayName) {
      toast({
        title: "Missing Information",
        description: "Please fill in username and display name",
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
        setFormData({ username: '', displayName: '', email: '', bio: '' });
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
    if (!formData.username) {
      toast({
        title: "Username required",
        description: "Please enter your username",
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
        body: JSON.stringify({ username: formData.username }),
      });

      const data = await response.json();

      if (data.success) {
        const user = data.user;
        localStorage.setItem('community-user', JSON.stringify(user));
        onUserLogin(user);
        setIsLoginOpen(false);
        setFormData({ username: '', displayName: '', email: '', bio: '' });
        
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
        description: (error as Error).message || "Please check your username",
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Join the Community</CardTitle>
          <CardDescription className="text-sm">
            Connect with fellow food enthusiasts and share your culinary experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={isLoading || !formData.username}
            className="w-full"
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
              className="text-sm"
            >
              Don't have an account? Register here
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Register Modal */}
      {isRegisterOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Account</CardTitle>
            <CardDescription>
              Join our community and start sharing your food stories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-username">Username *</Label>
              <div className="relative">
                <Input
                  id="register-username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
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
              <Label htmlFor="register-display">Display Name *</Label>
              <Input
                id="register-display"
                placeholder="How should others see your name?"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-email">Email (optional)</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-bio">Bio (optional)</Label>
              <Input
                id="register-bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRegister}
                disabled={isLoading || usernameAvailable === false || !formData.username || !formData.displayName}
                className="flex-1"
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
                className="flex-1"
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