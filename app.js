var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var circle = L.circle([51.508, -0.11], {
  color: "gray",
  fillColor: "blue",
  fillOpacity: 0.3,
  radius: 1000,
}).addTo(map);

var popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;

      // Move the circle to the user's current location
      circle.setLatLng([lat, lon]);

      // Optionally, you can update the map view to center around the user's location
      map.setView([lat, lon], 13);

      // Show a popup at the user's location
      popup
        .setLatLng([lat, lon])
        .setContent("You are here: " + lat + ", " + lon)
        .openOn(map);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// Call getLocation to fetch the user's location and update the circle
getLocation();
