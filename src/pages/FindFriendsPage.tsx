import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { User as UserIcon } from 'lucide-react';
import MatchingDashboard from '../components/MatchingDashboard';
import { ProfileCard } from '../components/ui/profile-card';

interface User {
  id: string;
  name?: string;
  userName?: string;
  age?: number;
  profession?: string;
  city?: string;
  locality?: string;
  preferences?: string[];
  userPhoneNumber?: string;
  phone?: string;
  photoURL?: string;
  avatarUrl?: string;
  gender?: string;
  housingType?: string; // 'shared' or 'full'
  address?: {
    city?: string;
    locality?: string;
  };
}

const FindFriendsPage = () => {
  const { user, isAuthenticated, login, loginError, clearLoginError } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const handleLoginPrompt = () => {
        if (window.confirm('Please login to access Find Friends. Would you like to login now?')) {
          login();
        } else {
          // If user cancels, redirect to home page
          window.location.href = '/';
        }
      };
      handleLoginPrompt();
    }
  }, [isAuthenticated, login]);



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user's gender for filtering
        const currentUserGender = user?.gender || '';
        
        console.log('Current user gender:', currentUserGender);
        console.log('Current user:', user);
        
        let usersData: User[] = [];
        
        // Use optimized query if user has gender set
        if (currentUserGender && currentUserGender.trim() !== '') {
          // Normalize gender for query (handle common variations)
          const normalizedGender = currentUserGender.toLowerCase().trim();
          
          console.log('Attempting to fetch users with gender:', normalizedGender);
          
          try {
            // First, let's try the exact match query
            const usersQuery = query(
              collection(db, 'u'),
              where('gender', '==', normalizedGender)
            );
            
            const snapshot = await getDocs(usersQuery);
            usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
            
            console.log(`Query-based filtering: Found ${usersData.length} users with gender '${normalizedGender}'`);
            
            // If no users found, let's try fetching all users and filtering client-side to debug
            if (usersData.length === 0) {
              console.log('No users found with exact gender match, fetching all users to debug...');
              const allUsersSnapshot = await getDocs(collection(db, 'u'));
              const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
              
              console.log('All users in database:', allUsers.map(u => ({ 
                id: u.id, 
                name: u.name, 
                gender: u.gender,
                genderType: typeof u.gender 
              })));
              
              // Try different gender formats
              const possibleGenders = [
                normalizedGender,
                currentUserGender, // Original case
                currentUserGender.toLowerCase(),
                currentUserGender.toUpperCase(),
                currentUserGender.charAt(0).toUpperCase() + currentUserGender.slice(1).toLowerCase(), // Title case
              ];
              
              console.log('Trying different gender formats:', possibleGenders);
              
              for (const genderFormat of possibleGenders) {
                const matchingUsers = allUsers.filter(u => {
                  const userGender = u.gender || '';
                  return userGender.toLowerCase().trim() === genderFormat.toLowerCase().trim();
                });
                
                if (matchingUsers.length > 0) {
                  console.log(`Found ${matchingUsers.length} users with gender format: "${genderFormat}"`);
                  usersData = matchingUsers;
                  break;
                }
              }
              
              if (usersData.length === 0) {
                console.log('No users found with any gender format. Available genders in database:');
                const uniqueGenders = [...new Set(allUsers.map(u => u.gender).filter(Boolean))];
                console.log(uniqueGenders);
              }
            }
          } catch (queryError) {
            console.error('Error with gender query, falling back to fetch all:', queryError);
            // Fallback: fetch all users and filter client-side
            const allUsersSnapshot = await getDocs(collection(db, 'u'));
            const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
            
            usersData = allUsers.filter(u => {
              const userGender = u.gender || '';
              return userGender.toLowerCase().trim() === normalizedGender;
            });
            
            console.log(`Fallback filtering: Found ${usersData.length} users with gender '${normalizedGender}'`);
          }
        } else {
          console.log('No gender filtering applied - current user has no gender set');
          // If user has no gender, don't show any users for safety
          usersData = [];
        }
        
        // Filter out current user
        usersData = usersData.filter(u => u.id !== user?.id);
        console.log('Users after removing current user:', usersData.length);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        // Debug: Show which users are being displayed
        console.log('=== FINAL USERS BEING DISPLAYED ===');
        usersData.forEach((u, index) => {
          console.log(`${index + 1}. ${u.name || 'No Name'} (${u.id}) - Gender: ${u.gender || 'Not set'}`);
        });
        console.log('=== END DISPLAYED USERS ===');
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_blank');
    } else {
      alert('Phone number not available');
    }
  };

  const handleWhatsApp = (phoneNumber: string, userName: string) => {
    if (phoneNumber) {
      const currentUserName = user?.name || 'a Homemates user';
      const message = `Hi ${userName}! I'm ${currentUserName} from the Homemates app. I found your profile and would love to connect with you!`;
      
      // Clean phone number and ensure it has country code
      let cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone; // Add India country code if missing
      }
      
      // Use the api.whatsapp.com format for better compatibility
      const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
        } else {
      alert('Phone number not available');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent">
            Find Friends
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Connect with other Homemates users and grow your network!
          </p>
        </div>

        {/* Smart Matching Algorithm section */}
        {user && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 text-pink-700">
                Smart Matching Algorithm 🎯
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Find your perfect flatmate using our advanced preference matching system.
              </p>
            </div>
            <div className="py-4 md:py-8">
              <MatchingDashboard onViewMatches={() => {}} />
            </div>
          </div>
        )}
        
        {/* Authentication Check */}
        {!isAuthenticated ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200">
            <div className="mb-6">
              <UserIcon className="w-16 h-16 mx-auto text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please login to access Find Friends and connect with other Homemates users.
              </p>
            </div>
            <button
              onClick={async () => {
                clearLoginError();
                await login();
              }}
              className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Login to Continue
            </button>
            {loginError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {loginError}
              </div>
            )}
          </div>
        ) : (
          <>
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                <p className="text-lg text-pink-600 mt-4">Loading...</p>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}
        
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredUsers.map((user) => {
                const name = user.name || user.userName || 'No Name';
                const city = user.city || user.address?.city;
                const locality = user.locality || user.address?.locality;
                const profession = user.profession;
                const avatarUrl = user.photoURL || user.avatarUrl;
                const preferences = user.preferences || [];
                const phoneNumber = user.userPhoneNumber || user.phone;
                
                return (
                  <ProfileCard
                    key={user.id}
                    name={name}
                    avatar={avatarUrl}
                    city={city}
                    locality={locality}
                    profession={profession}
                    preferences={preferences}
                    phoneNumber={phoneNumber}
                    onCall={phoneNumber ? () => handleCall(phoneNumber) : undefined}
                    onWhatsApp={phoneNumber ? () => handleWhatsApp(phoneNumber, name) : undefined}
                  />
                );
              })}
            </div>
        
            {(!loading && filteredUsers.length === 0) && (
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 mx-auto text-pink-300 mb-4" />
                <p className="text-lg text-gray-600">
                  {user?.gender ? `No ${user.gender} users found matching your criteria.` : 'No users found matching your criteria.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FindFriendsPage;