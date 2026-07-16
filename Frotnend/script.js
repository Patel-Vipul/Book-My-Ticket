// ── CONFIG ────────────────────────────────────────────────────
const BASE_URL = "https://book-my-ticket-yz80.onrender.com";

// ── STATE ─────────────────────────────────────────────────────
const state = {
  accessToken: null,
  user: null,
  currentMovieId: null,
  currentMovieTitle: null,
  selectedSeatId: null,
  selectedSeatNumber: null,
  pendingBookingId: null,
  timerInterval: null,
  timerSeconds: 600,
};

// ── API HELPER ────────────────────────────────────────────────
async function api(method, path, body = null, retry = true) {
  const headers = { "Content-Type": "application/json" };
  if (state.accessToken)
    headers["Authorization"] = `Bearer ${state.accessToken}`;

  const opts = { method, headers, credentials: "include" };
  if (body) opts.body = JSON.stringify(body);

  let res = await fetch(`${BASE_URL}${path}`, opts);

  // auto-refresh token on 401
  if (res.status === 401 && retry && !path.startsWith("/auth")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return api(method, path, body, false);
    else {
      handleLogout(false);
      navigate("auth");
      return null;
    }
  }

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    state.accessToken = data.data.accessToken;
    return true;
  } catch {
    return false;
  }
}

// ── NAVIGATION ────────────────────────────────────────────────
function navigate(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(`page-${page}`).classList.add("active");

  if (page === "movies") loadMovies();
  if (page === "bookings") loadMyBookings();
  if (page === "admin") loadAdminMovies();
}

// ── AUTH ──────────────────────────────────────────────────────
function switchAuthTab(tab) {
  document
    .getElementById("tab-login")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("tab-register")
    .classList.toggle("active", tab === "register");
  document
    .getElementById("form-login")
    .classList.toggle("hidden", tab !== "login");
  document
    .getElementById("form-register")
    .classList.toggle("hidden", tab !== "register");
}

async function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errEl = document.getElementById("login-error");
  errEl.classList.add("hidden");

  if (!email || !password) {
    errEl.textContent = "Please fill in all fields.";
    errEl.classList.remove("hidden");
    return;
  }

  const result = await api("POST", "/auth/login", { email, password });
  if (!result) return;

  if (result.ok) {
    state.accessToken = result.data.data.accessToken;
    state.user = result.data.data.user;
    updateNavAuth();
    showToast("success", `Welcome back, ${state.user.first_name}!`);
    navigate("movies");
  } else {
    errEl.textContent = result.data.message || "Login failed.";
    errEl.classList.remove("hidden");
  }
}

async function handleRegister() {
  const firstName = document.getElementById("reg-firstName").value.trim();
  const lastName = document.getElementById("reg-lastName").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;
  const errEl = document.getElementById("register-error");
  errEl.classList.add("hidden");

  if (!firstName || !lastName || !email || !password) {
    errEl.textContent = "Please fill in all fields.";
    errEl.classList.remove("hidden");
    return;
  }

  const result = await api("POST", "/auth/register", {
    firstName,
    lastName,
    email,
    password,
    role,
  });
  if (!result) return;

  if (result.ok) {
    showToast("success", "Account created! Please sign in.");
    switchAuthTab("login");
  } else {
    const msgs =
      result.data.errors?.join(", ") ||
      result.data.message ||
      "Registration failed.";
    errEl.textContent = msgs;
    errEl.classList.remove("hidden");
  }
}

async function handleLogout(callApi = true) {
  if (callApi && state.accessToken) {
    await api("GET", "/auth/logout");
  }
  state.accessToken = null;
  state.user = null;
  updateNavAuth();
  showToast("success", "Logged out successfully");
  navigate("movies");
}

function updateNavAuth() {
  const loggedIn = !!state.user;
  document.getElementById("nav-login").classList.toggle("hidden", loggedIn);
  document.getElementById("nav-logout").classList.toggle("hidden", !loggedIn);
  document.getElementById("user-pill").classList.toggle("hidden", !loggedIn);
  document.getElementById("nav-bookings").classList.toggle("hidden", !loggedIn);

  const isAdmin = state.user?.role === "admin";
  document.getElementById("nav-admin").classList.toggle("hidden", !isAdmin);

  if (loggedIn) {
    const initials =
      `${state.user.first_name?.[0] || ""}${state.user.last_name?.[0] || ""}`.toUpperCase();
    document.getElementById("user-avatar").textContent = initials;
    document.getElementById("user-name").textContent = state.user.first_name;
  }
}

