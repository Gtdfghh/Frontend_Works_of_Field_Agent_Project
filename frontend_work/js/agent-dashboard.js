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
const BASE_URL = "http://localhost:3000/api";

init();

/* ================= INIT ================= */
async function init() {
  await loadDashboard();
  await loadSubmissions();

}

/* ================= NAVIGATION ================= */
function showDashboard() {
  hideAll();
  document.getElementById("dashboardSection").style.display = "block";
  document.getElementById("pageTitle").innerText = "Dashboard";
   const links = document.querySelectorAll(".sidebar a");
  links.forEach(a => a.classList.remove("active"));
  links[0].classList.add("active");
}


function showMySubmissions() {
  hideAll();
  document.getElementById("submissionSection").style.display = "block";
  document.getElementById("pageTitle").innerText = "My Submissions";
  const links = document.querySelectorAll(".sidebar a");
  links.forEach(a => a.classList.remove("active"));
  links[1].classList.add("active");
}

function showUpload() {
  hideAll();
  document.getElementById("uploadSection").style.display = "block";
  document.getElementById("pageTitle").innerText = "Upload Documents";
    const links = document.querySelectorAll(".sidebar a");
  links.forEach(a => a.classList.remove("active"));
  links[2].classList.add("active"); // Upload is 3rd link
}


/* ✅ NEW */
function showNotifications() {
  hideAll();
  document.getElementById("notificationSection").style.display = "block";
  document.getElementById("pageTitle").innerText = "Notifications";

  loadNotifications();
}

function hideAll() {
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("submissionSection").style.display = "none";
  document.getElementById("uploadSection").style.display = "none";

  // ✅ NEW
  if (document.getElementById("notificationSection")) {
    document.getElementById("notificationSection").style.display = "none";
  }
}

function setActive(el) {
  document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
  el.classList.add("active");
}
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

/* ================= DASHBOARD ================= */
async function loadDashboard() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/agents/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    // ✅ SET DISPLAY NAME
const name = localStorage.getItem("displayName") || "Agent";

if (document.getElementById("welcomeText")) {
  document.getElementById("welcomeText").innerText =
    `Welcome, ${name} 👋`;
}

   const agentEl = document.getElementById("agentStatus");
const subEl = document.getElementById("submissionStatus");

const agentStatus = data.agentStatus || "-";
const submissionStatus = data.currentSubmissionStatus || "-";

agentEl.innerText = agentStatus;
subEl.innerText = submissionStatus;

// APPLY COLORS
applyStatusColor(agentEl, agentStatus);
applyStatusColor(subEl, submissionStatus);
    document.getElementById("docCount").innerText = data.documentsUploaded || 0;
    updateUploadUI(data.documentsUploaded || 0, data.currentSubmissionStatus);

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

/* ================= SUBMISSIONS ================= */
async function loadSubmissions() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/submissions/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const subs = data.submissions || [];

    renderTable(subs);

    if (subs.length > 0) {
      localStorage.setItem("submissionId", subs[0]._id);
    }

  } catch (err) {
    console.error("Submission error:", err);
  }
}

function renderTable(subs) {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  let showReasonColumn = false;

  // 🔥 Check if ANY submission is rejected
  subs.forEach(sub => {
    if (sub.status === "REJECTED") {
      showReasonColumn = true;
    }
  });

  // 🔥 Show / Hide Reason Header
  document.getElementById("reasonHeader").style.display = showReasonColumn ? "table-cell" : "none";

  subs.forEach(sub => {
    let reasonCell = "";
    let actionCell = "";

    // ✅ REJECTED → show reason + edit
    if (sub.status === "REJECTED") {
      reasonCell = `<td>${sub.reviewComments || "-"}</td>`;
      actionCell = `<td><button onclick="editSubmission('${sub._id}')">Edit</button></td>`;
    }

    // ✅ DRAFT → no reason, only edit
    else if (sub.status === "DRAFT") {
      reasonCell = showReasonColumn ? `<td></td>` : "";
      actionCell = `<td><button onclick="editSubmission('${sub._id}')">Edit</button></td>`;
    }

    // ✅ APPROVED → nothing
    else if (sub.status === "APPROVED") {
      reasonCell = showReasonColumn ? `<td></td>` : "";
      actionCell = `<td><span style="color:gray;">No Action</span></td>`;
    }
    else if (sub.status === "SUBMITTED") {
  reasonCell = showReasonColumn ? `<td></td>` : "";
  actionCell = `<td><span style="color:gray;">No Action</span></td>`;
}

    const row = `
      <tr>
        <td>${sub._id}</td>
        <td>
  <span class="badge badge-${sub.status.toLowerCase()}">
    ${sub.status}
  </span>
</td>
        <td>${new Date(sub.createdAt).toLocaleDateString()}</td>
        ${showReasonColumn ? reasonCell : ""}
        ${actionCell}
      </tr>
    `;

    table.innerHTML += row;
  });
}  

