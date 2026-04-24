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
const API_URL = "https://agent-system-ltxo.onrender.com/api/submissions";

// ✅ NEW VARIABLES
let currentPage = 1;
let limit = 9;
let totalPages = 1;

// ================= LOAD =================
async function loadSubmissions(page = 1) {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    currentPage = page;

    let url = `${API_URL}?page=${currentPage}&limit=${limit}`;

    const status = document.getElementById("statusFilter").value;
    const email = document.getElementById("searchEmail").value;

    if (status) url += `&status=${status}`;
    if (email) url += `&email=${email}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to load submissions", "error");
      return;
    }

    // ✅ IMPORTANT (because backend now sends paginated response)
    const submissions = data.data;

    totalPages = data.totalPages;

    updateStats(submissions);
    displaySubmissions(submissions);

    renderPagination(); // ✅ NEW

  } catch (err) {
    showToast("Failed to load submissions", "error");
  }
}

// ================= STATS =================
function updateStats(submissions) {
  let total = submissions.length;
  let approved = 0;
  let rejected = 0;
  let pending = 0;

  submissions.forEach(s => {
    if (s.status === "APPROVED") approved++;
    else if (s.status === "REJECTED") rejected++;
    else if (s.status === "SUBMITTED") pending++;
  });

  document.getElementById("totalSubmissions").innerText = total;
  document.getElementById("approvedCount").innerText = approved;
  document.getElementById("rejectedCount").innerText = rejected;
  document.getElementById("pendingCount").innerText = pending;
}

// ================= DISPLAY =================
function displaySubmissions(submissions) {
  const container = document.getElementById("submissionsContainer");
  container.innerHTML = "";

  submissions = submissions.filter(s => s.status !== "DRAFT");

  if (!submissions.length) {
    container.innerHTML = "<p>No submissions found</p>";
    return;
  }

  submissions.forEach(sub => {

    const statusClass =
      sub.status === "APPROVED" ? "approved" :
      sub.status === "REJECTED" ? "rejected" :
      "submitted";

    const dateObj = new Date(sub.createdAt);

    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    // 🔥 DOCUMENTS HTML (IMPORTANT)
    let documentsHTML = "";

    if (sub.documents && sub.documents.length > 0) {
      sub.documents.forEach(doc => {
        documentsHTML += `
          <a href="${doc.fileUrl}" target="_blank" class="doc-btn">
            📄 ${doc.originalFileName}
          </a>
        `;
      });
    } else {
      documentsHTML = `<p>No documents uploaded</p>`;
    }

    const card = document.createElement("div");
    card.className = "submission-card";

    card.innerHTML = `
      <h3>
        ${sub.agentId?.displayName || "Agent"}
        <span class="status ${statusClass}">${sub.status}</span>
      </h3>

      <p><b>Email:</b> ${sub.agentId?.email || "N/A"}</p>

      <!-- 🔥 DOCUMENTS HERE -->
      <div class="doc-section">
        <b>Documents:</b>
        ${documentsHTML}
      </div>

      <p><b>Date:</b> ${formattedDate}</p>
      <p><b>Time:</b> ${formattedTime}</p>

      ${
        sub.status === "SUBMITTED"
          ? `
          <textarea 
            id="comment-${sub._id}" 
            placeholder="Add review comments..."
          ></textarea>

          <button 
  id="approve-${sub._id}" 
  class="approve" 
  onclick="reviewSubmission('${sub._id}', 'APPROVED')">
  Approve
</button>

<button 
  id="reject-${sub._id}" 
  class="reject" 
  onclick="reviewSubmission('${sub._id}', 'REJECTED')">
  Reject
</button>
          `
          : sub.status === "REJECTED"
          ? `<p><b>Review:</b> ${sub.reviewComments || "-"}</p>`
          : ""
      }
    `;

    container.appendChild(card);
  });
}
// ================= 🔥 PAGINATION =================
function renderPagination() {
  let pagination = document.getElementById("pagination");

  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    document.body.appendChild(pagination);
  }

  pagination.innerHTML = "";

  // PREV
  if (currentPage > 1) {
    pagination.innerHTML += `<button onclick="loadSubmissions(${currentPage - 1})">Prev</button>`;
  }

  // NUMBERS
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button 
        onclick="loadSubmissions(${i})"
        class="${i === currentPage ? "active-page" : ""}"
      >
        ${i}
      </button>
    `;
  }

  // NEXT
  if (currentPage < totalPages) {
    pagination.innerHTML += `<button onclick="loadSubmissions(${currentPage + 1})">Next</button>`;
  }
}

// ================= REVIEW =================
async function reviewSubmission(id, status) {
  const btn = document.getElementById(
    status === "APPROVED" ? `approve-${id}` : `reject-${id}`
  );

  try {
     btn.disabled = true;
    btn.innerText = status === "APPROVED" ? "Approving..." : "Rejecting...";
    const token = localStorage.getItem("token");

    const comment = document.getElementById(`comment-${id}`)?.value;

    const res = await fetch(`${API_URL}/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status,
        reviewComments: comment
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Review failed", "error");
      return;
    }

    showToast("Review completed", "success");

    setTimeout(() => {
  loadSubmissions(currentPage);
}, 1200); // ✅ stay on same page

  } catch (err) {
    showToast("Error reviewing submission", "error");
  }
  finally {
    // 🔥 STOP LOADING
    btn.disabled = false;
    btn.innerText = status === "APPROVED" ? "Approve" : "Reject";
  }

}

// ================= FILTER =================
function applyFilter() {
  loadSubmissions(1); // reset to page 1
}

// ================= NAVIGATION =================
function goBack() {
  window.location.href = "admin-dashboard.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ================= INIT =================
loadSubmissions();