// ── MOVIES ────────────────────────────────────────────────────
async function loadMovies() {
  const container = document.getElementById("movies-container");
  container.innerHTML = loadingHTML();

  const result = await api("GET", "/movies");
  if (!result || !result.ok) {
    container.innerHTML = emptyStateHTML(
      "🎬",
      "Could not load movies",
      "Make sure your backend is running on port 8080",
    );
    return;
  }

  const movies = result.data.data;
  if (!movies || movies.length === 0) {
    container.innerHTML = emptyStateHTML(
      "🎬",
      "No movies yet",
      "An admin needs to add movies first",
    );
    return;
  }

  container.innerHTML = movies
    .map(
      (movie) => `
        <div class="movie-card" onclick="openSeats('${movie.id}', '${escHtml(movie.title)}', ${movie.duration_in_minutes})">
        <div class="movie-card-thumb">
    ${
      movie.thumnail_url ?
              `<img src="${movie.thumnail_url}" alt="${escHtml(movie.title)}" 
               style="width:100%; height:100%; object-fit:cover;"
               onerror="this.parentElement.innerHTML='🎥'">`
                : "🎥"
            }
          </div>
          <div class="movie-card-body">
            <div class="movie-card-title">${escHtml(movie.title)}</div>
            <div class="movie-card-meta">${movie.duration_in_minutes} min</div>
            <div class="movie-card-desc">${escHtml(movie.description || "")}</div>
          </div>
          <div class="movie-card-footer">
            <button class="btn-book">Book Seats</button>
          </div>
        </div>
      `,
    )
    .join("");
}

// ── SEATS ─────────────────────────────────────────────────────
async function openSeats(movieId, movieTitle, duration, description) {
  state.currentMovieId = movieId;
  state.currentMovieTitle = movieTitle;
  state.selectedSeatId = null;
  state.selectedSeatNumber = null;

  navigate("seats");

  document.getElementById("seats-movie-title").textContent = movieTitle;
  document.getElementById("seats-movie-meta").textContent = `${duration} min`;
  document.getElementById("btn-proceed").disabled = true;
  document.getElementById("selected-seat-info").textContent =
    "Select a seat to continue";

  const container = document.getElementById("seats-container");
  container.innerHTML = loadingHTML();

  const result = await api("GET", `/movies/${movieId}/seats`);
  if (!result || !result.ok) {
    container.innerHTML = emptyStateHTML(
      "🪑",
      "Could not load seats",
      "Please try again",
    );
    return;
  }

  const seats = result.data.data;
  if (!seats || seats.length === 0) {
    container.innerHTML = emptyStateHTML(
      "🪑",
      "No seats available",
      "Check back later",
    );
    return;
  }

  container.innerHTML = seats
    .map((seat) => {
      const cls = seat.is_available ? "available" : "booked";
      return `
          <div class="seat ${cls}" id="seat-${seat.id}"
            data-id="${seat.id}" data-number="${seat.seat_number}"
            onclick="selectSeat(this, '${seat.id}', '${seat.seat_number}', ${seat.is_available})">
            ${seat.seat_number}
          </div>
        `;
    })
    .join("");
}

function selectSeat(el, seatId, seatNumber, isAvailable) {
  if (!isAvailable) return;

  // deselect previous
  if (state.selectedSeatId) {
    const prev = document.getElementById(`seat-${state.selectedSeatId}`);
    if (prev) {
      prev.classList.remove("selected");
      prev.classList.add("available");
    }
  }

  if (state.selectedSeatId === seatId) {
    state.selectedSeatId = null;
    state.selectedSeatNumber = null;
    document.getElementById("btn-proceed").disabled = true;
    document.getElementById("selected-seat-info").textContent =
      "Select a seat to continue";
    return;
  }

  el.classList.remove("available");
  el.classList.add("selected");
  state.selectedSeatId = seatId;
  state.selectedSeatNumber = seatNumber;

  document.getElementById("btn-proceed").disabled = false;
  document.getElementById("selected-seat-info").innerHTML =
    `Selected: <strong>Seat ${seatNumber}</strong>`;
}

