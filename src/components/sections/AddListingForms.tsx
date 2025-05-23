import React from 'react';
import { Camera, X } from 'lucide-react';

interface AddListingFormsProps {
  listingType: 'rent' | 'sell';
  formData: any;
  setFormData: (data: any) => void;
  images: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

// Create a shared address fields component
const AddressFields = ({ formData, setFormData }: AddListingFormsProps) => (
  <section className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-4">Address</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        type="text"
        placeholder="City"
        className="input"
        value={formData.address.city}
        onChange={(e) => setFormData({
          ...formData,
          address: { ...formData.address, city: e.target.value }
        })}
      />
      <input
        type="text"
        placeholder="Locality"
        className="input"
        value={formData.address.locality}
        onChange={(e) => setFormData({
          ...formData,
          address: { ...formData.address, locality: e.target.value }
        })}
      />
      <input
        type="text"
        placeholder="Building Name"
        className="input"
        value={formData.address.buildingName}
        onChange={(e) => setFormData({
          ...formData,
          address: { ...formData.address, buildingName: e.target.value }
        })}
      />
    </div>
  </section>
);

const ContactNumberField = ({ formData, setFormData }: AddListingFormsProps) => (
  <section className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number*</label>
      <input
        type="tel"
        className="input"
        placeholder="Enter your 10-digit mobile number"
        value={formData.contactNumber || ''}
        onChange={(e) => setFormData({
          ...formData,
          contactNumber: e.target.value
        })}
        pattern="[0-9]{10}"
        maxLength={10}
        required
      />
      <p className="text-xs text-gray-500 mt-1">This number will be displayed to interested users</p>
    </div>
  </section>
);

export const RentForm: React.FC<AddListingFormsProps> = ({
  formData,
  setFormData,
  images,
  handleImageUpload,
  removeImage
}) => {
  return (
    <>
      <AddressFields formData={formData} setFormData={setFormData} />
      <ContactNumberField formData={formData} setFormData={setFormData} />

      {/* Property Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        {/* BHK Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {['1RK','1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, propertyType: type })}
              className={`p-3 rounded-full border-2 ${
                formData.propertyType === type 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select 
              className="input"
              value={formData.furnishingType}
              onChange={(e) => setFormData({
                ...formData,
                furnishingType: e.target.value
              })}
            >
              <option value="">Select Furnishing</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
            <input
              type="number"
              className="input"
              value={formData.rentDetails.roomDetails.availableRooms}
              onChange={(e) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    availableRooms: Number(e.target.value)
                  }
                }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select 
              className="input"
              value={formData.rentDetails.roomDetails.roomType}
              onChange={(e) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    roomType: e.target.value
                  }
                }
              })}
            >
              <option value="">Select Room Type</option>
              <option value="shared">Shared</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bathroom Type</label>
            <select
              className="input"
              value={formData.rentDetails.roomDetails.bathroomType}
              onChange={(e) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  roomDetails: {
                    ...formData.rentDetails.roomDetails,
                    bathroomType: e.target.value
                  }
                }
              })}
            >
              <option value="">Select Bathroom Type</option>
              <option value="attached">Attached</option>
              <option value="common">Common</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select 
              className="input"
              value={formData.parking}
              onChange={(e) => setFormData({
                ...formData,
                parking: e.target.value
              })}
            >
              <option value="">Select Parking Type</option>
              <option value="car">Car Parking</option>
              <option value="bike">Bike Parking</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select 
              className="input"
              value={formData.buildingType}
              onChange={(e) => setFormData({
                ...formData,
                buildingType: e.target.value
              })}
            >
              <option value="">Select Property Type</option>
              <option value="gated">Gated Community</option>
              <option value="standalone">Standalone</option>
              <option value="individual">Individual House</option>
              <option value="villa">Villa</option>
            </select>
          </div>
        </div>
      </section>

      {/* Preferred Tenant Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Preferred Tenant</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
            <select 
              className="input"
              value={formData.rentDetails.preferredTenant.lookingFor}
              onChange={(e) => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  preferredTenant: {
                    ...formData.rentDetails.preferredTenant,
                    lookingFor: e.target.value
                  }
                }
              })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
            <div className="flex flex-wrap gap-3">
              {['Vegetarian', 'Non-smoker', 'Non-alcoholic', 'Pet friendly', 'Party Friendly', 'Night owl'].map(pref => (
                <label key={pref} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-primary-600"
                    checked={formData.rentDetails.preferredTenant.preferences.includes(pref)}
                    onChange={() => {
                      const preferences = formData.rentDetails.preferredTenant.preferences;
                      setFormData({
                        ...formData,
                        rentDetails: {
                          ...formData.rentDetails,
                          preferredTenant: {
                            ...formData.rentDetails.preferredTenant,
                            preferences: preferences.includes(pref)
                              ? preferences.filter((p: string) => p !== pref)
                              : [...preferences, pref]
                          }
                        }
                      });
                    }}
                  />
                  <span className="ml-2">{pref}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ...rest of the rent form sections... */}
    </>
  );
};

export const SellForm: React.FC<AddListingFormsProps> = ({
  formData,
  setFormData,
  images,
  handleImageUpload,
  removeImage
}) => {
  const DIRECTIONS = ['East', 'West', 'North', 'South', 'North-East', 'North-West'];
  
  return (
    <>
      <AddressFields formData={formData} setFormData={setFormData} />
      <ContactNumberField formData={formData} setFormData={setFormData} />

      {/* Property Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        {/* BHK Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {['1RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, propertyType: type })}
              className={`p-3 rounded-full border-2 ${
                formData.propertyType === type 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnish Type</label>
            <select 
              className="input"
              value={formData.furnishingType}
              onChange={(e) => setFormData({
                ...formData,
                furnishingType: e.target.value
              })}
            >
              <option value="">Select Furnishing</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select 
              className="input"
              value={formData.parking}
              onChange={(e) => setFormData({
                ...formData,
                parking: e.target.value
              })}
            >
              <option value="">Select Parking Type</option>
              <option value="car">Car Parking</option>
              <option value="bike">Bike Parking</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Built Up Area (Sq.ft)</label>
            <input
              type="number"
              className="input"
              value={formData.sellDetails.sqft}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sellDetails: { ...prev.sellDetails, sqft: Number(e.target.value) }
              }))}
              placeholder="Enter area in square feet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
            <select 
              className="input"
              value={formData.sellDetails.direction}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sellDetails: { ...prev.sellDetails, direction: e.target.value }
              }))}
            >
              <option value="">Select Direction</option>
              {DIRECTIONS.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ...rest of the sell form sections... */}
    </>
  );
};