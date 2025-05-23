export function getShareableUrl(propertyId: string, type: 'rent' | 'sell'): string {
  const baseUrl = 'https://homematesapp.in';
  const path = type === 'rent' ? 'rent' : 'buy';
  return `${baseUrl}/${path}/${propertyId}`;
}
