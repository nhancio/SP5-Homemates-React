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
    console.log('=== EDIT LISTING PAGE DEBUG ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('existingListing:', existingListing);
    console.log('location.state:', location.state);
    console.log('listingType:', listingType);
    console.log('listingId:', listingId);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to profile');
      navigate('/profile');
      return;
    }

    if (!existingListing) {
      console.log('No existing listing found in state, trying to fetch from Firestore');
      // Try to fetch the listing from Firestore if not in state
      const fetchListing = async () => {
        try {
          const { getPropertyById } = await import('../services/listings');
          const listing = await getPropertyById(listingType as 'rent' | 'sell', listingId!);
          console.log('Fetched listing from Firestore:', listing);
          if (listing) {
            // Initialize form data with fetched listing
            setFormData({
              // Common fields
              address: {
                city: (listing as any).address?.city || '',
                locality: (listing as any).address?.locality || '',
                buildingName: (listing as any).address?.buildingName || '',
              },
              propertyType: (listing as any).propertyType || '',
              furnishingType: (listing as any).furnishingType || '',
              parking: (listing as any).parking || '',
              buildingType: (listing as any).buildingType || '',
              handoverDate: (listing as any).handoverDate || '',
              isImmediate: (listing as any).isImmediate || false,
              description: (listing as any).description || '',
              contactNumber: (listing as any).contactNumber || '',

              // Rent specific fields
              rentDetails: {
                preferredTenant: {
                  lookingFor: (listing as any).rentDetails?.preferredTenant?.lookingFor || '',
                  preferences: (listing as any).rentDetails?.preferredTenant?.preferences || [],
                },
                roomDetails: {
                  availableRooms: (listing as any).rentDetails?.roomDetails?.availableRooms || '',
                  availability: (listing as any).rentDetails?.roomDetails?.availability || '',
                  bathroomType: (listing as any).rentDetails?.roomDetails?.bathroomType || '',
                },
                amenities: (listing as any).rentDetails?.amenities || [],
                costs: {
                  rent: (listing as any).rentDetails?.costs?.rent || '',
                  maintenance: (listing as any).rentDetails?.costs?.maintenance || '',
                  securityDeposit: (listing as any).rentDetails?.costs?.securityDeposit || '',
                  setupCost: (listing as any).rentDetails?.costs?.setupCost || '',
                  brokerage: (listing as any).rentDetails?.costs?.brokerage || '',
                },
                additionalBills: {
                  wifi: (listing as any).rentDetails?.additionalBills?.wifi || '',
                  water: (listing as any).rentDetails?.additionalBills?.water || '',
                  gas: (listing as any).rentDetails?.additionalBills?.gas || '',
                  cook: (listing as any).rentDetails?.additionalBills?.cook || '',
                  maid: (listing as any).rentDetails?.additionalBills?.maid || '',
                  others: (listing as any).rentDetails?.additionalBills?.others || '',
                }
              },

              // Sell specific fields
              sellDetails: {
                price: (listing as any).sellDetails?.price || '',
                gst: (listing as any).sellDetails?.gst || '',
                sqft: (listing as any).sellDetails?.sqft || '',
                direction: (listing as any).sellDetails?.direction || '',
                isNegotiable: (listing as any).sellDetails?.isNegotiable || false,
                propertyType: (listing as any).sellDetails?.propertyType || '',
                ownership: (listing as any).sellDetails?.ownership || '',
                ageOfProperty: (listing as any).sellDetails?.ageOfProperty || '',
                totalFloors: (listing as any).sellDetails?.totalFloors || '',
                floorNumber: (listing as any).sellDetails?.floorNumber || '',
                waterSupply: (listing as any).sellDetails?.waterSupply || '',
                approvals: (listing as any).sellDetails?.approvals || [],
                amenities: (listing as any).sellDetails?.amenities || [],
                highlights: (listing as any).sellDetails?.highlights || [],
                description: (listing as any).sellDetails?.description || '',
                propertyId: (listing as any).sellDetails?.propertyId || '',
                loanOnProperty: (listing as any).sellDetails?.loanOnProperty || false,
                lookingFor: (listing as any).sellDetails?.lookingFor || '',
                maintenance: (listing as any).sellDetails?.maintenance || '',
                securityDeposit: (listing as any).sellDetails?.securityDeposit || '',
                brokerage: (listing as any).sellDetails?.brokerage || '',
              },
              builtUpArea: (listing as any).builtUpArea || '',
              ageOfProperty: (listing as any).ageOfProperty || '',
            });
            setImages((listing as any).images || []);
          } else {
            alert('No listing data found. Please go back to your profile.');
            navigate('/profile');
          }
        } catch (error) {
          console.error('Error fetching listing:', error);
          alert('Failed to load listing data. Please go back to your profile.');
          navigate('/profile');
        }
      };
      
      fetchListing();
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
        loanOnProperty: existingListing.sellDetails?.loanOnProperty || false,
        lookingFor: existingListing.sellDetails?.lookingFor || '',
        maintenance: existingListing.sellDetails?.maintenance || '',
        securityDeposit: existingListing.sellDetails?.securityDeposit || '',
        brokerage: existingListing.sellDetails?.brokerage || '',
      },
      builtUpArea: existingListing.builtUpArea || '',
      ageOfProperty: existingListing.ageOfProperty || '',
    });

    // Set images
    setImages(existingListing.images || []);
  }, [isAuthenticated, navigate, existingListing, listingType, listingId, location.state]);

  const validate = () => {
    console.log('=== VALIDATION DEBUG ===');
    console.log('Validating form data:', formData);
    const newErrors: any = {};
    // Mobile validation
    const mobile = formData.contactNumber || '';
    console.log('Mobile number:', mobile);
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      newErrors.contactNumber = 'Please enter a valid mobile number.';
      console.log('Mobile validation failed:', mobile);
    }
    // Rent validation
    if (listingType === 'rent') {
      const rent = Number(formData.rentDetails?.costs?.rent);
      console.log('Rent value:', rent);
      if (!rent || rent < 1000) {
        newErrors.rent = 'Rent must be at least ₹1,000.';
        console.log('Rent validation failed:', rent);
      }
      // Numeric fields non-negative
      ['maintenance', 'securityDeposit', 'setupCost', 'brokerage'].forEach(field => {
        const value = Number(formData.rentDetails?.costs?.[field]);
        if (value < 0) {
          newErrors[field] = 'Cannot be negative.';
          console.log(`${field} validation failed:`, value);
        }
      });
    }
    // Price validation
    if (listingType === 'sell') {
      const price = Number(formData.sellDetails?.price);
      console.log('Price value:', price);
      if (!price || price < 1000) {
        newErrors.price = 'Price must be at least ₹1,000.';
        console.log('Price validation failed:', price);
      }
      // Numeric fields non-negative
      ['maintenance', 'securityDeposit', 'brokerage'].forEach(field => {
        const value = Number(formData.sellDetails?.[field]);
        if (value < 0) {
          newErrors[field] = 'Cannot be negative.';
          console.log(`${field} validation failed:`, value);
        }
      });
    }
    // Required fields
    console.log('Address:', formData.address);
    if (!formData.address.city) {
      newErrors.city = 'City is required.';
      console.log('City validation failed');
    }
    if (!formData.address.locality) {
      newErrors.locality = 'Locality is required.';
      console.log('Locality validation failed');
    }
    if (!formData.address.buildingName) {
      newErrors.buildingName = 'Building name is required.';
      console.log('Building name validation failed');
    }
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required.';
      console.log('Property type validation failed');
    }
    console.log('Description:', formData.description);
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters.';
      console.log('Description validation failed:', formData.description?.length);
    }
    console.log('Images:', images);
    if (!images || images.length === 0) {
      newErrors.images = 'Please upload at least one image.';
      console.log('Images validation failed:', images?.length);
    }
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== EDIT LISTING SUBMIT DEBUG ===');
    console.log('Form submitted!');
    console.log('User:', user);
    console.log('ListingId:', listingId);
    console.log('ListingType:', listingType);
    console.log('FormData:', formData);
    console.log('Images:', images);
    
    if (!user || !listingId || !listingType) {
      console.log('Missing required data');
      alert('Missing required data');
      return;
    }
    
    console.log('Running validation...');
    const validationResult = validate();
    console.log('Validation result:', validationResult);
    if (!validationResult) {
      console.log('Validation failed, errors:', errors);
      setIsSubmitting(false);
      return;
    }
    
    console.log('Validation passed, starting submission...');
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
            loanOnProperty: formData.sellDetails.loanOnProperty,
            lookingFor: formData.sellDetails.lookingFor,
            maintenance: Number(formData.sellDetails.maintenance) || 0,
            securityDeposit: Number(formData.sellDetails.securityDeposit) || 0,
            brokerage: Number(formData.sellDetails.brokerage) || 0,
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

  console.log('EditListingPage render - formData:', formData);
  console.log('EditListingPage render - listingType:', listingType);
  console.log('EditListingPage render - isSubmitting:', isSubmitting);

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

          <form onSubmit={handleSubmit} className="space-y-8" onKeyDown={(e) => {
            if (e.key === 'Enter') {
              console.log('Enter key pressed in form');
            }
          }}>
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
                hideSubmitButton={true}
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
                hideSubmitButton={true}
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
                type="button"
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
                disabled={isSubmitting}
                onClick={async (e) => {
                  e.preventDefault();
                  console.log('Update Listing button clicked directly');
                  console.log('Form data:', formData);
                  console.log('Errors:', errors);
                  console.log('Is submitting:', isSubmitting);
                  
                  // Call handleSubmit directly
                  console.log('Bypassing validation for testing...');
                  setIsSubmitting(true);
                  try {
                    console.log('Starting update process...');
                    if (listingType === 'sell') {
                      console.log('Updating sell listing...');
                      const sellListingData = {
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
                        sellDetails: {
                          price: Number(formData.sellDetails.price) || 0,
                          maintenance: Number(formData.sellDetails.maintenance) || 0,
                          securityDeposit: Number(formData.sellDetails.securityDeposit) || 0,
                          brokerage: Number(formData.sellDetails.brokerage) || 0,
                        }
                      };
                      console.log('Sell listing data:', sellListingData);
                      await updateListing('sell', listingId!, sellListingData);
                      alert('Listing updated successfully!');
                      navigate('/profile');
                    }
                  } catch (error) {
                    console.error('Error updating listing:', error);
                    alert(error instanceof Error ? error.message : 'Failed to update listing');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
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