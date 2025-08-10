// Utilities for property data extraction

// Extract a BHK label from a property object across many possible sources
// Returns standardized label like "1BHK", "2BHK+" or null if not found
export function getBhkLabel(
  property: any,
  listingType: 'rent' | 'buy' | 'sell'
): string | null {
  const mode: 'rent' | 'buy' = listingType === 'sell' ? 'buy' : listingType;

  // Prefer explicit bedrooms number
  if (typeof property?.bedrooms === 'number' && property.bedrooms > 0) {
    return `${property.bedrooms}BHK`;
  }

  // Regex: match e.g. "1 BHK", "2bhk", "3BHK+", case-insensitive, allow spaces
  const bhkRegex = /\b(\d+)\s*BHK\+?\b/i;

  const pickFromString = (val?: string) => {
    if (typeof val !== 'string') return undefined;
    const match = val.match(bhkRegex);
    return match ? match[0].toUpperCase().replace(/\s+/g, '') : undefined;
  };

  if (mode === 'rent') {
    const availability = property?.rentDetails?.roomDetails?.availability as string | undefined;
    const flatType = (property?.rentDetails?.roomDetails as any)?.flatType as string | undefined;
    const roomType = (property?.rentDetails?.roomDetails as any)?.roomType as string | undefined;
    const fromAvailability = pickFromString(availability);
    if (fromAvailability) return fromAvailability;
    const fromFlatType = pickFromString(flatType);
    if (fromFlatType) return fromFlatType;
    const fromRoomType = pickFromString(roomType);
    if (fromRoomType) return fromRoomType;
  } else {
    const fromRoomType = pickFromString((property as any)?.roomType);
    if (fromRoomType) return fromRoomType;
    const fromHomeType = pickFromString((property as any)?.homeType);
    if (fromHomeType) return fromHomeType;
    const fromSellPropertyType = pickFromString(property?.sellDetails?.propertyType);
    if (fromSellPropertyType) return fromSellPropertyType;
  }

  const candidates: Array<string | undefined> = [
    property?.type,
    property?.title,
    property?.description,
    (property as any)?.propertyType,
    (property as any)?.flatType,
    (property as any)?.roomType,
  ];
  for (const val of candidates) {
    const picked = pickFromString(val);
    if (picked) return picked;
  }

  return null;
}


