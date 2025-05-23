import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { USER_PREFERENCES } from '../../constants/theme';

const defaultPreferences = USER_PREFERENCES.map(pref => pref.id);

interface PreferencesModalProps {
  onClose: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const togglePreference = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Here you would typically save the preferences to your backend/database
    console.log('Selected preferences:', selected);
    onClose();
    navigate('/profile');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Select Your Preferences</h2>
        <p className="text-gray-600 mb-6">Choose the options that best describe you</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {USER_PREFERENCES.map(pref => {
            const IconComponent = Icons[pref.icon as keyof typeof Icons];
            const isSelected = selected.includes(pref.id);

            return (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-[#C2185B] bg-[#C2185B] bg-opacity-10' 
                    : 'border-gray-200 hover:border-[#C2185B]'
                }`}
              >
                <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                  isSelected ? 'text-[#C2185B]' : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-[#C2185B]' : 'text-gray-700'
                }`}>
                  {pref.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#C2185B] text-white rounded-md hover:bg-[#C2185B]/90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
