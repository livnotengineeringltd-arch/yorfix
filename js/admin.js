// ============================================================
// YorFix admin dashboard.
// Talks to token-gated database functions: the token is checked
// inside the database on every call, so this page is safe to host
// publicly. Without the token it can read nothing.
// ============================================================

(function () {
  const cfg = YORFIX_CONFIG;
  const TOKEN_KEY = "yorfix-admin-token";
  const TOKEN_SAVED_AT_KEY = "yorfix-admin-token-saved-at";
  const TOKEN_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
  const STATUSES = ["new", "contacted", "scheduled", "done", "cancelled"];

  const savedAt = Number(localStorage.getItem(TOKEN_SAVED_AT_KEY));
  const tokenExpired = !savedAt || (Date.now() - savedAt) > TOKEN_MAX_AGE_MS;
  if (tokenExpired) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_SAVED_AT_KEY);
  }
  let token = localStorage.getItem(TOKEN_KEY) || "";
  let bookings = [];
  let messages = [];
  let activeTab = "bookings";

  const loginCard = document.getElementById("loginCard");
  const dashboard = document.getElementById("dashboard");
  const loginMsg = document.getElementById("loginMsg");
  const tableWrap = document.getElementById("tableWrap");
  const statRow = document.getElementById("statRow");
  const refreshBtn = document.getElementById("refreshBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  async function rpc(fn, args) {
    const res = await fetch(cfg.SUPABASE_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: cfg.SUPABASE_ANON_KEY },
      body: JSON.stringify(args)
    });
    if (!res.ok) {
      const body = await res.text().catch(function () { return ""; });
      const err = new Error("rpc " + fn + " failed (" + res.status + ")");
      err.status = res.status;
      err.body = body;
      throw err;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " +
           d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  async function loadAll() {
    tableWrap.innerHTML = '<div class="admin-empty">Loading...</div>';
    const [b, m] = await Promise.all([
      rpc("yorfix_admin_list", { p_token: token }),
      rpc("yorfix_admin_messages", { p_token: token })
    ]);
    bookings = b || [];
    messages = m || [];
    renderStats();
    renderTable();
  }

  function renderStats() {
    const newB = bookings.filter(function (x) { return x.status === "new"; }).length;
    const sched = bookings.filter(function (x) { return x.status === "scheduled"; }).length;
    const done = bookings.filter(function (x) { return x.status === "done"; }).length;
    const newM = messages.filter(function (x) { return x.status === "new"; }).length;
    statRow.innerHTML =
      '<div class="stat-card"><div class="num">' + bookings.length + '</div><div class="lbl">Total bookings</div></div>' +
      '<div class="stat-card"><div class="num" style="color:var(--orange-2)">' + newB + '</div><div class="lbl">New, need a call</div></div>' +
      '<div class="stat-card"><div class="num">' + sched + '</div><div class="lbl">Scheduled</div></div>' +
      '<div class="stat-card"><div class="num" style="color:var(--green)">' + done + '</div><div class="lbl">Done</div></div>' +
      '<div class="stat-card"><div class="num">' + newM + '</div><div class="lbl">New messages</div></div>';
  }

  function statusSelect(current, id, kind) {
    let html = '<select class="status-select status-' + esc(current) + '" data-id="' + esc(id) + '" data-kind="' + kind + '">';
    STATUSES.forEach(function (s) {
      html += '<option value="' + s + '"' + (s === current ? " selected" : "") + ">" + s + "</option>";
    });
    return html + "</select>";
  }

  function renderTable() {
    if (activeTab === "bookings") {
      if (!bookings.length) {
        tableWrap.innerHTML = '<div class="admin-empty">No bookings yet. They will appear here the moment someone books on the site.</div>';
        return;
      }
      let rows = "";
      bookings.forEach(function (b) {
        rows += "<tr>" +
          "<td><strong>" + esc(b.reference || "") + "</strong><br><span style='color:var(--steel); font-size:0.78rem;'>" + fmtDate(b.created_at) + "</span></td>" +
          "<td>" + esc(b.service) + "<br><span class='pill-type pill-" + (b.client_type === "Commercial" ? "commercial" : "domestic") + "'>" + esc(b.client_type) + "</span></td>" +
          "<td>" + esc(b.area) + "</td>" +
          "<td>" + esc(b.preferred_date || "any date") + "<br><span style='color:var(--steel); font-size:0.78rem;'>" + esc(b.preferred_time || "any time") + "</span></td>" +
          "<td><strong>" + esc(b.name) + "</strong><br><a href='tel:" + esc(b.phone) + "'>" + esc(b.phone) + "</a>" + (b.email ? "<br><a href='mailto:" + esc(b.email) + "'>" + esc(b.email) + "</a>" : "") + "</td>" +
          "<td style='max-width:260px;'>" + esc(b.description || "") + "</td>" +
          "<td>" + statusSelect(b.status, b.id, "booking") + "</td>" +
          "<td><button class='row-del' data-id='" + esc(b.id) + "' data-kind='booking'>Delete</button></td>" +
          "</tr>";
      });
      tableWrap.innerHTML = '<table class="admin-table"><thead><tr>' +
        "<th>Ref</th><th>Service</th><th>Area</th><th>Preferred</th><th>Customer</th><th>Job</th><th>Status</th><th></th>" +
        "</tr></thead><tbody>" + rows + "</tbody></table>";
    } else {
      if (!messages.length) {
        tableWrap.innerHTML = '<div class="admin-empty">No messages yet.</div>';
        return;
      }
      let rows = "";
      messages.forEach(function (m) {
        rows += "<tr>" +
          "<td>" + fmtDate(m.created_at) + "</td>" +
          "<td><strong>" + esc(m.name) + "</strong></td>" +
          "<td>" + esc(m.contact) + "</td>" +
          "<td style='max-width:420px;'>" + esc(m.message) + "</td>" +
          "<td>" + statusSelect(m.status, m.id, "message") + "</td>" +
          "<td><button class='row-del' data-id='" + esc(m.id) + "' data-kind='message'>Delete</button></td>" +
          "</tr>";
      });
      tableWrap.innerHTML = '<table class="admin-table" style="min-width:700px;"><thead><tr>' +
        "<th>When</th><th>Name</th><th>Contact</th><th>Message</th><th>Status</th><th></th>" +
        "</tr></thead><tbody>" + rows + "</tbody></table>";
    }
  }

  // One delegated listener handles every status dropdown and delete button.
  tableWrap.addEventListener("change", async function (e) {
    const sel = e.target.closest(".status-select");
    if (!sel) return;
    const fn = sel.dataset.kind === "booking" ? "yorfix_admin_set_booking_status" : "yorfix_admin_set_message_status";
    try {
      await rpc(fn, { p_token: token, p_id: sel.dataset.id, p_status: sel.value });
      await loadAll();
    } catch (err) {
      alert("Could not update status: " + err.message);
    }
  });

  tableWrap.addEventListener("click", async function (e) {
    const btn = e.target.closest(".row-del");
    if (!btn) return;
    if (!confirm("Delete this " + btn.dataset.kind + " permanently?")) return;
    const fn = btn.dataset.kind === "booking" ? "yorfix_admin_delete_booking" : "yorfix_admin_delete_message";
    try {
      await rpc(fn, { p_token: token, p_id: btn.dataset.id });
      await loadAll();
    } catch (err) {
      alert("Could not delete: " + err.message);
    }
  });

  document.getElementById("tabBookings").addEventListener("click", function () { switchTab("bookings"); });
  document.getElementById("tabMessages").addEventListener("click", function () { switchTab("messages"); });
  function switchTab(tab) {
    activeTab = tab;
    document.getElementById("tabBookings").classList.toggle("active", tab === "bookings");
    document.getElementById("tabMessages").classList.toggle("active", tab === "messages");
    renderTable();
  }

  refreshBtn.addEventListener("click", function () { loadAll().catch(showLogin); });
  signOutBtn.addEventListener("click", function () {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_SAVED_AT_KEY);
    token = "";
    showLogin();
  });

  function showDashboard() {
    loginCard.style.display = "none";
    dashboard.style.display = "block";
    refreshBtn.style.display = "inline-flex";
    signOutBtn.style.display = "inline-flex";
  }
  function showLogin() {
    loginCard.style.display = "block";
    dashboard.style.display = "none";
    refreshBtn.style.display = "none";
    signOutBtn.style.display = "none";
  }

  async function tryLogin(candidate) {
    token = candidate;
    await rpc("yorfix_admin_list", { p_token: token }); // throws if the token is wrong
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_SAVED_AT_KEY, String(Date.now()));
    showDashboard();
    await loadAll();
  }

  document.getElementById("loginBtn").addEventListener("click", async function () {
    loginMsg.className = "form-msg";
    const candidate = document.getElementById("tokenInput").value.trim();
    if (!candidate) return;
    try {
      await tryLogin(candidate);
    } catch (err) {
      loginMsg.textContent = "That token was not accepted. Check YORFIX-ADMIN-ACCESS.md and try again.";
      loginMsg.classList.add("error");
    }
  });
  document.getElementById("tokenInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("loginBtn").click();
  });

  // Auto sign-in if a token is already saved on this device.
  if (token) {
    tryLogin(token).catch(function () { token = ""; localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_SAVED_AT_KEY); showLogin(); });
  } else {
    showLogin();
  }
})();
