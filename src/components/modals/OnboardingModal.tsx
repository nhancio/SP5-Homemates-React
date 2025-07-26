import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { getMarkets, Market } from '../../services/markets';
import * as Yup from 'yup';

interface OnboardingModalProps {
  userId: string;
  email: string;
  name: string;
  onClose: () => void;
}

const PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'nonSmoker', label: 'Non-smoker' },
  { id: 'nonDrinker', label: 'Non-drinker' },
  { id: 'morningPerson', label: 'Morning person' },
  { id: 'partyOwl', label: 'Party owl' },
];

const LOOKING_FOR = [
  'Room', 'Flat', 'Homemate'
];

const GENDERS = ['Male', 'Female', 'Other'];

const onboardingSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
  gender: Yup.string().required('Gender is required'),
  lookingFor: Yup.string().required('Looking for is required'),
  city: Yup.string().required('City is required'),
  locality: Yup.string().required('Locality is required'),
  preferences: Yup.array().min(1, 'Please select at least one preference').required('Preferences are required'),
});

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
  const [mobileError, setMobileError] = useState('');
  const [submitted, setSubmitted] = useState(false); // Set to false initially - only show errors on submit
  const [genderError, setGenderError] = useState('');
  const [lookingForError, setLookingForError] = useState('');
  const [cityError, setCityError] = useState('');
  const [localityError, setLocalityError] = useState('');
  const [preferencesError, setPreferencesError] = useState('');

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
    setSubmitted(true);
    // Validate with Yup
    try {
      await onboardingSchema.validate({
        mobile,
        gender,
        lookingFor,
        city,
        locality,
        preferences,
      }, { abortEarly: false });
      setMobileError('');
      setGenderError('');
      setLookingForError('');
      setCityError('');
      setLocalityError('');
      setPreferencesError('');
    } catch (err: any) {
      if (err.inner && err.inner.length > 0) {
        const errorMap: any = {};
        err.inner.forEach((e: any) => {
          if (e.path && e.message) errorMap[e.path] = e.message;
        });
        setMobileError(errorMap.mobile || '');
        setGenderError(errorMap.gender || '');
        setLookingForError(errorMap.lookingFor || '');
        setCityError(errorMap.city || '');
        setLocalityError(errorMap.locality || '');
        setPreferencesError(errorMap.preferences || '');
      } else if (err.message) {
        setMobileError(err.message);
      }
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

      // Confirm onboardingComplete is set
      const userDoc = await getDoc(doc(db, 'u', userId));
      if (userDoc.exists() && userDoc.data().onboardingComplete === true) {
        window.location.reload();
      } else {
        alert('Something went wrong: onboardingComplete was not set. Please try again.');
      }
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
            value={mobile}
            onChange={e => { setMobile(e.target.value); if (mobileError) setMobileError(''); }}
            className={`input w-full${mobileError ? ' border-red-500 bg-red-50' : ''}`}
            placeholder="Enter your mobile number"
            title="Mobile Number"
            spellCheck={false}
            autoCorrect="off"
          />
          {submitted && mobileError && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {mobileError}
            </p>
          )}
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-gender">Gender</label>
          <select
            id="onboard-gender"
            value={gender}
            onChange={e => { setGender(e.target.value); if (genderError) setGenderError(''); }}
            className={`input w-full${genderError ? ' border-red-500 bg-red-50' : ''}`}
            title="Gender"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {submitted && genderError && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {genderError}
            </p>
          )}
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-lookingfor">Looking for</label>
          <select
            id="onboard-lookingfor"
            value={lookingFor}
            onChange={e => { setLookingFor(e.target.value); if (lookingForError) setLookingForError(''); }}
            className={`input w-full${lookingForError ? ' border-red-500 bg-red-50' : ''}`}
            title="Looking for"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select</option>
            {LOOKING_FOR.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {submitted && lookingForError && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {lookingForError}
            </p>
          )}
        </div>
        {/* City Dropdown */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-city">City</label>
          <select
            id="onboard-city"
            value={city}
            onChange={e => { setCity(e.target.value); setLocality(''); if (cityError) setCityError(''); }}
            className={`input w-full${cityError ? ' border-red-500 bg-red-50' : ''}`}
            disabled={marketsLoading}
            title="City"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select City</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {submitted && cityError && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {cityError}
            </p>
          )}
        </div>
        {/* Locality Dropdown */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-locality">Locality</label>
          <select
            id="onboard-locality"
            value={locality}
            onChange={e => { setLocality(e.target.value); if (localityError) setLocalityError(''); }}
            className={`input w-full${localityError ? ' border-red-500 bg-red-50' : ''}`}
            disabled={!city || marketsLoading}
            title="Locality"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select Locality</option>
            {localities.map(market => (
              <option key={market.id} value={market.market}>{market.market}</option>
            ))}
          </select>
          {submitted && localityError && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {localityError}
            </p>
          )}
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
                    if (preferencesError) setPreferencesError('');
                  }}
                  className="form-checkbox h-4 w-4 text-primary-600"
                  spellCheck={true}
                  autoCorrect="on"
                />
                <span>{pref.label}</span>
              </label>
            ))}
          </div>
          {submitted && preferencesError && (
            <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {preferencesError}
            </p>
          )}
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
