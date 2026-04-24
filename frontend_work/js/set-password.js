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
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}
const API_URL = "http://localhost:3000/api/auth/set-password";

// 🔥 Get token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  showToast("Invalid or expired link", "error");

setTimeout(() => {
  window.location.href = "login.html";
}, 1500);
}


const errorText = document.getElementById("passwordError");
const submitBtn = document.querySelector("button");
// ================= EYE TOGGLE =================
const toggleEye = document.getElementById("toggleEye");
const passwordInput = document.getElementById("newPassword");

toggleEye.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleEye.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleEye.classList.replace("fa-eye-slash", "fa-eye");
  }
});

// ================= LIVE VALIDATION =================
passwordInput.addEventListener("blur", () => {
  const password = passwordInput.value;

  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password);

  if (!isValid) {
    errorText.innerText =
      "Password must be at least 8 characters, include 1 uppercase, 1 number and 1 special character";

    errorText.style.display = "block";
    submitBtn.disabled = true;
  } else {
    errorText.innerText = "";
    errorText.style.display = "none";
    submitBtn.disabled = false;
  }
});

// ================= SUBMIT =================
document.getElementById("setPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match", "error");
    return;
  }

  // 🔥 FINAL CHECK BEFORE SEND
  if (
    newPassword.length < 8 ||
    !/[A-Z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword)
  ) {
    showToast("Password does not meet requirements", "error");
    return;
  }

  try {
    showLoader();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        oldPassword,
        password: newPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to update password", "error");
      return;
    }

    showToast("Password updated successfully", "success");

setTimeout(() => {
  window.location.href = "login.html";
}, 1500);

  } catch (err) {
    showToast("Error updating password", "error");
  }
  finally {
    hideLoader(); 
  }
});