async function handleProceedBooking() {
  if (!state.selectedSeatId) return;

  if (!state.user) {
    showToast("error", "Please sign in to book a seat");
    navigate("auth");
    return;
  }

  const result = await api("POST", "/bookings", {
    seatId: state.selectedSeatId,
  });
  if (!result) return;

  if (result.ok) {
    const booking = result.data.data;
    state.pendingBookingId = booking.id;

    // mark seat as pending in UI
    const seatEl = document.getElementById(`seat-${state.selectedSeatId}`);
    if (seatEl) {
      seatEl.classList.remove("selected");
      seatEl.classList.add("pending-seat");
    }

    // show modal
    document.getElementById("modal-movie-name").textContent =
      state.currentMovieTitle;
    document.getElementById("modal-seat-number").textContent =
      booking.seatNumber || state.selectedSeatNumber;
    document.getElementById("modal-booking-id").textContent = booking.bookingId;
    document.getElementById("pending-modal").classList.remove("hidden");

    startTimer(10 * 60);
  } else {
    showToast("error", result.data.message || "Could not reserve seat");
  }
}

async function handleConfirmBooking() {
  console.log(state.pendingBookingId)
  if (!state.pendingBookingId) return;

  const result = await api(
    "POST",
    `/bookings/${state.pendingBookingId}/confirm`,
  );
  if (!result) return;

  if (result.ok) {
    stopTimer();
    closePendingModal();
    showToast("success", "Booking confirmed! 🎉");

    // mark seat as booked in UI
    const seatEl = document.getElementById(`seat-${state.selectedSeatId}`);
    if (seatEl) {
      seatEl.classList.remove("pending-seat");
      seatEl.classList.add("booked");
    }

    state.pendingBookingId = null;
    state.selectedSeatId = null;
    state.selectedSeatNumber = null;
  } else {
    showToast("error", result.data.message || "Could not confirm booking");
  }
}

async function handleCancelPendingBooking() {
  if (!state.pendingBookingId) {
    closePendingModal();
    return;
  }

  const result = await api(
    "DELETE",
    `/bookings/${state.pendingBookingId}/cancel`,
  );
  stopTimer();
  closePendingModal();

  // free seat in UI
  const seatEl = document.getElementById(`seat-${state.selectedSeatId}`);
  if (seatEl) {
    seatEl.classList.remove("pending-seat", "selected");
    seatEl.classList.add("available");
  }

  state.pendingBookingId = null;
  showToast("success", "Reservation cancelled");
}

function closePendingModal() {
  document.getElementById("pending-modal").classList.add("hidden");
}

