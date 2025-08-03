import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CreditCard, ArrowLeft, Check, Shield, Zap, Star, Crown, Phone, Flame } from 'lucide-react';
import { getUserCredits, addCredits } from '../services/credits';
import { initiatePhonePePayment } from '../services/listings';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
  icon: React.ReactNode;
  paymentLink: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 10,
    price: 59,
    icon: <Zap className="w-6 h-6" />,
    paymentLink: 'https://rzp.io/rzp/qjQGr6X'
  },
  {
    id: 'popular',
    name: 'Most Popular',
    credits: 25,
    price: 99,
    popular: true,
    icon: <Star className="w-6 h-6" />,
    paymentLink: 'https://rzp.io/rzp/97VBldBi'
  },
  {
    id: 'premium',
    name: 'Best Value',
    credits: 50,
    price: 149,
    bestValue: true,
    icon: <Crown className="w-6 h-6" />,
    paymentLink: 'https://rzp.io/rzp/asLk4LN'
  }
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, loginError, clearLoginError } = useAppContext();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Buy Credits | Homemates';
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchUserCredits();
    }
  }, [user, isAuthenticated]);

  const fetchUserCredits = async () => {
    try {
      const { getUserCredits } = await import('../services/credits');
      const creditInfo = await getUserCredits(user!.id);
      setUserCredits(creditInfo.credits);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage || !user) return;

    setProcessing(true);
    try {
      // Redirect to the payment link
      window.open(selectedPackage.paymentLink, '_blank');
      
      // Add credits immediately (in production, this should be done via webhook)
      await addCredits(user.id, selectedPackage.credits);
      
      // Update local state
      setUserCredits(prev => prev + selectedPackage.credits);
      
      // Show success message
      alert(`Payment initiated! ${selectedPackage.credits} credits have been added to your account.`);
      
      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogin = async () => {
    clearLoginError(); // Clear any previous errors
    await login();
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to purchase credits
            </p>
            <div className="relative">
              <button 
                onClick={handleLogin}
                className="flex items-center justify-center w-full btn btn-primary"
              >
                Sign in with Google
              </button>
              {loginError && (
                <div className="mt-2">
                  <p className="text-red-600 text-sm font-bold bg-red-100 border border-red-200 rounded px-2 py-1 w-full" aria-live="polite">
                    {loginError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Buy Credits</h1>
            <p className="text-gray-600 mb-4">
              Purchase credits to contact property owners via call or WhatsApp
            </p>
            
            {userCredits > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <p className="text-primary-700 font-medium">
                  You currently have <span className="font-bold">{userCredits}</span> credits remaining
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedPackage?.id === pkg.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              } ${pkg.popular ? 'ring-2 ring-primary-200' : ''} ${
                pkg.bestValue ? 'ring-2 ring-green-200 border-green-300 bg-green-50 scale-105' : ''
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              {pkg.bestValue && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <Flame className="w-3 h-3 mr-1" />
                    BEST DEAL – Save 50% per credit
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    pkg.bestValue ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {pkg.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">Contact {pkg.credits} property owners</p>
                
                <div className={`text-3xl font-bold mb-2 ${
                  pkg.bestValue ? 'text-green-600' : 'text-primary-600'
                }`}>
                  ₹{pkg.price}
                </div>
                
                <div className="text-sm text-gray-500">
                  ₹{(pkg.price / pkg.credits).toFixed(2)} per credit
                </div>

                {pkg.bestValue && (
                  <div className="mt-3 text-sm text-green-600 font-medium">
                    Most users buy this pack!
                  </div>
                )}
              </div>

              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-4 right-4">
                  <Check className="w-6 h-6 text-primary-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Button */}
        {selectedPackage && (
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={processing}
              className="btn btn-primary btn-lg flex items-center mx-auto"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹{selectedPackage.price} for {selectedPackage.credits} Credits
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-1" />
              Secure payment powered by Razorpay
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Why Buy Credits?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold mb-2">Direct Contact</h4>
              <p className="text-gray-600 text-sm">Call or WhatsApp property owners directly</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold mb-2">Instant Access</h4>
              <p className="text-gray-600 text-sm">Get immediate contact information</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold mb-2">Secure & Reliable</h4>
              <p className="text-gray-600 text-sm">Safe payment through PhonePe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 