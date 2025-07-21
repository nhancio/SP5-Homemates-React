import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, MapPin, Calendar, X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { updateListing } from '../services/listings';
import { AddressFields, RentForm, SellForm } from '../components/sections/AddListingForms';

const EditListingPage = () => {
  const { isAuthenticated, user } = useAppContext();
  const navigate = useNavigate();
  const { listingType, listingId } = useParams();
  const location = useLocation();
  const existingListing = location.state?.listing;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  
  // Image handling state
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
      return;
    }

    if (!existingListing) {
      alert('No listing data found. Please go back to your profile.');
      navigate('/profile');
      return;
    }
    
    window.scrollTo(0, 0);
    document.title = 'Edit Listing | Homemates';

    // Initialize form data with existing listing
    setFormData({
      // Common fields
      address: {
        city: existingListing.address?.city || '',
        locality: existingListing.address?.locality || '',
        buildingName: existingListing.address?.buildingName || '',
      },
      propertyType: existingListing.propertyType || '',
      furnishingType: existingListing.furnishingType || '',
      parking: existingListing.parking || '',
      buildingType: existingListing.buildingType || '',
      handoverDate: existingListing.handoverDate || '',
      isImmediate: existingListing.isImmediate || false,
      description: existingListing.description || '',
      contactNumber: existingListing.contactNumber || '',

      // Rent specific fields
      rentDetails: {
        preferredTenant: {
          lookingFor: existingListing.rentDetails?.preferredTenant?.lookingFor || '',
          preferences: existingListing.rentDetails?.preferredTenant?.preferences || [],
        },
        roomDetails: {
          availableRooms: existingListing.rentDetails?.roomDetails?.availableRooms || '',
          availability: existingListing.rentDetails?.roomDetails?.availability || '',
          bathroomType: existingListing.rentDetails?.roomDetails?.bathroomType || '',
        },
        amenities: existingListing.rentDetails?.amenities || [],
        costs: {
          rent: existingListing.rentDetails?.costs?.rent || '',
          maintenance: existingListing.rentDetails?.costs?.maintenance || '',
          securityDeposit: existingListing.rentDetails?.costs?.securityDeposit || '',
          setupCost: existingListing.rentDetails?.costs?.setupCost || '',
          brokerage: existingListing.rentDetails?.costs?.brokerage || '',
        },
        additionalBills: {
          wifi: existingListing.rentDetails?.additionalBills?.wifi || '',
          water: existingListing.rentDetails?.additionalBills?.water || '',
          gas: existingListing.rentDetails?.additionalBills?.gas || '',
          cook: existingListing.rentDetails?.additionalBills?.cook || '',
          maid: existingListing.rentDetails?.additionalBills?.maid || '',
          others: existingListing.rentDetails?.additionalBills?.others || '',
        }
      },

      // Sell specific fields
      sellDetails: {
        price: existingListing.sellDetails?.price || '',
        gst: existingListing.sellDetails?.gst || '',
        sqft: existingListing.sellDetails?.sqft || '',
        direction: existingListing.sellDetails?.direction || '',
        isNegotiable: existingListing.sellDetails?.isNegotiable || false,
        propertyType: existingListing.sellDetails?.propertyType || '',
        ownership: existingListing.sellDetails?.ownership || '',
        ageOfProperty: existingListing.sellDetails?.ageOfProperty || '',
        totalFloors: existingListing.sellDetails?.totalFloors || '',
        floorNumber: existingListing.sellDetails?.floorNumber || '',
        waterSupply: existingListing.sellDetails?.waterSupply || '',
        approvals: existingListing.sellDetails?.approvals || [],
        amenities: existingListing.sellDetails?.amenities || [],
        highlights: existingListing.sellDetails?.highlights || [],
        description: existingListing.sellDetails?.description || '',
        propertyId: existingListing.sellDetails?.propertyId || '',
        loanOnProperty: existingListing.sellDetails?.loanOnProperty || false
      },
      builtUpArea: existingListing.builtUpArea || '',
      ageOfProperty: existingListing.ageOfProperty || '',
    });

    // Set images
    setImages(existingListing.images || []);
  }, [isAuthenticated, navigate, existingListing]);

  const validate = () => {
    const newErrors: any = {};
    // Mobile validation
    const mobile = formData.contactNumber || '';
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      newErrors.contactNumber = 'Please enter a valid mobile number.';
    }
    // Rent validation
    if (listingType === 'rent') {
      const rent = Number(formData.rentDetails?.costs?.rent);
      if (!rent || rent < 1000) {
        newErrors.rent = 'Rent must be at least ₹1,000.';
      }
      // Numeric fields non-negative
      ['maintenance', 'securityDeposit', 'setupCost', 'brokerage'].forEach(field => {
        const value = Number(formData.rentDetails?.costs?.[field]);
        if (value < 0) newErrors[field] = 'Cannot be negative.';
      });
    }
    // Price validation
    if (listingType === 'sell') {
      const price = Number(formData.sellDetails?.price);
      if (!price || price < 1000) {
        newErrors.price = 'Price must be at least ₹1,000.';
      }
      // Numeric fields non-negative
      ['maintenance', 'securityDeposit', 'brokerage'].forEach(field => {
        const value = Number(formData.sellDetails?.[field]);
        if (value < 0) newErrors[field] = 'Cannot be negative.';
      });
    }
    // Required fields
    if (!formData.address.city) newErrors.city = 'City is required.';
    if (!formData.address.locality) newErrors.locality = 'Locality is required.';
    if (!formData.address.buildingName) newErrors.buildingName = 'Building name is required.';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required.';
    if (!formData.description || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters.';
    if (!images || images.length === 0) newErrors.images = 'Please upload at least one image.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listingId || !listingType) {
      alert('Missing required data');
      return;
    }
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Updating listing type:', listingType);

      if (listingType === 'rent') {
        // Validate rent-specific fields
        if (!formData.rentDetails.costs.rent) {
          throw new Error('Please enter rental cost');
        }
        
        // Construct rent listing update data
        const rentListingData = {
          // Common fields
          address: {
            city: formData.address.city,
            locality: formData.address.locality,
            buildingName: formData.address.buildingName,
          },
          propertyType: formData.propertyType,
          furnishingType: formData.furnishingType,
          parking: formData.parking,
          buildingType: formData.buildingType,
          handoverDate: formData.handoverDate,
          isImmediate: formData.isImmediate,
          description: formData.description,
          contactNumber: formData.contactNumber,
          images,
          
          // Rent-specific fields
          rentDetails: {
            preferredTenant: {
              lookingFor: formData.rentDetails.preferredTenant.lookingFor,
              preferences: formData.rentDetails.preferredTenant.preferences,
            },
            roomDetails: {
              availableRooms: formData.rentDetails.roomDetails.availableRooms,
              availability: formData.rentDetails.roomDetails.availability,
              bathroomType: formData.rentDetails.roomDetails.bathroomType,
            },
            amenities: formData.rentDetails.amenities,
            costs: {
              rent: Number(formData.rentDetails.costs.rent) || 0,
              maintenance: Number(formData.rentDetails.costs.maintenance) || 0,
              securityDeposit: Number(formData.rentDetails.costs.securityDeposit) || 0,
              setupCost: Number(formData.rentDetails.costs.setupCost) || 0,
              brokerage: Number(formData.rentDetails.costs.brokerage) || 0,
            },
            additionalBills: {
              wifi: Number(formData.rentDetails.additionalBills.wifi) || 0,
              water: Number(formData.rentDetails.additionalBills.water) || 0,
              gas: Number(formData.rentDetails.additionalBills.gas) || 0,
              cook: Number(formData.rentDetails.additionalBills.cook) || 0,
              maid: Number(formData.rentDetails.additionalBills.maid) || 0,
              others: Number(formData.rentDetails.additionalBills.others) || 0,
            }
          }
        };

        await updateListing('rent', listingId, rentListingData);
      } else if (listingType === 'sell') {
        // Validate sell-specific fields
        if (!formData.sellDetails.price) {
          throw new Error('Please enter property price');
        }
        
        // Construct sell listing update data
        const sellListingData = {
          // Common fields
          address: {
            city: formData.address.city,
            locality: formData.address.locality,
            buildingName: formData.address.buildingName,
          },
          propertyType: formData.propertyType,
          furnishingType: formData.furnishingType,
          parking: formData.parking,
          buildingType: formData.buildingType,
          handoverDate: formData.handoverDate,
          isImmediate: formData.isImmediate,
          description: formData.description,
          contactNumber: formData.contactNumber,
          images,
          
          // Sell-specific fields
          sellDetails: {
            price: Number(formData.sellDetails.price) || 0,
            gst: Number(formData.sellDetails.gst) || 0,
            sqft: Number(formData.sellDetails.sqft) || 0,
            direction: formData.sellDetails.direction,
            isNegotiable: formData.sellDetails.isNegotiable,
            propertyType: formData.sellDetails.propertyType,
            ownership: formData.sellDetails.ownership,
            ageOfProperty: formData.sellDetails.ageOfProperty,
            totalFloors: formData.sellDetails.totalFloors,
            floorNumber: formData.sellDetails.floorNumber,
            waterSupply: formData.sellDetails.waterSupply,
            approvals: formData.sellDetails.approvals,
            amenities: formData.sellDetails.amenities,
            highlights: formData.sellDetails.highlights,
            description: formData.sellDetails.description,
            propertyId: formData.sellDetails.propertyId,
            loanOnProperty: formData.sellDetails.loanOnProperty
          }
        };

        await updateListing('sell', listingId, sellListingData);
      }

      alert('Listing updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating listing:', error);
      alert(error instanceof Error ? error.message : 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!formData) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <div className="text-lg text-gray-600">Loading listing data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Edit Listing</h1>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {listingType === 'rent' ? (
              <RentForm
                listingType={listingType === 'rent' ? 'rent' : 'sell'}
                formData={formData}
                setFormData={setFormData}
                images={images}
                setImages={setImages}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                errors={errors}
                setErrors={setErrors}
              />
            ) : (
              <SellForm
                listingType={listingType === 'sell' ? 'sell' : 'rent'}
                formData={formData}
                setFormData={setFormData}
                images={images}
                setImages={setImages}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                errors={errors}
                setErrors={setErrors}
              />
            )}

            <div className="flex justify-end gap-4 pt-8">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListingPage; 