// ── TIMER ─────────────────────────────────────────────────────
function startTimer(seconds) {
  state.timerSeconds = seconds;
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    updateTimerDisplay();
    if (state.timerSeconds <= 0) {
      stopTimer();
      closePendingModal();
      showToast("error", "Booking expired — seat has been released");
      const seatEl = document.getElementById(`seat-${state.selectedSeatId}`);
      if (seatEl) {
        seatEl.classList.remove("pending-seat");
        seatEl.classList.add("available");
      }
      state.pendingBookingId = null;
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const m = String(Math.floor(state.timerSeconds / 60)).padStart(2, "0");
  const s = String(state.timerSeconds % 60).padStart(2, "0");
  document.getElementById("timer-display").textContent = `${m}:${s}`;
}

// ── MY BOOKINGS ───────────────────────────────────────────────
async function loadMyBookings() {
  const container = document.getElementById("bookings-container");
  container.innerHTML = loadingHTML();

  if (!state.user) {
    container.innerHTML = emptyStateHTML("🔒", "Sign in to view bookings", "");
    return;
  }

  const result = await api("GET", "/bookings/my");
  if (!result || !result.ok) {
    container.innerHTML = emptyStateHTML(
      "⚠️",
      "Could not load bookings",
      "Please try again",
    );
    return;
  }

  const bookings = result.data.data;
  if (!bookings || bookings.length === 0) {
    container.innerHTML = emptyStateHTML(
      "🎟️",
      "No bookings yet",
      "Book a seat to see it here",
    );
    return;
  }

  container.innerHTML = bookings
    .map(
      (b) => `
        <div class="booking-item" id="booking-item-${b.bookingId}">
          <div class="booking-item-left">
            <div class="booking-item-movie">${escHtml(b.movieTitle || "Movie")}</div>
            <div class="booking-item-meta">Seat ${b.seatNumber} · Booked ${formatDate(b.createdAt)}</div>
            <div class="booking-status ${b.status}">
              ${statusDot(b.status)} ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${b.status === "pending" ? `<button class="btn-confirm-pending" onclick="confirmFromBookings('${b.bookingId}')">Confirm</button>` : ""}
            ${b.status !== "cancelled" ? `<button class="btn-cancel-booking" onclick="cancelBooking('${b.bookingId}')">Cancel</button>` : ""}
          </div>
        </div>
      `,
    )
    .join("");
}

async function confirmFromBookings(bookingId) {
  const result = await api("POST", `/bookings/${bookingId}/confirm`);
  if (!result) return;
  if (result.ok) {
    showToast("success", "Booking confirmed!");
    loadMyBookings();
  } else showToast("error", result.data.message || "Could not confirm");
}

async function cancelBooking(bookingId) {
  const result = await api("DELETE", `/bookings/${bookingId}/cancel`);
  if (!result) return;
  if (result.ok) {
    showToast("success", "Booking cancelled");
    loadMyBookings();
  } else showToast("error", result.data.message || "Could not cancel");
}

// ── ADMIN ─────────────────────────────────────────────────────
async function loadAdminMovies() {
  const container = document.getElementById("admin-movies-list");
  container.innerHTML = loadingHTML();

  const result = await api("GET", "/movies");
  if (!result || !result.ok) {
    container.innerHTML =
      '<p style="color:var(--muted);font-size:14px">Could not load movies</p>';
    return;
  }

  const movies = result.data.data;
  if (!movies || movies.length === 0) {
    container.innerHTML =
      '<p style="color:var(--muted);font-size:14px">No movies yet. Add one above.</p>';
    return;
  }

  container.innerHTML = movies
    .map(
      (m) => `
        <div class="admin-movie-row">
          <div>
            <div class="admin-movie-name">${escHtml(m.title)}</div>
            <div class="admin-movie-meta">${m.duration_in_minutes} min · ${m.total_seats || "—"} seats</div>
          </div>
          <div class="admin-actions">
            <button class="btn-admin-delete" onclick="handleDeleteMovie('${m.id}')">Delete</button>
          </div>
        </div>
      `,
    )
    .join("");
}

async function handleCreateMovie() {
  const title = document.getElementById("admin-title").value.trim();
  const description = document.getElementById("admin-description").value.trim();
  const duration = parseInt(document.getElementById("admin-duration").value);
  const thumbnailUrl = document.getElementById("admin-thumbnail").value.trim();
  const totalSeats = parseInt(document.getElementById("admin-seats").value);
  const errEl = document.getElementById("admin-form-error");
  errEl.classList.add("hidden");

  if (!title || !duration || !totalSeats) {
    errEl.textContent = "Please fill in title, duration, and total seats.";
    errEl.classList.remove("hidden");
    return;
  }

  const result = await api("POST", "/movies", {
    title,
    description,
    durationInMinutes: duration,
    totalSeats: totalSeats,
    thumbnailUrl: thumbnailUrl,
  });
  if (!result) return;

  if (result.ok) {
    showToast("success", `"${title}" added with ${totalSeats} seats`);
    document.getElementById("admin-title").value = "";
    document.getElementById("admin-description").value = "";
    document.getElementById("admin-duration").value = "";
    document.getElementById("admin-thumbnail").value = ""
    document.getElementById("admin-seats").value = "25";
    loadAdminMovies();
  } else {
    errEl.textContent = result.data.message || "Could not create movie";
    errEl.classList.remove("hidden");
  }
}

async function handleDeleteMovie(movieId) {
  if (!confirm("Delete this movie and all its seats? This cannot be undone."))
    return;
  const result = await api("DELETE", `/movies/${movieId}`);
  if (!result) return;
  if (result.ok) {
    showToast("success", "Movie deleted");
    loadAdminMovies();
  } else showToast("error", result.data.message || "Could not delete movie");
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(type, message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === "success" ? "✅" : "❌"}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── HELPERS ───────────────────────────────────────────────────
function loadingHTML() {
  return `<div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div>`;
}

function emptyStateHTML(icon, title, sub) {
  return `<div class="empty-state"><div class="icon">${icon}</div><h3>${title}</h3><p>${sub}</p></div>`;
}

function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusDot(status) {
  const map = { confirmed: "🟢", pending: "🟡", cancelled: "⚫" };
  return map[status] || "•";
}

// ── INIT ──────────────────────────────────────────────────────
loadMovies();