/* ================= EDIT ================= */
function editSubmission(id) {
  localStorage.setItem("submissionId", id);
  document.getElementById("submissionId").value = id;

  showUpload();

  const links = document.querySelectorAll(".sidebar a");
  links.forEach(a => a.classList.remove("active"));
  links[2].classList.add("active");
}

/* ================= UPLOAD ================= */
async function uploadAll() {
  try {
    showLoader();
    const token = localStorage.getItem("token");

    // 🔥 STEP 1: ALWAYS call createSubmission API
    const res = await fetch(`${BASE_URL}/submissions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to create submission", "error");
      return;
    }

    // ✅ IMPORTANT CHANGE (match backend)
    const id = data.submission._id;
    localStorage.setItem("submissionId", id);

    // 🔥 STEP 2: Upload documents
    const files = [
      { file: document.getElementById("panFile").files[0], type: "PAN" },
      { file: document.getElementById("aadhaarFile").files[0], type: "AADHAAR" },
      { file: document.getElementById("photoFile").files[0], type: "PHOTO" }
    ];

    for (let f of files) {
  if (!f.file) continue;

  const formData = new FormData();

  // 🔥 IMPORTANT FIX
  formData.append(f.type.toLowerCase(), f.file);

  const uploadRes = await fetch(`${BASE_URL}/submissions/${id}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    showToast(uploadData.message || "File upload failed", "error");
    return;
  }
}

    showToast("Documents uploaded successfully", "success");

    setTimeout(() => {
  loadDashboard();
  loadSubmissions();
}, 1200);

  } catch (err) {
    console.error("Upload error:", err);
    showToast("Upload failed", "error");
    
  }
  finally {
    hideLoader(); 
  }
}

/* ================= SUBMIT ================= */
async function submitDocuments() {
  try {
    showLoader();
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("submissionId");

    if (!id) {
      showToast("No submission found", "error");
      return;
    }

    const res = await fetch(`${BASE_URL}/submissions/${id}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Submission failed", "error");
      return;
    }

    showToast("Submitted successfully", "success");

    setTimeout(() => {
  loadDashboard();
  loadSubmissions();
  showDashboard();
}, 1200);

  } catch (err) {
    console.error("Submit error:", err);
  }
  finally {
    hideLoader(); 
  }
}

/* ================= NOTIFICATIONS ================= */
async function loadNotifications() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/submissions/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const list = document.getElementById("notificationList");
    const dot = document.getElementById("notificationDot");

    // 🔥 SHOW RED DOT IF NOTIFICATIONS EXIST
    if (data.notifications && data.notifications.length > 0) {
      dot.style.display = "block";
    } else {
      dot.style.display = "none";
    }

    if (!data.notifications || data.notifications.length === 0) {
      list.innerHTML = "<p>No notifications available</p>";
      return;
    }

    list.innerHTML = data.notifications.map(n => `
      <div class="notification">
        <strong>${n.type}</strong>
        <p>${n.message}</p>
        <small>${new Date(n.createdAt).toLocaleString()}</small>
      </div>
    `).join("");

  } catch (err) {
    console.error("Notification error:", err);
  }
}
function updateUploadUI(docCount, status) {
  const msg = document.getElementById("uploadMessage");
  const btn = document.getElementById("uploadActionBtn");

  if (!msg || !btn) return;

  if (docCount === 0) {
    msg.innerText = "Please upload your documents to continue";
    btn.innerText = "Upload Now";
    btn.onclick = showUpload;
  } 
  else if (docCount < 3) {
    msg.innerText = "Some documents are missing";
    btn.innerText = "Complete Upload";
    btn.onclick = showUpload;
  } 
  else {
    msg.innerText = "All documents uploaded ✅";
    btn.innerText = "View Status";
    btn.onclick = showMySubmissions;
  }
}
function applyStatusColor(element, status) {
  element.classList.remove(
    "status-approved",
    "status-pending",
    "status-rejected",
    "status-submitted"
  );

  if (!status) return;

  const s = status.toUpperCase();

  if (s === "APPROVED") {
    element.classList.add("status-approved");
  } else if (s === "PENDING") {
    element.classList.add("status-pending");
  } else if (s === "REJECTED") {
    element.classList.add("status-rejected");
  } else if (s === "SUBMITTED") {
    element.classList.add("status-submitted");
  }
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "../pages/login.html";
}