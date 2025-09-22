'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Rating {
  _id: string;
  recipeId: string;
  rating: number;
  country: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface RatingStats {
  ratings: Rating[];
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Array<{
    star: number;
    count: number;
    percentage: number;
  }>;
}

interface RecipeRatingProps {
  recipeId: string;
  currentRating?: number;
  onRatingChange?: (newRating: number) => void;
}

export function RecipeRating({ recipeId, currentRating, onRatingChange }: RecipeRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userCountry, setUserCountry] = useState('');

  useEffect(() => {
    fetchRatingStats();
    // Try to get user's country
    fetchUserCountry();
  }, [recipeId]);

  const fetchRatingStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${recipeId}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRatingStats(data);
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCountry = async () => {
    try {
      // Use a simple IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        setUserCountry(data.country_name || 'Unknown');
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
      setUserCountry('Unknown');
    }
  };

  const handleRatingSubmit = async (selectedRating: number) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/recipes/${recipeId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: selectedRating,
          country: userCountry,
          userId: 'anonymous', // In a real app, this would be the logged-in user ID
          userName: 'Anonymous User'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRatingStats(data);
        setRating(selectedRating);
        onRatingChange?.(selectedRating);
        toast.success('Thank you for rating this recipe!');
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (interactive ? hoveredRating || rating : rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            onClick={() => interactive && handleRatingSubmit(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Rate This Recipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Input */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            How would you rate this recipe?
          </p>
          <div className="flex justify-center">
            {renderStars(rating, true)}
          </div>
          {submitting && (
            <p className="text-sm text-gray-500 mt-2">Submitting rating...</p>
          )}
        </div>

        {/* Rating Statistics */}
        {ratingStats && ratingStats.totalRatings > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderStars(ratingStats.averageRating)}
                <span className="text-lg font-semibold">
                  {ratingStats.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingStats.ratingDistribution.map((dist) => (
                <div key={dist.star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{dist.star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Reviewers */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'reviewer' : 'reviewers'}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* No ratings yet */}
        {ratingStats && ratingStats.totalRatings === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              Be the first to rate this recipe!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}