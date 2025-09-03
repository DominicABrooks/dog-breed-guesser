let currentBreed = "";
let breedList = [];
let filteredBreeds = [];
let selectedIndex = -1;
let streak = 0;
const guessInput = document.getElementById("guessInput");
const breedDropdown = document.getElementById("breedDropdown");
const streakDiv = document.getElementById("streak");
const guessBtn = document.getElementById("guessBtn");
const nextBtn = document.getElementById("nextBtn");

// Fetch breed list from API
fetch("https://dog.ceo/api/breeds/list/all")
  .then((res) => res.json())
  .then((data) => {
    breedList = getAllBreedsList(data.message);
  });

function showDropdown(items) {
  if (!items.length) {
    breedDropdown.style.display = "none";
    return;
  }
  breedDropdown.innerHTML = items
    .map(
      (breed, i) =>
        `<div class="dropdown-item${i === selectedIndex ? " active" : ""}" data-index="${i}" style="padding:8px;cursor:pointer;${i === selectedIndex ? "background:#f0f0f0;" : ""}">${breed}</div>`
    )
    .join("");
  breedDropdown.style.display = "block";
}

function getAllBreedsList(breedData) {
  const breeds = [];
  for (const [main, subs] of Object.entries(breedData)) {
    if (subs.length === 0) {
      breeds.push(main);
    } else {
      breeds.push(main);
      subs.forEach((sub) => breeds.push(`${sub} ${main}`));
    }
  }
  return breeds;
}

function filterBreeds(value) {
  if (!value) return breedList;
  return breedList.filter((b) =>
    b.toLowerCase().includes(value.toLowerCase())
  );
}

guessInput.addEventListener("input", (e) => {
  const value = e.target.value;
  filteredBreeds = filterBreeds(value);
  selectedIndex = -1;
  showDropdown(filteredBreeds);
  document.getElementById("feedback").textContent = "";
});

guessInput.addEventListener("keydown", (e) => {
  if (breedDropdown.style.display === "none") return;
  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % filteredBreeds.length;
    showDropdown(filteredBreeds);
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    selectedIndex =
      (selectedIndex - 1 + filteredBreeds.length) % filteredBreeds.length;
    showDropdown(filteredBreeds);
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (selectedIndex >= 0 && filteredBreeds[selectedIndex]) {
      guessInput.value = filteredBreeds[selectedIndex];
      breedDropdown.style.display = "none";
      e.preventDefault();
    }
  }
});

breedDropdown.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("dropdown-item")) {
    guessInput.value = filteredBreeds[parseInt(e.target.dataset.index)];
    breedDropdown.style.display = "none";
    document.getElementById("feedback").textContent = "";
  }
});

document.addEventListener("click", (e) => {
  if (!breedDropdown.contains(e.target) && e.target !== guessInput) {
    breedDropdown.style.display = "none";
  }
});

async function loadDog() {
  document.getElementById("feedback").textContent = "";
  guessInput.value = "";
  breedDropdown.style.display = "none";
  guessBtn.disabled = false;

  const res = await fetch("https://dog.ceo/api/breeds/image/random");
  const data = await res.json();
  const imageUrl = data.message;

  document.getElementById("dogImage").src = imageUrl;

  // Extract breed from URL
  const parts = imageUrl.split("/");
  const breedIndex = parts.indexOf("breeds") + 1;
  let breedName = parts[breedIndex];

  // Handle sub-breeds (e.g. bulldog-boston → "boston bulldog")
  if (breedName.includes("-")) {
    let [main, sub] = breedName.split("-");
    breedName = sub + " " + main;
  }

  currentBreed = breedName.toLowerCase();
}

function checkGuess() {
  const guess = guessInput.value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");

  // Validate breed
  if (!breedList.map((b) => b.toLowerCase()).includes(guess)) {
    feedback.textContent = "Please select a valid breed from the list.";
    feedback.style.color = "orange";
    return;
  }

  if (!guess) {
    feedback.textContent = "Please enter a guess!";
    feedback.style.color = "orange";
    return;
  }

  // Disable guess button after any valid guess
  guessBtn.disabled = true;

  // Split breed/sub-breed
  const guessParts = guess.split(" ");
  const breedParts = currentBreed.split(" ");

  // If both are main breed (no sub-breed)
  if (
    guessParts.length === 1 &&
    breedParts.length === 1 &&
    guessParts[0] === breedParts[0]
  ) {
    feedback.textContent = "✅ Correct! It’s a " + currentBreed;
    feedback.style.color = "green";
    streak++;
    streakDiv.textContent = "Streak: " + streak;
    return;
  }

  // If guess is main breed and answer is sub-breed of that main breed
  if (
    guessParts.length === 1 &&
    breedParts.length === 2 &&
    guessParts[0] === breedParts[1]
  ) {
    feedback.textContent = "✅ Correct! It’s a " + currentBreed;
    feedback.style.color = "green";
    streak++;
    streakDiv.textContent = "Streak: " + streak;
    return;
  }

  // If both are sub-breed and main breed
  if (guessParts.length === 2 && breedParts.length === 2) {
    if (
      guessParts[0] === breedParts[0] &&
      guessParts[1] === breedParts[1]
    ) {
      feedback.textContent = "✅ Correct! It’s a " + currentBreed;
      feedback.style.color = "green";
      streak++;
      streakDiv.textContent = "Streak: " + streak;
      return;
    } else if (guessParts[1] === breedParts[1]) {
      feedback.textContent = "❌ Incorrect. It’s a " + currentBreed;
      feedback.style.color = "red";
      streak = 0;
      streakDiv.textContent = "Streak: " + streak;
      return;
    }
  }

  // If guess is sub-breed and answer is main breed
  if (
    guessParts.length === 2 &&
    breedParts.length === 1 &&
    guessParts[1] === breedParts[0]
  ) {
    feedback.textContent = "✅ Correct! It’s a " + currentBreed;
    feedback.style.color = "green";
    streak++;
    streakDiv.textContent = "Streak: " + streak;
    return;
  }

  // Otherwise fail
  feedback.textContent = "❌ Incorrect. It’s a " + currentBreed;
  feedback.style.color = "red";
  streak = 0;
  streakDiv.textContent = "Streak: " + streak;
}

function nextDog() {
  loadDog();
}

// Load first dog on page load
loadDog();
