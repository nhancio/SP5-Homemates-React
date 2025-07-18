import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { getMarkets, Market } from '../../services/markets';

interface OnboardingModalProps {
  userId: string;
  email: string;
  name: string;
  onClose: () => void;
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
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<Market[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);

  React.useEffect(() => {
    getMarkets().then((data) => {
      setMarkets(data);
      const uniqueCities = Array.from(new Set(data.map(m => m.city).filter(Boolean)));
      setCities(uniqueCities);
      setMarketsLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (city) {
      const selectedCity = city.trim().toLowerCase();
      const filteredMarkets = markets.filter(m => (m.city || '').trim().toLowerCase() === selectedCity);
      const uniqueLocalities = Array.from(new Set(filteredMarkets.map(m => m.market).filter(Boolean)));
      setLocalities(uniqueLocalities.map(locality => filteredMarkets.find(m => m.market === locality)!));
    } else {
      setLocalities([]);
    }
  }, [city, markets]);

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
        preferences,
        city,
        locality,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        onboardingComplete: true, // Mark onboarding as complete
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
        {/* City Dropdown */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-city">City</label>
          <select
            id="onboard-city"
            required
            value={city}
            onChange={e => { setCity(e.target.value); setLocality(''); }}
            className="input input-bordered w-full"
            disabled={marketsLoading}
            title="City"
          >
            <option value="">Select City</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Locality Dropdown */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-locality">Locality</label>
          <select
            id="onboard-locality"
            required
            value={locality}
            onChange={e => setLocality(e.target.value)}
            className="input input-bordered w-full"
            disabled={!city || marketsLoading}
            title="Locality"
          >
            <option value="">Select Locality</option>
            {localities.map(market => (
              <option key={market.id} value={market.market}>{market.market}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Preferences</label>
          <div className="flex flex-wrap gap-3">
            {PREFERENCES.map(pref => (
              <label key={pref.id} className={`flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50 ${preferences.includes(pref.id) ? 'border-primary-500 bg-primary-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.includes(pref.id)}
                  onChange={() => {
                    setPreferences(prev => prev.includes(pref.id)
                      ? prev.filter(p => p !== pref.id)
                      : [...prev, pref.id]);
                  }}
                  className="form-checkbox h-4 w-4 text-primary-600"
                />
                <span>{pref.label}</span>
              </label>
            ))}
          </div>
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
