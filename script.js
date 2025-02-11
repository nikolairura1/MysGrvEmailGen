let map;
let service;
let infowindow;
let userCity = "your city"; // Default placeholder

const bookDescriptions = {
    "Storm of Steel": "the experiences of Ernest Junger, a German Officer, on the Western Front in World War One. The 1929 translation was out of print for a while but reputedly is the best at bringing across the vivid depictions of war that Junger is famous for. This was the version I was interested in (https://passage.press/products/the-storm-of-steel-original-1929-translation-by-ernst-junger-translated-by-basil-creighton)",
    "Always with Honor": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Peter Kemp Trilogy": "the author's experiences fighting in the Spanish Civil War and later serving in British special forces during WWII, and its got three volumes, each for a different war",
    "Conrad Masterworks": "exploring themes of colonialism, human nature, and adventure on the high seas, and Conrad is a classic author. I like this collection (https://passage.press/products/joseph-conrad-the-masterworks-vol-i) particularly because it includes some of his lesser known short stories",
    "Oblensky Memoir": "the life of Prince Oblensky, detailing his life as an aristocrat, soldier, and exile after the Russian Revolution. There has been a revival in interest in the Russian Civil War recently, and I think this book would be interesting to everyone who wants to learn about the Whites in that war",
    "Always with Honor Graphic Novel": "Pyotr Wrangel’s life and military campaigns, bringing his dramatic struggle against the Bolsheviks to life with some really beautiful art. It's the first book released in a series, and I think it will be something that appeals to a lot of non-traditional readers.",
    "Hardy Boys Collection": "two teenage detectives solving mysteries in the 1950s. These books were really popular back in the day, but got a lot of edits over the years. I saw that the original versions were recently re-released and would really be interested in seeing them as they were back in the day. This is the edition I had in mind (https://passage.press/products/hb)",
    "Robert Howard Masterworks": "the legendary fantasy and adventure stories of Robert Howard, including the iconic Conan the Barbarian tales that defined the sword-and-sorcery genre. I really like this collection (https://passage.press/products/robert-e-howard-the-masterworks) because it has everything in one place and includes some of his lesser known short stories",
    "Lovecraft Masterworks": "collecting the best of Lovecrafts macabe New England ovure, and has some really beautiful illustrations that accompany it. I saw you have some of his books, but this collection is the one I'm really interested in (https://passage.press/products/lovecraft)",
    "Noticing by Steve Sailer": "social and cultural observations, using data and analysis to explore trends in demographics, media, and human behavior",
    "Something of the Springtime": "the fleeting beauty of youth and change, weaving together themes of nostalgia, transformation, and the passage of time",
    "Fascile I, Disturbance": "disruption and chaos in modern society, examining shifts in power, technology, and cultural movements through a critical lens. It's by Curtis Yarvin who has become one of the major thought leaders in Sillicon Valley and the new administration, so I think it would be something people besides me would read also",
    "Unqualified Reservations": "a critique of modern political structures, offering a perspective on governance, history, and power that challenges mainstream narratives. This book was really influential in Tech circles a few years ago and has kinda exploded into the mainstream recently",
    "Xenosystems by Nick Land": "futurism, accelerationism, and the impact of technology on human civilization. Its been really influential online and in tech circles, but Land's philosophy has been picked up more in the mainstream and is being taken more seriously recently",
    "George Bhudda": "the American South, a really moving collection of short stories by a lesser known author.",
    "After the War: Stories from the Next Regime": "life in the near future, with a bunch of short stories by well known internet personalities offering competing visions of what comes next",
    "Passage Prize Vol I, II, & III": "aesthetics and creating new quality art, with three great anthologies of poetry, art, and short stories that highlight the work of modern day craftsmen",

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
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(40, 40)
        }
    });

    google.maps.event.addListener(marker, "click", () => {
        fetchLibraryDetails(place.place_id, place.name);
    });
}

function fetchLibraryDetails(placeId, libraryName) {
    service.getDetails({ placeId: placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            let libraryEmail = "Email not available";
            
            if (place.website) {
                libraryEmail = `Visit website for contact: ${place.website}`;
            } else if (place.international_phone_number) {
                libraryEmail = `Phone: ${place.international_phone_number}`;
            }

            infowindow.setContent(
                `<strong>${libraryName}</strong><br>
                ${libraryEmail}<br>
                <button onclick="generateEmail('${libraryName}', '${libraryEmail}')">Request Book</button>`
            );
            infowindow.open(map, new google.maps.Marker({ position: place.geometry.location, map }));
        }
    });
}


function generateEmail(libraryName, libraryContact) {
    const selectedBook = document.getElementById("book-select").value;
    const bookDescription = bookDescriptions[selectedBook] || "a fascinating history book.";
    
    const emailText = `Dear Librarian, 

I am a resident of ${userCity} and an occasional patron of ${libraryName}, and I'm writing to find out if you would be willing to stock "${selectedBook}". I checked your catalog and you don't seem to have it in stock already. I (read it recently OR am interested in reading it) and I really think it would be of interest to history lovers in our community. 

It's about ${bookDescription}. 

Please let me know if I just missed it in the catalog, or if there is a different process to request books to be stocked. 

Thank you, and I hope you have a wonderful day!

Sincerely
YOUR NAME`;

    document.getElementById("email-text").value = emailText;
}
