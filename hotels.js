document.addEventListener("DOMContentLoaded", function () {
  const hotelForm = document.getElementById("hotel-form");
  const hotelList = document.getElementById("hotel-list");
  const destinationSelect = document.getElementById("hotel-destination");
  const filterDestinationSelect = document.getElementById("filter-destination"); // New filter dropdown

  let hotels = [];
  let editIndex = null;

  fetchDestinations();
  fetchHotels();

  // Submit form to add/update hotel
  hotelForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("hotel-name").value;
    const location = document.getElementById("hotel-location").value;
    const price = document.getElementById("hotel-price").value;
    const photoInput = document.getElementById("hotel-photo");

    const destination_id = destinationSelect.value;

    if (!name || !location || !destination_id || !price) {
      alert("Please fill in all fields.");
      return;
    }

    function sendHotel(photoData) {
      const hotelData = {
        name,
        location,
        price,
        photo: photoData,
        destination_id: parseInt(destination_id),
      };

      if (editIndex !== null) {
        const hotelId = hotels[editIndex].id;
        fetch(`/api/hotels/${hotelId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hotelData),
        })
          .then(res => res.json())
          .then(() => {
            fetchHotels();
            hotelForm.reset();
            editIndex = null;
          });
      } else {
        fetch('/api/hotels', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hotelData),
        })
          .then(res => res.json())
          .then(() => {
            fetchHotels();
            hotelForm.reset();
          });
      }
    }
if (photoInput.files.length > 0) {
    const formData = new FormData();
    formData.append("photo", photoInput.files[0]);

 fetch('/api/upload', {
    method: "POST",
    body: formData
})
.then(res => res.text()) // 🔹 Check raw response instead of parsing JSON
.then(text => {
    console.log("Upload API response:", text);
    try {
        const data = JSON.parse(text); // Convert text to JSON
        console.log("Upload successful:", data.imageUrl);
        sendHotel(data.imageUrl);
    } catch (error) {
        console.error("Error parsing JSON response:", text);
        alert("Image upload failed.");
    }
})
.catch(err => console.error("Error uploading image:", err));

} else if (editIndex !== null) {
    sendHotel(hotels[editIndex].photo);
} else {
    alert("Please upload an image.");
}


  });

function fetchHotels() {
    const selectedDestId = filterDestinationSelect.value || "defaultDestination"; // Provide a fallback
    if (!selectedDestId) {
        console.warn("No destination selected, fetching all hotels.");
        return;
    }

    fetch(`/api/hotels?destination=${encodeURIComponent(selectedDestId)}`)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("Expected an array, but got:", data);
                return;
            }
            hotels = data;
            renderHotels();
        })
        .catch(err => console.error("Error fetching hotels:", err));
}




  function fetchDestinations() {
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        // Populate destination dropdown for form
        destinationSelect.innerHTML = '<option value="">Select Destination</option>';
        // Populate filter dropdown
        filterDestinationSelect.innerHTML = '<option value="">All Destinations</option>';

        data.forEach(dest => {
          const option1 = document.createElement('option');
          option1.value = dest.id;
          option1.textContent = dest.name;
          destinationSelect.appendChild(option1);

          const option2 = document.createElement('option');
          option2.value = dest.id;
          option2.textContent = dest.name;
          filterDestinationSelect.appendChild(option2);
        });
      });
  }

  // Filter and render hotels
  function renderHotels() {
    hotelList.innerHTML = "";

    // Get selected destination filter
   const selectedDestId = filterDestinationSelect.value;
if (!selectedDestId) {
  hotels = []; // Clear the list if no destination is selected
 
  return;
}

    // Filter hotels if destination selected
    const filteredHotels = selectedDestId
      ? hotels.filter(hotel => hotel.destination_id == selectedDestId)
      : hotels;

    if (filteredHotels.length === 0) {
      hotelList.innerHTML = "<p>No hotels found for this destination.</p>";
      return;
    }

    filteredHotels.forEach((hotel, index) => {
      const li = document.createElement("li");
      li.className = "hotel-item";
      li.innerHTML = `
        <strong>${hotel.name}</strong><br>
        Location: ${hotel.location}<br>
        Destination: ${hotel.destination_name}<br>
        Price per Night: ₹${hotel.price}<br>
        <img src="${hotel.photo}" alt="${hotel.name}" style="width: 200px; height: auto; margin-top: 10px;" />
        <div class="three-dots" onclick="toggleMenu(this)">⋮</div>
        <div class="options-menu" style="display:none;">
          <div class="menu-item" onclick="editHotel(${index})">Edit</div>
          <div class="menu-item" onclick="deleteHotel(${index})">Delete</div>
        </div>
      `;
      hotelList.appendChild(li);
    });
  }

  // Listen for filter change to re-render list
  filterDestinationSelect.addEventListener("change", fetchHotels);

  window.toggleMenu = function (elem) {
    document.querySelectorAll(".options-menu").forEach(menu => menu.style.display = "none");
    const menu = elem.nextElementSibling;
    menu.style.display = "block";
  };

  window.editHotel = function (index) {
    const hotel = hotels[index];
    document.getElementById("hotel-name").value = hotel.name;
    document.getElementById("hotel-location").value = hotel.location;
    document.getElementById("hotel-price").value = hotel.price;
    destinationSelect.value = hotel.destination_id;

    editIndex = index;

    document.querySelectorAll(".options-menu").forEach(menu => menu.style.display = "none");
  };

  window.deleteHotel = function (index) {
    if (confirm("Are you sure you want to delete this hotel?")) {
      const hotelId = hotels[index].id;
      fetch(`/api/hotels/${hotelId}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
          fetchHotels();
        });
    }
  };

  // Hide menu if clicked outside
  window.addEventListener("click", function (e) {
    if (!e.target.matches(".three-dots")) {
      document.querySelectorAll(".options-menu").forEach(menu => menu.style.display = "none");
    }
  });
});
