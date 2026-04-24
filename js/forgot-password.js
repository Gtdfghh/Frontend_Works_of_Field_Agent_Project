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

document.getElementById("sendBtn").addEventListener("click", async () => {

  console.log("Button clicked");

  const email = document.getElementById("email").value;

  try {
    showLoader();
    const res = await fetch("https://agent-system-ltxo.onrender.com/api/forgot-password", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email })
    });

    console.log("Response:", res);

    const data = await res.json();

    console.log("Data:", data);

    if (res.ok) {
      showToast("Reset link sent successfully ", "success");
    } else {
      showToast(data.message || "Something went wrong ❌", "error");
    }

   } catch (err) {
    console.error(err);
    showToast("Server error ", "error");
  } finally {
    // ✅ ALWAYS hide loader
    hideLoader();
  }

});