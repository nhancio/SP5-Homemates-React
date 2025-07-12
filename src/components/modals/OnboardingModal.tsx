import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

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
  'Room', 'Flat', 'Homemate', 'Friends', 'Services', 'Post a Property'
];

const GENDERS = ['Male', 'Female', 'Other'];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, email, name, onClose }) => {
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [loading, setLoading] = useState(false);

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
