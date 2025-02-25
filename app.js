const locationContainer = document.getElementById("locationContainer");
var map = L.map("map").setView([23.685, 90.3563], 7); // Centered on Bangladesh

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

const armyCamps = async () => {
  const res = await fetch("./armyCampData.json");
  const bdArmyCamps = await res.json();
  bdArmyCamps.forEach(function (camp) {
    var marker = L.marker([camp.lat, camp.lng])
      .addTo(map)
      .bindPopup(`<b>${camp.name}</b><br>Click for contact number`);

    marker.on("click", function () {
      const contactNumbers = camp.contacts.join(", ");
      marker
        .bindPopup(`<b>${camp.name} সেনাক্যাম্প</b><br>Contact: ${contactNumbers}`)
        .openPopup();   
    });
  });
};

armyCamps();

// Loop through the array and add markers for each camp

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;

      console.log(lat, lon);
      var url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          var locationName = data.display_name;
          console.log("Location Name: " + locationName);
          locationContainer.innerHTML = locationName;
        })
        .catch((error) => {
          console.error("Error retrieving location:", error);
        });

      circle.setLatLng([lat, lon]);
      map.setView([lat, lon], 13);
      popup
        .setLatLng([lat, lon])
        .setContent("You are here: " + lat + ", " + lon)
        .openOn(map);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// Call getLocation to fetch the user's location when clicking the button
const btn = document.getElementById("btn");
btn.addEventListener("click", getLocation);
