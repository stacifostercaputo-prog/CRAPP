export function openDirections(latitude: number, longitude: number, name: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMac = /Mac/.test(navigator.userAgent);

  if (isIOS || isMac) {
    const appleMapsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodeURIComponent(name)}`;
    window.open(appleMapsUrl, '_blank');
  } else {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(googleMapsUrl, '_blank');
  }
}

export function getMapEmbedUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=15`;
}
