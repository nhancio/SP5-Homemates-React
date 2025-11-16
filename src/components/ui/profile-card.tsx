"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Phone, MapPin, Briefcase, MessageCircle } from "lucide-react"

interface ProfileCardProps {
  name: string
  avatar?: string
  city?: string
  locality?: string
  profession?: string
  preferences?: string[]
  phoneNumber?: string
  onCall?: () => void
  onWhatsApp?: () => void
  className?: string
}

export function ProfileCard({
  name,
  avatar,
  city,
  locality,
  profession,
  preferences = [],
  phoneNumber,
  onCall,
  onWhatsApp,
  className,
}: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-pink-50 to-purple-50 opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {avatar && avatar !== '/images/default-avatar.png' ? (
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-white font-bold text-lg">
                  {getInitials(name)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
            {profession && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {profession}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {(city || locality) && (
          <div className="mb-4 flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="text-sm">
              {locality && city ? `${locality}, ${city}` : city || locality}
            </span>
          </div>
        )}

        {/* Preferences */}
        {preferences && preferences.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {preferences.slice(0, 3).map((pref, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 border border-primary-200"
                >
                  {pref}
                </span>
              ))}
              {preferences.length > 3 && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  +{preferences.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {phoneNumber && (onCall || onWhatsApp) && (
          <div className="flex gap-2 mt-4">
            {onCall && (
              <button
                onClick={onCall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            )}
            {onWhatsApp && (
              <button
                onClick={onWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

