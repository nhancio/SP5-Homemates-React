import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';

interface AddListingFormsProps {
  listingType: 'rent' | 'sell';
  formData: any;
  setFormData: (data: any) => void;
  images: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const AddressFields = ({ formData, setFormData }: AddListingFormsProps) => {
  const [locationInput, setLocationInput] = useState(formData.address.locality ? `${formData.address.locality}${formData.address.city ? ', ' + formData.address.city : ''}` : '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [detecting, setDetecting] = useState(false);

  // Nominatim autocomplete fetch
  const fetchSuggestions = async (input: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5`
    );
    const data = await res.json();
    return data.map((item: any) => ({
      display_name: item.display_name,
      city: item.address.city || item.address.town || item.address.village || '',
      locality: item.address.suburb || item.address.neighbourhood || item.address.village || item.address.town || '',
      place_id: item.place_id,
    }));
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    setFormData({
      ...formData,
      address: { ...formData.address, city: '', locality: '' }
    });
    if (value.length > 2) {
      setDetecting(true);
      const results = await fetchSuggestions(value);
      setSuggestions(results);
      setDetecting(false);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setLocationInput(suggestion.display_name);
    setSuggestions([]);
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        city: suggestion.city,
        locality: suggestion.locality || suggestion.city || '',
      },
    });
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <input
            type="text"
            placeholder="Location (Locality, City or Both)"
            className="input"
            value={locationInput}
            onChange={handleLocationChange}
            autoComplete="off"
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            onFocus={async () => {
              if (locationInput.length > 2) {
                setDetecting(true);
                const results = await fetchSuggestions(locationInput);
                setSuggestions(results);
                setDetecting(false);
              }
            }}
          />
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border border-gray-200 rounded shadow z-20 mt-1 w-full max-h-48 overflow-auto">
              {suggestions.map((s, i) => (
                <li
                  key={s.place_id}
                  className="px-4 py-2 cursor-pointer hover:bg-primary-50 text-sm"
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
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
};

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
      <AddressFields 
        formData={formData} 
        setFormData={setFormData}
        listingType="rent"
        images={images}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />
      <ContactNumberField 
        formData={formData} 
        setFormData={setFormData}
        listingType="rent"
        images={images}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />

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
              <option value="">Select Option</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Couple">Couple</option>
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

      {/* Move In Section for RentForm (Shared Homes) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Move In</h2>
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === true}
              onChange={() => setFormData({ ...formData, isImmediate: true, handoverDate: '' })}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === false}
              onChange={() => setFormData({ ...formData, isImmediate: false })}
            />
            Specific Date
          </label>
        </div>
        {formData.isImmediate === false && (
          <>
            <input
              type="date"
              className="input w-full mb-1"
              placeholder="dd-mm-yyyy"
              value={formData.handoverDate}
              onChange={e => setFormData({ ...formData, handoverDate: e.target.value })}
            />
            <span className="text-xs text-gray-500">Select your move-in date.</span>
          </>
        )}
      </section>

      {/* Amenities Section for RentForm (Shared Homes) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Amenities</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Appliances</h3>
          <div className="flex flex-wrap gap-3">
            {['TV', 'Fridge', 'AC', 'Washing Machine', 'Water Purifier', 'Geyser'].map(appliance => (
              <label key={appliance} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={Array.isArray(formData.rentDetails.amenities?.appliances) && formData.rentDetails.amenities.appliances.includes(appliance)}
                  onChange={() => {
                    const appliances = formData.rentDetails.amenities?.appliances || [];
                    setFormData({
                      ...formData,
                      rentDetails: {
                        ...formData.rentDetails,
                        amenities: {
                          ...formData.rentDetails.amenities,
                          appliances: appliances.includes(appliance)
                            ? appliances.filter((a: string) => a !== appliance)
                            : [...appliances, appliance],
                          furniture: formData.rentDetails.amenities?.furniture || [],
                          building: formData.rentDetails.amenities?.building || [],
                        }
                      }
                    });
                  }}
                />
                <span className="ml-2">{appliance}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Furniture</h3>
          <div className="flex flex-wrap gap-3">
            {['Bed', 'Wardrobe', 'Study Table', 'Dining Table', 'Sofa', 'Mattress'].map(furniture => (
              <label key={furniture} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={Array.isArray(formData.rentDetails.amenities?.furniture) && formData.rentDetails.amenities.furniture.includes(furniture)}
                  onChange={() => {
                    const furnitureArr = formData.rentDetails.amenities?.furniture || [];
                    setFormData({
                      ...formData,
                      rentDetails: {
                        ...formData.rentDetails,
                        amenities: {
                          ...formData.rentDetails.amenities,
                          furniture: furnitureArr.includes(furniture)
                            ? furnitureArr.filter((a: string) => a !== furniture)
                            : [...furnitureArr, furniture],
                          appliances: formData.rentDetails.amenities?.appliances || [],
                          building: formData.rentDetails.amenities?.building || [],
                        }
                      }
                    });
                  }}
                />
                <span className="ml-2">{furniture}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Building</h3>
          <div className="flex flex-wrap gap-3">
            {['Lift', 'Power Backup', 'Security', 'Parking', 'Gym', 'Swimming Pool', 'Garden', 'CCTV'].map(building => (
              <label key={building} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={Array.isArray(formData.rentDetails.amenities?.building) && formData.rentDetails.amenities.building.includes(building)}
                  onChange={() => {
                    const buildingArr = formData.rentDetails.amenities?.building || [];
                    setFormData({
                      ...formData,
                      rentDetails: {
                        ...formData.rentDetails,
                        amenities: {
                          ...formData.rentDetails.amenities,
                          building: buildingArr.includes(building)
                            ? buildingArr.filter((a: string) => a !== building)
                            : [...buildingArr, building],
                          appliances: formData.rentDetails.amenities?.appliances || [],
                          furniture: formData.rentDetails.amenities?.furniture || [],
                        }
                      }
                    });
                  }}
                />
                <span className="ml-2">{building}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Details Section for RentForm (Shared Homes) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Rental Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter rent"
              min={0}
              value={formData.rentDetails.costs.rent || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    rent: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter maintenance amount"
              value={formData.rentDetails.costs.maintenance || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    maintenance: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter security deposit"
              value={formData.rentDetails.costs.securityDeposit || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    securityDeposit: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setup Cost (₹)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter setup cost"
              value={formData.rentDetails.costs.setupCost || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    setupCost: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage (₹)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter brokerage amount"
              value={formData.rentDetails.costs.brokerage || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  costs: {
                    ...formData.rentDetails.costs,
                    brokerage: e.target.value
                  }
                }
              })}
            />
          </div>
        </div>
      </section>

      {/* Additional Bills Section for RentForm (Shared Homes) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Additional Bills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wifi (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter wifi bill"
              value={formData.rentDetails.additionalBills.wifi || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  additionalBills: {
                    ...formData.rentDetails.additionalBills,
                    wifi: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter water bill"
              value={formData.rentDetails.additionalBills.water || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  additionalBills: {
                    ...formData.rentDetails.additionalBills,
                    water: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gas (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter gas bill"
              value={formData.rentDetails.additionalBills.gas || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  additionalBills: {
                    ...formData.rentDetails.additionalBills,
                    gas: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cook (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter cook bill"
              value={formData.rentDetails.additionalBills.cook || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  additionalBills: {
                    ...formData.rentDetails.additionalBills,
                    cook: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maid (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter maid bill"
              value={formData.rentDetails.additionalBills.maid || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  additionalBills: {
                    ...formData.rentDetails.additionalBills,
                    maid: e.target.value
                  }
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other bills (₹/month)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter other bills"
              value={formData.rentDetails.additionalBills.others || ''}
              onChange={e => setFormData({
                ...formData,
                rentDetails: {
                  ...formData.rentDetails,
                  additionalBills: {
                    ...formData.rentDetails.additionalBills,
                    others: e.target.value
                  }
                }
              })}
            />
          </div>
        </div>
      </section>

      {/* Upload Images Section (modern, user-friendly) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Upload Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2">
          {images.map((image, index) => (
            <div key={index} className="relative rounded-lg shadow hover:shadow-lg transition overflow-hidden group bg-gray-50">
              <img src={image} alt={`Property ${index + 1}`} className="w-full h-24 sm:h-28 object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
                title="Remove Image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-24 sm:h-28 rounded-lg border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 bg-primary-50 text-primary-600 font-medium shadow group transition">
              <Camera className="h-7 w-7 mb-1 group-hover:text-primary-700" />
              <span className="text-xs">Add Photo</span>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          {images.length}/5 images uploaded
          {images.length >= 5 && <span className="text-red-500">(Maximum reached)</span>}
        </div>
        <div className="text-xs text-gray-400 mt-1">Tip: Add clear, well-lit photos for better responses.</div>
      </section>
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
  return (
    <>
      <AddressFields 
        formData={formData} 
        setFormData={setFormData}
        listingType="sell"
        images={images}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />
      <ContactNumberField 
        formData={formData} 
        setFormData={setFormData}
        listingType="sell"
        images={images}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />

      {/* Property Type (BHK Selection) */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Property Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-2">
          {['1RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, propertyType: type })}
              className={`p-3 rounded-full border-2 transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-sm ${
                formData.propertyType === type 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Details (remove Availability) */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Type</label>
            <select
              className="input w-full focus:ring-2 focus:ring-primary-300"
              value={formData.furnishingType || ''}
              onChange={e => setFormData({
                ...formData,
                furnishingType: e.target.value
              })}
            >
              <option value="">Select Furnishing Type</option>
              <option value="fully">Fully Furnished</option>
              <option value="semi">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
            <select
              className="input w-full focus:ring-2 focus:ring-primary-300"
              value={formData.parking || ''}
              onChange={e => setFormData({
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
        </div>
      </section>

      {/* Amenities Section (moved above Move In) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Amenities</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Appliances</h3>
          <div className="flex flex-wrap gap-3">
            {['TV', 'Fridge', 'AC', 'Washing Machine', 'Water Purifier', 'Geyser'].map(appliance => (
              <label key={appliance} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={Array.isArray(formData.amenities?.appliances) && formData.amenities.appliances.includes(appliance)}
                  onChange={() => {
                    const appliances = formData.amenities?.appliances || [];
                    setFormData({
                      ...formData,
                      amenities: {
                        ...formData.amenities,
                        appliances: appliances.includes(appliance)
                          ? appliances.filter((a: string) => a !== appliance)
                          : [...appliances, appliance],
                        furniture: formData.amenities?.furniture || [],
                        building: formData.amenities?.building || [],
                      }
                    });
                  }}
                />
                <span className="ml-2">{appliance}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Furniture</h3>
          <div className="flex flex-wrap gap-3">
            {['Bed', 'Wardrobe', 'Study Table', 'Dining Table', 'Sofa', 'Mattress'].map(furniture => (
              <label key={furniture} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={Array.isArray(formData.amenities?.furniture) && formData.amenities.furniture.includes(furniture)}
                  onChange={() => {
                    const furnitureArr = formData.amenities?.furniture || [];
                    setFormData({
                      ...formData,
                      amenities: {
                        ...formData.amenities,
                        furniture: furnitureArr.includes(furniture)
                          ? furnitureArr.filter((a: string) => a !== furniture)
                          : [...furnitureArr, furniture],
                        appliances: formData.amenities?.appliances || [],
                        building: formData.amenities?.building || [],
                      }
                    });
                  }}
                />
                <span className="ml-2">{furniture}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Building</h3>
          <div className="flex flex-wrap gap-3">
            {['Lift', 'Power Backup', 'Security', 'Parking', 'Gym', 'Swimming Pool', 'Garden', 'CCTV'].map(building => (
              <label key={building} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={Array.isArray(formData.amenities?.building) && formData.amenities.building.includes(building)}
                  onChange={() => {
                    const buildingArr = formData.amenities?.building || [];
                    setFormData({
                      ...formData,
                      amenities: {
                        ...formData.amenities,
                        building: buildingArr.includes(building)
                          ? buildingArr.filter((a: string) => a !== building)
                          : [...buildingArr, building],
                        appliances: formData.amenities?.appliances || [],
                        furniture: formData.amenities?.furniture || [],
                      }
                    });
                  }}
                />
                <span className="ml-2">{building}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Move In Section (for both RentForm and SellForm) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Move In</h2>
        <div className="flex items-center gap-8 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === true}
              onChange={() => setFormData({ ...formData, isImmediate: true, handoverDate: '' })}
            />
            Immediate
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="moveInOption"
              checked={formData.isImmediate === false}
              onChange={() => setFormData({ ...formData, isImmediate: false })}
            />
            Specific Date
          </label>
        </div>
        {formData.isImmediate === false && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="date"
              className="input w-full"
              placeholder="dd-mm-yyyy"
              value={formData.handoverDate}
              onChange={e => setFormData({ ...formData, handoverDate: e.target.value })}
            />
            <span className="text-xs text-gray-500">Select your move-in date.</span>
          </div>
        )}
      </section>

      {/* Price Details Section */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Price Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter rent"
              value={formData.sellDetails?.rent || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  rent: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter maintenance"
              value={formData.sellDetails?.maintenance || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  maintenance: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter security deposit"
              value={formData.sellDetails?.securityDeposit || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  securityDeposit: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
            <input
              type="number"
              className="input w-full focus:ring-2 focus:ring-primary-300"
              placeholder="Enter brokerage"
              value={formData.sellDetails?.brokerage || ''}
              onChange={e => setFormData({
                ...formData,
                sellDetails: {
                  ...formData.sellDetails,
                  brokerage: e.target.value
                }
              })}
            />
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-6 bg-gray-50 p-2 rounded">Description</h2>
        <textarea
          className="input min-h-[100px] focus:ring-2 focus:ring-primary-300"
          placeholder="Add property description..."
          value={formData.description}
          onChange={e => setFormData({
            ...formData,
            description: e.target.value
          })}
        />
      </section>

      {/* Upload Images Section (modern, user-friendly) */}
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 bg-gray-50 p-2 rounded">Upload Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2">
          {images.map((image, index) => (
            <div key={index} className="relative rounded-lg shadow hover:shadow-lg transition overflow-hidden group bg-gray-50">
              <img src={image} alt={`Property ${index + 1}`} className="w-full h-24 sm:h-28 object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
                title="Remove Image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-24 sm:h-28 rounded-lg border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 bg-primary-50 text-primary-600 font-medium shadow group transition">
              <Camera className="h-7 w-7 mb-1 group-hover:text-primary-700" />
              <span className="text-xs">Add Photo</span>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          {images.length}/5 images uploaded
          {images.length >= 5 && <span className="text-red-500">(Maximum reached)</span>}
        </div>
        <div className="text-xs text-gray-400 mt-1">Tip: Add clear, well-lit photos for better responses.</div>
      </section>
    </>
  );
};