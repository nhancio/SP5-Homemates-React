import React, { useState, useEffect } from 'react';
import { Star, Users, MapPin, DollarSign, Heart, TrendingUp, Target, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getPersonalizedRecommendations, MatchScore, PropertyMatchScore } from '../services/matching';

interface MatchingDashboardProps {
  onViewMatches: () => void;
}

const MatchingDashboard: React.FC<MatchingDashboardProps> = ({ onViewMatches }) => {
  const { user } = useAppContext();
  const [recommendations, setRecommendations] = useState<{
    topUserMatches: MatchScore[];
    topPropertyMatches: PropertyMatchScore[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const recs = await getPersonalizedRecommendations(user);
          setRecommendations(recs);
        } catch (error) {
          console.error('Error loading recommendations:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRecommendations();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Matching Algorithm 🎯</h2>
          <p className="text-gray-600">Personalized recommendations based on your preferences</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full">
          <Zap className="w-5 h-5 text-primary-600" />
          <span className="text-primary-700 font-semibold">AI Powered</span>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Preference Matching</h3>
          </div>
          <p className="text-sm text-blue-700">35% weight on shared interests and lifestyle preferences</p>
        </div>  */}

        {/* <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-green-800">Location Matching</h3>
          </div>
          <p className="text-sm text-green-700">25% weight on city and locality compatibility</p>
        </div> */}

        {/* <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Budget Compatibility</h3>
          </div>
          <p className="text-sm text-purple-700">20% weight on budget range overlap</p>
        </div> */}

        {/* <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Lifestyle Match</h3>
          </div>
          <p className="text-sm text-orange-700">15% weight on age, profession, and lifestyle</p>
        </div>  */}
      </div> 

      {/* Top Matches Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top User Matches</h3>
          <button
            onClick={onViewMatches}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.topUserMatches.slice(0, 3).map((match, idx) => (
            <div key={match.user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                {match.user.photoURL ? (
                  <img 
                    src={match.user.photoURL} 
                    alt={match.user.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                    <span className="text-primary-800 font-semibold text-sm">
                      {match.user.userName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{match.user.userName}</h4>
                  <p className="text-sm text-gray-600">{match.user.profession}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Match Score</span>
                <span className="font-bold text-primary-600">{match.score}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${match.score}%` }}
                />
              </div>
              
              {match.sharedPreferences.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Shared: {match.sharedPreferences.slice(0, 2).join(', ')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Property Matches Preview */}
      {recommendations.topPropertyMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Property Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.topPropertyMatches.slice(0, 3).map((match, idx) => (
              <div key={match.property.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {match.property.address.buildingName || 'Property'}
                  </h4>
                  <span className="font-bold text-primary-600">{match.score}%</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {match.property.address.locality}, {match.property.address.city}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {match.property.listingType === 'rent' ? 'Rent' : 'Price'}
                  </span>
                  <span className="font-semibold">
                    ₹{match.property.listingType === 'rent' 
                      ? match.property.rentDetails?.costs?.rent?.toLocaleString() 
                      : match.property.sellDetails?.price?.toLocaleString()}
                  </span>
                </div>
                
                {match.matchReasons.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      {match.matchReasons[0]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchingDashboard; 