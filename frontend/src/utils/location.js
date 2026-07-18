// 📍 Member 4: Core Geolocation Utility
export const getBrowserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      resolve({ latitude: "17.3850", longitude: "78.4867" }); // Fallback coordinates
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
      },
      (error) => {
        console.error("Error capturing browser location:", error);
        // Fallback standard location center
        resolve({ latitude: "17.3850", longitude: "78.4867" }); 
      }
    );
  });
};