const locationContainer = document.getElementById("locationContainer");
const nearestCampsList = document.getElementById("nearestCampsList");
let allCamps = []; 

var map = L.map("map").setView([23.685, 90.3563], 7);


L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var circle = L.circle([23.685, 90.3563], {
  fillColor: "blue",
  fillOpacity: 0.2,
  radius: 1000,
}).addTo(map);

var popup = L.popup();

// Function to fetch and display army camps
const armyCamps = async () => {
  const res = await fetch("./armyCampData.json");
  const bdArmyCamps = await res.json();
  allCamps = bdArmyCamps; // Store camps in global variable

  // Add markers for each camp
  bdArmyCamps.forEach(function (camp) {
    var marker = L.marker([camp.lat, camp.lng])
      .addTo(map)
      .bindPopup(`<b>${camp.name}</b><br>Click for contact number`);

    // Add click event to show contact numbers
    marker.on("click", function () {
      const contactNumbers = camp.contacts.join(", ");
      marker
        .bindPopup(
          `<b>${camp.name} সেনাক্যাম্প</b><br>Contact: ${contactNumbers}`
        )
        .openPopup();
    });
  });
};

// Call the function to load camps
armyCamps();

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Function to get user's location and display nearest camps with contact numbers
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Update location container with user's address
      var url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const locationName = data.display_name;
          locationContainer.innerHTML = locationName;
          popup
            .setLatLng([lat, lon])
            .setContent("You are here: " + locationName)
            .openOn(map);
        })
        .catch((error) => {
          console.error("Error retrieving location:", error);
        });

      // Update map view and circle position
      circle.setLatLng([lat, lon]);
      map.setView([lat, lon], 13);

      // Calculate nearest 5 camps
      const campsWithDistance = allCamps
        .map((camp) => ({
          ...camp,
          distance: calculateDistance(lat, lon, camp.lat, camp.lng),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      // Display nearest camps in the sidebar with contact numbers
      nearestCampsList.innerHTML = "";
      campsWithDistance.forEach((camp) => {
        const campElement = document.createElement("div");
        campElement.className = "bg-gray-200 rounded-md text-black text-xs";
        campElement.innerHTML = `
          <div class="font-semibold">${camp.name}</div>
          <div class="text-sm">দূরত্ব: ${camp.distance.toFixed(
            2
          )} কিলোমিটার</div>
          <div class="text-sm">যোগাযোগ: ${camp.contacts.join(", ")}</div>
        `;
        nearestCampsList.appendChild(campElement);
      });
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// Add event listener to the button
const btn = document.getElementById("btn");
btn.addEventListener("click", getLocation);
