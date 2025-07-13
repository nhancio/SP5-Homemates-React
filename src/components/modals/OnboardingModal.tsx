import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

interface OnboardingModalProps {
  userId: string;
  email: string;
  name: string;
  onClose: () => void;
}

interface Market {
  id: string;
  name: string;
}

const PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'nonSmoker', label: 'Non-smoker' },
  { id: 'nonAlcoholic', label: 'Non-alcoholic' },
  { id: 'partyFriendly', label: 'Party friendly' },
  { id: 'coupleFriendly', label: 'Couple friendly' },
];

const LOOKING_FOR = [
  'Room', 'Flat', 'Homemate'
];

const GENDERS = ['Male', 'Female', 'Other'];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, email, name, onClose }) => {
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [location, setLocation] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        console.log('Fetching markets from Firebase...');
        const marketsCollection = collection(db, 'markets');
        console.log('Markets collection reference:', marketsCollection);
        
        const marketsSnapshot = await getDocs(marketsCollection);
        console.log('Markets snapshot:', marketsSnapshot);
        console.log('Number of markets found:', marketsSnapshot.docs.length);
        
        const marketsData = marketsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Market document data:', doc.id, data);
          return {
            id: doc.id,
            name: data.name || doc.id
          };
        });
        
        console.log('Processed markets data:', marketsData);
        setMarkets(marketsData);
      } catch (error) {
        console.error('Error fetching markets:', error);
        // Add more detailed error information
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      } finally {
        setLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.replace(/\D/g, '').length !==10) {
      alert('Mobile number');
      return;
    }
    setLoading(true);
    try {
      const photoURL = auth.currentUser?.photoURL || '';
      await setDoc(doc(db, 'u', userId), {
        userId,
        email,
        name,
        photoURL, // Save Google photoURL
        userPhoneNumber: mobile,
        gender,
        lookingFor,
        location,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }, { merge: true });
      onClose();
    } catch (err) {
      alert('Failed to save info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-mobile">Mobile Number</label>
          <input
            id="onboard-mobile"
            type="tel"
            required
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter your mobile number"
            title="Mobile Number"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-gender">Gender</label>
          <select
            id="onboard-gender"
            required
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="input input-bordered w-full"
            title="Gender"
          >
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-lookingfor">Looking for</label>
          <select
            id="onboard-lookingfor"
            required
            value={lookingFor}
            onChange={e => setLookingFor(e.target.value)}
            className="input input-bordered w-full"
            title="Looking for"
          >
            <option value="">Select</option>
            {LOOKING_FOR.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-location">Location</label>
          <select
            id="onboard-location"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="input input-bordered w-full"
            title="Location"
            disabled={loadingMarkets}
          >
            <option value="">{loadingMarkets ? 'Loading locations...' : 'Select location'}</option>
            {markets.map(market => <option key={market.id} value={market.name}>{market.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          {/* Remove Skip button, only show Submit */}
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingModal;
