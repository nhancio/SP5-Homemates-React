import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { getMarkets } from '../../services/markets';
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

const PROFESSIONS = ['IT', 'Content Creation', 'Doctor', 'Student'];

const onboardingSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
  gender: Yup.string().required('Gender is required'),
  age: Yup.number().min(18, 'Age must be at least 18').max(100, 'Age must be less than 100').required('Age is required'),
  profession: Yup.string().required('Profession is required'),
  lookingFor: Yup.string().required('Looking for is required'),
  city: Yup.string().required('City is required'),
  locality: Yup.string().required('Locality is required'),
  preferences: Yup.array().min(1, 'Please select at least one preference').required('Preferences are required'),
});

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, email, name, onClose }) => {
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [markets, setMarkets] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [mobileError, setMobileError] = useState('');
  const [submitted, setSubmitted] = useState(false); // Set to false initially - only show errors on submit
  const [genderError, setGenderError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [professionError, setProfessionError] = useState('');
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

  // Add a helper to extract city from a string like 'Madhapur, Hyderabad'
  function extractCityFromLocation(input: string): string {
    if (!input) return '';
    const parts = input.split(',');
    return parts[parts.length - 1].trim();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Validate with Yup
    try {
      await onboardingSchema.validate({
        mobile,
        gender,
        age: Number(age),
        profession,
        lookingFor,
        city,
        locality,
        preferences,
      }, { abortEarly: false });
      setMobileError('');
      setGenderError('');
      setAgeError('');
      setProfessionError('');
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
        setAgeError(errorMap.age || '');
        setProfessionError(errorMap.profession || '');
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
        age: Number(age),
        profession,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Complete Your Profile</h2>
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-mobile">Mobile Number</label>
          <input
            id="onboard-mobile"
            type="tel"
            value={mobile}
            onChange={e => { setMobile(e.target.value); if (mobileError) setMobileError(''); }}
            className={`input w-full py-2 px-3 text-sm${mobileError ? ' border-red-500 bg-red-50' : ''}`}
            placeholder="Enter your mobile number"
            title="Mobile Number"
            spellCheck={false}
            autoCorrect="off"
          />
          {submitted && mobileError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {mobileError}
            </p>
          )}
        </div>
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-gender">Gender</label>
          <select
            id="onboard-gender"
            value={gender}
            onChange={e => { setGender(e.target.value); if (genderError) setGenderError(''); }}
            className={`input w-full py-2 px-3 text-sm${genderError ? ' border-red-500 bg-red-50' : ''}`}
            title="Gender"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {submitted && genderError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {genderError}
            </p>
          )}
        </div>
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-age">Age</label>
          <input
            id="onboard-age"
            type="number"
            value={age}
            onChange={e => { setAge(e.target.value); if (ageError) setAgeError(''); }}
            className={`input w-full py-2 px-3 text-sm${ageError ? ' border-red-500 bg-red-50' : ''}`}
            placeholder="Enter your age"
            title="Age"
            min="18"
            max="100"
            spellCheck={false}
            autoCorrect="off"
          />
          {submitted && ageError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {ageError}
            </p>
          )}
        </div>
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-profession">Profession</label>
          <select
            id="onboard-profession"
            value={profession}
            onChange={e => { setProfession(e.target.value); if (professionError) setProfessionError(''); }}
            className={`input w-full py-2 px-3 text-sm${professionError ? ' border-red-500 bg-red-50' : ''}`}
            title="Profession"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select Profession</option>
            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {submitted && professionError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {professionError}
            </p>
          )}
        </div>
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-lookingfor">Looking for</label>
          <select
            id="onboard-lookingfor"
            value={lookingFor}
            onChange={e => { setLookingFor(e.target.value); if (lookingForError) setLookingForError(''); }}
            className={`input w-full py-2 px-3 text-sm${lookingForError ? ' border-red-500 bg-red-50' : ''}`}
            title="Looking for"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select</option>
            {LOOKING_FOR.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {submitted && lookingForError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {lookingForError}
            </p>
          )}
        </div>
        {/* City Dropdown */}
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-city">City</label>
          <select
            id="onboard-city"
            value={city}
            onChange={e => {
              // If the value contains a comma, extract the city
              const val = e.target.value;
              const extractedCity = extractCityFromLocation(val);
              setCity(extractedCity);
              setLocality('');
              if (cityError) setCityError('');
            }}
            className={`input w-full py-2 px-3 text-sm${cityError ? ' border-red-500 bg-red-50' : ''}`}
            disabled={marketsLoading}
            title="City"
            spellCheck={true}
            autoCorrect="on"
          >
            <option value="">Select City</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {submitted && cityError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {cityError}
            </p>
          )}
        </div>
        {/* Locality Dropdown */}
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1" htmlFor="onboard-locality">Locality</label>
          <select
            id="onboard-locality"
            value={locality}
            onChange={e => {
              const val = e.target.value;
              // If the value contains a comma, extract city and set it
              if (val.includes(',')) {
                const extractedCity = extractCityFromLocation(val);
                setCity(extractedCity);
                setLocality(val.split(',')[0].trim());
              } else {
                setLocality(val);
              }
              if (localityError) setLocalityError('');
            }}
            className={`input w-full py-2 px-3 text-sm${localityError ? ' border-red-500 bg-red-50' : ''}`}
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
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {localityError}
            </p>
          )}
        </div>
        <div className="mb-2 sm:mb-3">
          <label className="block text-sm font-medium mb-1">Preferences</label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {PREFERENCES.map(pref => (
              <label key={pref.id} className={`flex items-center space-x-2 p-1.5 sm:p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm${preferences.includes(pref.id) ? ' border-primary-500 bg-primary-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.includes(pref.id)}
                  onChange={() => {
                    setPreferences(prev => prev.includes(pref.id)
                      ? prev.filter(p => p !== pref.id)
                      : [...prev, pref.id]);
                    if (preferencesError) setPreferencesError('');
                  }}
                  className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-primary-600"
                  spellCheck={true}
                  autoCorrect="on"
                />
                <span className="text-xs sm:text-sm">{pref.label}</span>
              </label>
            ))}
          </div>
          {submitted && preferencesError && (
            <p className="text-red-600 text-xs sm:text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 mt-1 w-full" aria-live="polite">
              {preferencesError}
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          {/* Remove Skip button, only show Submit */}
          <button type="submit" disabled={loading} className="px-3 py-2 sm:px-4 sm:py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm sm:text-base">
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingModal;
