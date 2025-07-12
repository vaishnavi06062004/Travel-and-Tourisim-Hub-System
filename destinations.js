let destinations = [];

function displayDestinations() {
  const destinationList = document.getElementById("destination-list");
  destinationList.innerHTML = '';

  destinations.forEach((destination, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add('destination-item');
    listItem.innerHTML = `
      <h3>${destination.name}</h3>
      <p><strong>Location:</strong> ${destination.location}</p>
      <p><strong>Category:</strong> ${destination.category}</p>
      <p><strong>Price:</strong> $${destination.price}</p>
      <img src="${destination.image}" alt="${destination.name}" style="max-width: 200px; height: auto;" />
      <span class="three-dots" onclick="toggleMenu(event, ${index})">...</span>
      <div class="options-menu" id="menu-${index}">
        <div class="menu-item" onclick="editDestination(${index})">Edit</div>
        <div class="menu-item" onclick="deleteDestination(${index})">Delete</div>
      </div>
    `;
    destinationList.appendChild(listItem);
  });
}

function toggleMenu(event, index) {
  const menu = document.getElementById(`menu-${index}`);
  const allMenus = document.querySelectorAll('.options-menu');
  allMenus.forEach(m => {
    if (m !== menu) m.style.display = 'none';
  });
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  event.stopPropagation();
}

window.addEventListener('click', () => {
  const allMenus = document.querySelectorAll('.options-menu');
  allMenus.forEach(menu => menu.style.display = 'none');
});

document.getElementById("destination-form").addEventListener("submit", async function(event) {
  event.preventDefault();

  const name = document.getElementById("dest-name").value;
  const location = document.getElementById("dest-location").value;
  const price = document.getElementById("dest-price").value;
  const category = document.getElementById("dest-category").value;
  const photo = document.getElementById("dest-photo").files[0];

  if (!name || !location || !price || !category || (!photo && window.editDestIndex === undefined)) {
    alert("Please fill all fields including the photo");
    return;
  }

  const sendData = async (imageData) => {
    const destinationData = {
      name,
      location,
      price,
      category,
      image: imageData
    };

    try {
      let url = "http://localhost:3000/api/destinations";
      let method = "POST";

      if (window.editDestIndex !== undefined) {
        const id = destinations[window.editDestIndex].id;
        url += `/${id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destinationData)
      });

      if (!res.ok) throw new Error("Failed to save destination");

      document.getElementById("destination-form").reset();
      window.editDestIndex = undefined;
      await fetchAndDisplayDestinations();
    } catch (err) {
      console.error(err);
      alert("Error saving destination");
    }
  };

  if (photo) {
    const reader = new FileReader();
    reader.onloadend = () => sendData(reader.result);
    reader.readAsDataURL(photo);
  } else {
    // No new image selected during edit, reuse existing image
    const existingImage = destinations[window.editDestIndex].image;
    sendData(existingImage);
  }
});

async function fetchAndDisplayDestinations() {
  try {
    const res = await fetch("http://localhost:3000/api/destinations");
    if (!res.ok) throw new Error("Failed to fetch destinations");

    destinations = await res.json();
    displayDestinations();
  } catch (err) {
    console.error(err);
  }
}

function editDestination(index) {
  const destination = destinations[index];
  document.getElementById("dest-name").value = destination.name;
  document.getElementById("dest-location").value = destination.location;
  document.getElementById("dest-price").value = destination.price;
  document.getElementById("dest-category").value = destination.category;
  window.editDestIndex = index;
  document.getElementById(`menu-${index}`).style.display = 'none';
}

async function deleteDestination(index) {
  const destinationId = destinations[index].id;
  try {
    const res = await fetch(`http://localhost:3000/api/destinations/${destinationId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete destination");
    await fetchAndDisplayDestinations();
  } catch (err) {
    console.error(err);
    alert("Error deleting destination");
  }
  document.getElementById(`menu-${index}`).style.display = 'none';
}

fetchAndDisplayDestinations();
