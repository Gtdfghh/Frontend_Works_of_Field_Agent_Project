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
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    showLoader();
    
    const res = await fetch("https://agent-system-ltxo.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    console.log("Login Response:", result);

     // ❌ ERROR CASE
    if (!res.ok) {
      showToast(result.message || "Login Failed", "error");
      return;
    }

    // ✅ STORE TOKEN
    localStorage.setItem("token", result.token);

    // ✅ STORE ROLE
    localStorage.setItem("role", result.user.role);
    localStorage.setItem("displayName", result.user.displayName);

     showToast("Login Successful", "success");

    // 🔥 ROLE-BASED REDIRECT
    setTimeout(() => {
      if (result.user.role === "ADMIN") {
        window.location.href = "admin-dashboard.html";
      } else if (result.user.role === "AGENT") {
        window.location.href = "agent-dashboard.html";
      } else {
        showToast("Unknown role", "error");
      }
    }, 1500);

  } catch (err) {
    console.error(err);
    showToast("Backend not reachable", "error");
  }
  finally {
    hideLoader(); 
  }
});
// ================= EYE TOGGLE =================
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// ✅ Check if element exists (important)
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordInput.type = "password";
      togglePassword.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
}