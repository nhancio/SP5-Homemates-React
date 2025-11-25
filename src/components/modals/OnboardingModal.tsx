import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { getMarkets } from '../../services/markets';
import * as Yup from 'yup';
import { X } from 'lucide-react';

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
  const [submitted, setSubmitted] = useState(false);
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

  function extractCityFromLocation(input: string): string {
    if (!input) return '';
    const parts = input.split(',');
    return parts[parts.length - 1].trim();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
      const { data: { session } } = await supabase.auth.getSession();
      const photoURL = session?.user?.user_metadata?.avatar_url || '';
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email,
          name,
          photo_url: photoURL,
          user_phone_number: mobile,
          gender,
          age: Number(age),
          profession,
          looking_for: lookingFor,
          preferences,
          city,
          locality,
          onboarding_complete: true,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        alert('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      onClose();
      // Instead of reloading, just refresh the user data
      // This prevents the infinite loading issue
      setTimeout(() => {
        // Trigger a re-check of auth state
        window.location.href = window.location.pathname;
      }, 300);
    } catch (err) {
      alert('Failed to save info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Light backdrop - allows home page to be visible */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      
      {/* Compact Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-pink-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content - Compact Grid Layout */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-2 gap-3">
            {/* Mobile Number - Full Width */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700">Mobile Number *</label>
              <input
                type="tel"
                value={mobile}
                onChange={e => { setMobile(e.target.value); if (mobileError) setMobileError(''); }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${mobileError ? ' border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="10-digit mobile"
              />
              {submitted && mobileError && (
                <p className="text-red-600 text-xs mt-1">{mobileError}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Gender *</label>
              <select
                value={gender}
                onChange={e => { setGender(e.target.value); if (genderError) setGenderError(''); }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${genderError ? ' border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {submitted && genderError && (
                <p className="text-red-600 text-xs mt-1">{genderError}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Age *</label>
              <input
                type="number"
                value={age}
                onChange={e => { setAge(e.target.value); if (ageError) setAgeError(''); }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${ageError ? ' border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="18+"
                min="18"
                max="100"
              />
              {submitted && ageError && (
                <p className="text-red-600 text-xs mt-1">{ageError}</p>
              )}
            </div>

            {/* Profession */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Profession *</label>
              <select
                value={profession}
                onChange={e => { setProfession(e.target.value); if (professionError) setProfessionError(''); }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${professionError ? ' border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">Select</option>
                {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {submitted && professionError && (
                <p className="text-red-600 text-xs mt-1">{professionError}</p>
              )}
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Looking For *</label>
              <select
                value={lookingFor}
                onChange={e => { setLookingFor(e.target.value); if (lookingForError) setLookingForError(''); }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${lookingForError ? ' border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">Select</option>
                {LOOKING_FOR.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {submitted && lookingForError && (
                <p className="text-red-600 text-xs mt-1">{lookingForError}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">City *</label>
              <select
                value={city}
                onChange={e => {
                  const val = e.target.value;
                  const extractedCity = extractCityFromLocation(val);
                  setCity(extractedCity);
                  setLocality('');
                  if (cityError) setCityError('');
                }}
                disabled={marketsLoading}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${cityError ? ' border-red-500 bg-red-50' : 'border-gray-300'} ${marketsLoading ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {submitted && cityError && (
                <p className="text-red-600 text-xs mt-1">{cityError}</p>
              )}
            </div>

            {/* Locality */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Locality *</label>
              <select
                value={locality}
                onChange={e => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const extractedCity = extractCityFromLocation(val);
                    setCity(extractedCity);
                    setLocality(val.split(',')[0].trim());
                  } else {
                    setLocality(val);
                  }
                  if (localityError) setLocalityError('');
                }}
                disabled={!city || marketsLoading}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${localityError ? ' border-red-500 bg-red-50' : 'border-gray-300'} ${!city || marketsLoading ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select Locality</option>
                {localities.map(market => (
                  <option key={market.id} value={market.market}>{market.market}</option>
                ))}
              </select>
              {submitted && localityError && (
                <p className="text-red-600 text-xs mt-1">{localityError}</p>
              )}
            </div>

            {/* Preferences - Full Width */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-700">Preferences *</label>
              <div className="flex flex-wrap gap-2">
                {PREFERENCES.map(pref => (
                  <label 
                    key={pref.id} 
                    className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg cursor-pointer text-xs transition-colors ${
                      preferences.includes(pref.id) 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.includes(pref.id)}
                      onChange={() => {
                        setPreferences(prev => prev.includes(pref.id)
                          ? prev.filter(p => p !== pref.id)
                          : [...prev, pref.id]);
                        if (preferencesError) setPreferencesError('');
                      }}
                      className="w-3 h-3 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span>{pref.label}</span>
                  </label>
                ))}
              </div>
              {submitted && preferencesError && (
                <p className="text-red-600 text-xs mt-1">{preferencesError}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-pink-600 rounded-lg hover:from-primary-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
