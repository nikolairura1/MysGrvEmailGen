let map;
let service;
let infowindow;
let userCity = "your city"; // Default placeholder

const bookDescriptions = {
    "Storm of Steel": "the experiences of Ernest Junger, a German Officer, on the Western Front in World War One. The 1929 translation was out of print for a while but reputedly is the best at bringing across the vivid depictions of war that Junger is famous for. This was the version I was interested in (https://www.amazon.com/Storm-Steel-Original-1929-Translation/dp/1696237726)",
    "Always with Honor": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Peter Kemp Trilogy": "the author's experiences fighting in the Spanish Civil War and later serving in British special forces during WWII, and its got three volumes, each for a different war",
    "Conrad Masterworks": "exploring themes of colonialism, human nature, and adventure on the high seas, and Conrad is a classic author. I like this collection (https://www.amazon.com/Joseph-Conrad-Masterworks-Vol-I/dp/B0BMJQQWZL/ref=pd_bxgy_thbs_d_sccl_2/134-1489599-8882142?pd_rd_w=4adub&content-id=amzn1.sym.52395280-70da-442b-acda-fca52ac79a0b&pf_rd_p=52395280-70da-442b-acda-fca52ac79a0b&pf_rd_r=YPQH8WD19072W0GK8AQY&pd_rd_wg=3LOCB&pd_rd_r=57ec0e9b-2cdd-4927-ae5f-eb320fba2066&pd_rd_i=B0BMJQQWZL&psc=1) particularly because it includes some of his lesser known short stories",
    "Oblensky Memoir": "the life of Prince Oblensky, detailing his life as an aristocrat, soldier, and exile after the Russian Revolution. There has been a revival in interest in the Russian Civil War recently, and I think this book would be interesting to everyone who wants to learn about the Whites in that war"
    "Always with Honor Graphic Novel": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Hardy Boys Collection": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Robert Howard Masterworks": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Lovecraft Masterworks": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Noticing by Steve Sailer": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Something of the Springtime": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Fascile I, Disturbance": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Unqualified Reservations": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Xenosystems by Nick Land": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "George Bhudda": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "After the War: Stories from the Next Regime": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",
    "Passage Prize Vol I, II, & III": "the life by Pyotr Wrangel, a White Army general during the Russian Civil War, and offers a really unique perspective on one of the most important but least studied conflicts of the 20th Century. There's been something of a revival in RCW interest recently and I think this book has been a big part of it",

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
