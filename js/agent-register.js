function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toastMessage");
  const progress = toast.querySelector(".progress-bar");

  msg.innerText = message;

  // ✅ Apply class instead of inline color
  toast.className = "toast show " + type;

  // Restart animation
  progress.style.animation = "none";
  void progress.offsetWidth;
  progress.style.animation = "progressAnim 3s linear forwards";

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
// ================= VALIDATION FUNCTIONS =================

function setError(id, message) {
  document.getElementById(id).innerText = message;
}

function setInputError(input, isError) {
  if (isError) input.classList.add("input-error");
  else input.classList.remove("input-error");
}

// EMAIL
function validateEmail() {
  const input = document.getElementById("email");
  const value = input.value.trim();

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(value)) {
    setError("emailError", "Enter valid email (example@gmail.com)");
    setInputError(input, true);
    return false;
  }

  setError("emailError", "");
  setInputError(input, false);
  return true;
}

// NAME
function validateName() {
  const input = document.getElementById("name");
  const value = input.value.trim();

  if (value.length < 3) {
    setError("nameError", "Name must be at least 3 characters");
    setInputError(input, true);
    return false;
  }

  setError("nameError", "");
  setInputError(input, false);
  return true;
}

// ZIP
function validateZip() {
  const input = document.getElementById("zip");
  const value = input.value.trim();

  if (!/^\d{6}$/.test(value)) {
    setError("zipError", "Zip must be 6 digits");
    setInputError(input, true);
    return false;
  }

  setError("zipError", "");
  setInputError(input, false);
  return true;
}

// RADIUS
function validateRadius() {
  const input = document.getElementById("radius");
  const value = Number(input.value);

  if (value <= 0) {
    setError("radiusError", "Radius must be greater than 0");
    setInputError(input, true);
    return false;
  }

  setError("radiusError", "");
  setInputError(input, false);
  return true;
}

// SELECT VALIDATION
function validateSelect(id, errorId) {
  const value = document.getElementById(id).value;

  if (!value) {
    setError(errorId, "Please select an option");
    return false;
  }

  setError(errorId, "");
  return true;
}
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// ================= REAL-TIME VALIDATION =================
document.getElementById("email").addEventListener("input", validateEmail);
document.getElementById("name").addEventListener("input", validateName);
document.getElementById("zip").addEventListener("input", validateZip);
document.getElementById("radius").addEventListener("input", validateRadius);

// ================= SUBMIT =================
// ================= SUBMIT =================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const isValid =
    validateEmail() &&
    validateName() &&
    validateZip() &&
    validateRadius() &&
    validateSelect("camera", "cameraError") &&
    validateSelect("vehicle", "vehicleError") &&
    validateSelect("gps", "gpsError") &&
    validateSelect("internet", "internetError");

  if (!isValid) {
    showToast("Please fix errors before submitting", "error");
    return;
  }

  const data = {
    email: document.getElementById("email").value,
    displayName: document.getElementById("name").value,
    primaryZip: document.getElementById("zip").value,
    coverageRadiusKm: Number(document.getElementById("radius").value),

    hasCamera: document.getElementById("camera").value === "true",
    hasVehicle: document.getElementById("vehicle").value === "true",
    hasGps: document.getElementById("gps").value === "true",
    hasHighSpeedInternet: document.getElementById("internet").value === "true",

    experienceNotes: document.getElementById("experience").value
  };

  try {
    showLoader();
    const res = await fetch("https://agent-system-ltxo.onrender.com/api/agents/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    // =========================
    // ❌ ERROR CASE
    // =========================
    if (!res.ok) {
      showToast(result.message || "Registration Failed", "error");
      return;
    }

    // =========================
    // ✅ SUCCESS / RE-REGISTER
    // =========================
    if (result.message.includes("Re-registration")) {
showToast("Re-registration successful", "success");
    } else {
      showToast("Registration successful. Awaiting approval", "success");
    }

    setTimeout(() => {
  window.location.href = "login.html";
}, 1500);

  } catch (err) {
showToast("Backend not reachable", "error");
  }
  finally {
    hideLoader(); 
  }
});