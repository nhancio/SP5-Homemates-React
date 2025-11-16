import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAppContext } from '../context/AppContext';
import { User as UserIcon, ChevronDown } from 'lucide-react';
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

  const [showContent, setShowContent] = useState(false);

  // Lock scroll until 'What's inside?' is clicked
  useEffect(() => {
    if (!showContent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showContent]);

  const handleScrollToContent = () => {
    setShowContent(true);
    setTimeout(() => {
      const contentSection = document.getElementById('find-friends-content');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Full-screen Hero Section with "What's inside?" button */}
      <div className="h-screen flex flex-col relative -mt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 text-center px-4">Find Friends</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 text-center px-4">
            Connect with other Homemates users and grow your network!
          </p>
          
          {/* "What's inside?" button */}
          <div className="mt-8">
            <button
              onClick={handleScrollToContent}
              className="group px-6 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 flex items-center gap-2 md:gap-3 font-semibold text-gray-900 text-sm md:text-base transition-all duration-300 focus:outline-none border-none shadow-lg hover:shadow-xl min-h-[44px]"
            >
              <span className="flex items-center gap-1 md:gap-2">
                <span className="text-sm md:text-base font-semibold tracking-wide">What's inside?</span>
                <span className="relative">
                  <ChevronDown className="w-5 h-5 md:w-7 md:h-7 text-white transition-all duration-300 group-hover:scale-110 group-hover:text-pink-100 group-hover:filter group-hover:brightness-110" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {showContent && (
        <div id="find-friends-content" className="min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
          {/* Smart Matching Algorithm section */}
          <div className="container mx-auto px-4 mb-8">
            <div className="text-center py-8 md:py-16">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-1 text-primary-700 text-center px-4">Smart Matching Algorithm 🎯</h1>
              <p className="text-base md:text-lg text-gray-600 text-center px-4">Find your perfect flatmate using our advanced preference matching system.</p>
            </div>
            
            {/* Show matching dashboard for logged-in users */}
            {user && (
              <div className="py-4 md:py-8">
                <MatchingDashboard onViewMatches={() => {}} />
              </div>
            )}
          </div>

      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 text-center">Find Friends</h1>
        <p className="text-lg text-gray-600 mb-4 text-center">
          Connect with other Homemates users and grow your network!
        </p>
        
        {/* Authentication Check */}
        {!isAuthenticated ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="mb-6">
              <UserIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please login to access Find Friends and connect with other Homemates users.
              </p>
            </div>
            <button
              onClick={async () => {
                clearLoginError();
                await login();
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Login to Continue
            </button>
            {loginError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                {loginError}
              </div>
            )}
          </div>
        ) : (
          <>
            {loading && <div className="text-center text-lg text-primary-600">Loading...</div>}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        
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
              <div className="text-center text-gray-500 mt-8">
                {user?.gender ? `No ${user.gender} users found matching your criteria.` : 'No users found matching your criteria.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
      )}
    </>
  );
};

export default FindFriendsPage;