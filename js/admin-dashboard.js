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

const API_URL = "https://agent-system-ltxo.onrender.com/api/agents";

let currentPage = 1;
let currentStatus = "";
let currentEmail = "";

// ================= LOAD AGENTS =================
async function loadAgents(page = 1) {
  try {
    currentPage = page;

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    let url = `${API_URL}?page=${page}&limit=10`;

    if (currentStatus) url += `&status=${currentStatus}`;
    if (currentEmail) url += `&email=${currentEmail}`;

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Failed to load agents", "error");
      return;
    }

    updateStats(result.data);
    displayAgents(result.data);
    setupPagination(result.pagination);

  } catch (err) {
    console.error(err);
    showToast("Failed to load agents", "error");
  }
}

// ================= STATS =================
function updateStats(agents) {
  let total = agents.length;
  let approved = 0;
  let pending = 0;
  let rejected = 0;

  agents.forEach(a => {
    if (a.agentStatus === "APPROVED") approved++;
    if (a.agentStatus === "PENDING") pending++;
    if (a.agentStatus === "REJECTED") rejected++;
  });

  document.getElementById("totalAgents").innerText = total;
document.getElementById("approvedAgents").innerText = approved;
  document.getElementById("pendingAgents").innerText = pending;
  document.getElementById("rejectedAgents").innerText = rejected;
}

// ================= DISPLAY =================
function displayAgents(agents) {
  const container = document.getElementById("agentsContainer");
  container.innerHTML = "";

  agents.forEach(agent => {

    const div = document.createElement("div");
    div.className = "agent-card";

    // ✅ DATE + TIME
    const date = agent.createdAt
      ? new Date(agent.createdAt).toLocaleDateString()
      : "-";

    const time = agent.createdAt
      ? new Date(agent.createdAt).toLocaleTimeString()
      : "-";

    div.innerHTML = `
      <div class="card-header">
        <h3>${agent.displayName}</h3>
        <span class="status ${agent.agentStatus.toLowerCase()}">
          ${agent.agentStatus}
        </span>
      </div>

      <p><b>Email:</b> ${agent.email}</p>
      <p><b>Zip:</b> ${agent.primaryZip}</p>
      <p><b>Radius:</b> ${agent.coverageRadiusKm || "-"} km</p>

      <!-- ✅ FEATURES -->
      <div class="tags">
        ${agent.hasCamera ? "<span>📷 Camera</span>" : ""}
        ${agent.hasVehicle ? "<span>🚗 Vehicle</span>" : ""}
        ${agent.hasGps ? "<span>📍 GPS</span>" : ""}
        ${agent.hasHighSpeedInternet ? "<span>🌐 Internet</span>" : ""}
      </div>

      <p><b>Experience:</b> ${agent.experienceNotes || "-"}</p>

      <!-- ✅ DATE TIME -->
      <p class="date-time"><b>Joined:</b> ${date}</p>
      <p class="date-time"><b>Time:</b> ${time}</p>

      ${
        agent.agentStatus === "PENDING"
          ? `
          <input 
            type="text" 
            id="comment-${agent._id}" 
            placeholder="Add review comments..." 
            class="review-input"
          />

          <div class="actions">
  <button id="approve-${agent._id}" class="approve" onclick="activateAgent('${agent._id}')">
    Approve
  </button>
  <button id="reject-${agent._id}" class="reject" onclick="rejectAgent('${agent._id}')">
    Reject
  </button>
</div>
          `
          : agent.agentStatus === "REJECTED"
          ? `
          <p><b>Review:</b> ${agent.reviewComment || "-"}</p>
          `
          : ""
      }
    `;

    container.appendChild(div);
  });
}

// ================= PAGINATION =================
function setupPagination(pagination) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  if (!pagination) return;

  for (let i = 1; i <= pagination.totalPages; i++) {
    const btn = document.createElement("button");

    btn.innerText = i;

    if (i === pagination.page) {
      btn.style.background = "#4e73df";
      btn.style.color = "white";
    }

    btn.onclick = () => loadAgents(i);

    container.appendChild(btn);
  }
}

// ================= FILTER =================
function applyFilters() {
  currentEmail = document.getElementById("searchEmail").value;
  currentStatus = document.getElementById("statusFilter").value;

  loadAgents(1);
}

// ================= APPROVE =================
async function activateAgent(id) {
  const btn = document.getElementById(`approve-${id}`);
  try {
    btn.disabled = true;
    btn.innerText = "Approving...";
    const token = localStorage.getItem("token");

    const reviewComment = document.getElementById(`comment-${id}`).value;

    const res = await fetch(`${API_URL}/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "APPROVED",
        reviewComment: reviewComment || "you can upload your documents"
      })
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Approval failed", "error");
      return;
    }

    showToast("Agent Approved", "success");
    setTimeout(() => {
  loadAgents(currentPage);
}, 1200);

  } catch (err) {
    showToast("Error approving agent", "error");
  }
  finally {
    // 🔥 STOP LOADING
    btn.disabled = false;
    btn.innerText = "Approve";
  }
}

// ================= REJECT =================
async function rejectAgent(id) {
  const btn = document.getElementById(`reject-${id}`);
  try {
    const token = localStorage.getItem("token");

    const reviewComment = document.getElementById(`comment-${id}`).value;

    if (!reviewComment) {
      showToast("Please enter rejection reason", "error");
      return;
    }
     btn.disabled = true;
    btn.innerText = "Rejecting...";

    const res = await fetch(`${API_URL}/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "REJECTED",
        reviewComment: reviewComment
      })
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Rejection failed", "error");
      return;
    }

    showToast("Agent Rejected", "success");
    setTimeout(() => {
  loadAgents(currentPage);
}, 1200);

  } catch (err) {
    showToast("Error rejecting agent", "error");
  }
  finally {
    // 🔥 STOP LOADING
    btn.disabled = false;
    btn.innerText = "Reject";
  }
}

// ================= NAVIGATION =================
function goToSubmissions() {
  window.location.href = "../pages/admin-submissions.html";
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "../pages/login.html";
}

// ================= INIT =================
loadAgents();