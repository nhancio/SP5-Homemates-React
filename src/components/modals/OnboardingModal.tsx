import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
  'Room', 'Flat', 'Homemate', 'Buy'
];

const GENDERS = ['Male', 'Female', 'Other'];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, email, name, onClose }) => {
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const OCCUPATIONS = ['IT', 'Creator', 'Doctor', 'Student', 'Other'];
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePrefChange = (id: string) => {
    setPreferences(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'u', userId), {
        userId,
        email,
        name,
        userPhoneNumber: mobile,
        gender,
        lookingFor,
        preferredLocation: location,
        occupation,
        preferences,
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
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-location">Preferred Location</label>
          <input
            id="onboard-location"
            type="text"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter preferred location"
            title="Preferred Location"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-occupation">Profession</label>
          <select
            id="onboard-occupation"
            required
            value={occupation}
            onChange={e => setOccupation(e.target.value)}
            className="input input-bordered w-full"
            title="Profession"
          >
            <option value="">Select</option>
            {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Preferences</label>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES.map(pref => (
              <label key={pref.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={preferences.includes(pref.id)}
                  onChange={() => handlePrefChange(pref.id)}
                />
                {pref.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Skip</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingModal;
