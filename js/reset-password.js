// ================= TOAST =================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toastMessage");
  const progress = toast.querySelector(".progress-bar");

  if (!toast || !msg) return;

  msg.innerText = message;
  toast.className = "toast show " + type;

  // restart progress animation
  progress.style.animation = "none";
  void progress.offsetWidth;
  progress.style.animation = "progressAnim 3s linear forwards";

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ================= LOADER =================
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// ================= TOGGLE PASSWORD =================
function toggle(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (!input || !icon) return;

  icon.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    }
  });
}

// ✅ Call toggle
toggle("newPassword", "toggleNew");
toggle("confirmPassword", "toggleConfirm");

// ================= GET TOKEN =================
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

// ================= LIVE PASSWORD VALIDATION =================
const passwordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");
const errorText = document.getElementById("passwordError"); // HTML needed
const submitBtn = document.getElementById("resetBtn");

// Disable button initially
submitBtn.disabled = true;

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;

  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password);

  if (!password) {
    errorText.style.display = "none";
    submitBtn.disabled = true;
    return;
  }

  if (!isValid) {
    errorText.innerText =
      " Enter Min 8 chars, 1 uppercase, 1 number, 1 special char";
    errorText.style.display = "block";
    submitBtn.disabled = true;
  } else {
    errorText.style.display = "none";
    submitBtn.disabled = false;
  }
});

// ================= RESET PASSWORD =================
document.getElementById("resetBtn").addEventListener("click", async () => {

  const newPass = passwordInput.value.trim();
  const confirmPass = confirmInput.value.trim();

  // 🔴 Validation
  if (!newPass || !confirmPass) {
    showToast("Please fill all fields ❗", "error");
    return;
  }

  if (newPass !== confirmPass) {
    showToast("Passwords do not match ❌", "error");
    return;
  }

  if (!token) {
    showToast("Invalid reset link ❌", "error");
    return;
  }
  setTimeout(() => {
  window.location.href = "login.html";
}, 1500);


  try {
    showLoader();

    const res = await fetch("https://agent-system-ltxo.onrender.com/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        password: newPass
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Password updated successfully ✅", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      showToast(data.message || "Reset failed ❌", "error");
    }

  } catch (err) {
    console.error(err);
    showToast("Server error ❌", "error");
  } finally {
    hideLoader();
  }
});