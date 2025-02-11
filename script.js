let map;
let service;
let infowindow;
let userCity = "your city"; // Default placeholder

const bookDescriptions = {
    "Storm of Steel": "Storm of Steel is a memoir of World War I, written by Ernst Jünger, detailing his experiences as a German officer on the Western Front",
    "Always with Honor": "Always with Honor is a memoir by Pyotr Wrangel, recounting his time as a White Army general during the Russian Civil War",
    "Peter Kemp Trilogy": "The Peter Kemp Trilogy covers the author's experiences fighting in the Spanish Civil War and later serving in British special forces during WWII",
    "Conrad Masterworks": "A collection of masterful writings by Joseph Conrad, exploring themes of colonialism, human nature, and adventure on the high seas",
    "Oblensky Memoir": "A memoir of Prince Oblensky, detailing his life as an aristocrat, soldier, and exile after the Russian Revolution"
};
fetch('/.netlify/functions/getapikey')
  .then(response => response.json())
  .then(data => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&callback=initMap`;
      script.defer = true;
      document.body.appendChild(script);
  });


function initMap() {
    const sevastopol = new google.maps.LatLng(44.6166, 33.5254); // Default to Sevastopol
    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById("map"), {
        center: sevastopol,
        zoom: 12,
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(userPos);
            findLibraries(userPos);
            fetchCityName(userPos);
        }, () => {
            findLibraries(sevastopol); // Fallback if location is denied
        });
    } else {
        findLibraries(sevastopol);
    }
}

function fetchCityName(location) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === "OK" && results[0]) {
            results.forEach(result => {
                if (result.types.includes("locality")) {
                    userCity = result.formatted_address.split(",")[0]; // Extract city name
                }
            });
        }
    });
}
function findLibraries(location) {
    const request = {
        query: "library",
        location: location,
        radius: '10000' // Search within 10km
    };

    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, (results, status) => {
        console.log("Library Search Response:", results, status); // Debugging
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            results.forEach((place) => {
                createMarker(place);
            });
        } else {
            alert("No libraries found nearby.");
        }
    });
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red dot for visibility
            scaledSize: new google.maps.Size(40, 40) // Adjust size
        }
    });

    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(
            `<strong>${place.name}</strong><br>
            <button onclick="generateEmail('${place.name}', '${place.formatted_address || place.vicinity}')">Request Book</button>`
        );
        infowindow.open(map, marker);
    });
}


function generateEmail(libraryName, libraryContact) {
    const selectedBook = document.getElementById("book-select").value;
    const bookDescription = bookDescriptions[selectedBook] || "a fascinating history book.";
    
    const emailText = `Dear Librarian, 

I am a resident of ${userCity} and an occasional patron of ${libraryName}, and I'm writing to find out if you would be willing to stock "${selectedBook}". I checked your catalog and you don't seem to have it in stock already. I (read it recently OR am interested in reading it) and I really think it would be of interest to history lovers in our community. 

The book is about ${bookDescription}. 

Please let me know if I just missed it in the catalog, or if there is a different process to request books to be stocked. 

Thank you, and I hope you have a wonderful day!

Sincerely
YOUR NAME`;

    document.getElementById("email-text").value = emailText;
}
