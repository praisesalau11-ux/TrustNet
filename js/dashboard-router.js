
/* ==========================================
   TRUSTNET DASHBOARD ROUTER
   File: js/dashboard-router.js
========================================== */

const routes = {
  overview: {
    title: "Dashboard",
    description: "Your TrustNet command centre."
  },

  "trust-score": {
    title: "Trust Score",
    description: "Understand your trust indicators and assessment history."
  },

  notifications: {
    title: "Notifications",
    description: "Your TrustNet updates and important alerts."
  },

  discover: {
    title: "Discover",
    description: "Explore people, businesses, products and opportunities."
  },

  marketplace: {
    title: "Marketplace",
    description: "Discover products, services and sellers."
  },

  businesses: {
    title: "Businesses",
    description: "Explore business profiles and trust information."
  },

  people: {
    title: "People",
    description: "Explore public and professional profiles."
  },

  products: {
    title: "Products",
    description: "Explore products and available product information."
  },

  services: {
    title: "Services",
    description: "Discover services and providers."
  },

  jobs: {
    title: "Jobs",
    description: "Explore employment opportunities."
  },

  opportunities: {
    title: "Opportunities",
    description: "Explore opportunities and evaluate potential risks."
  },

  information: {
    title: "Information",
    description: "Investigate claims, sources and information."
  },

  messages: {
    title: "Messages",
    description: "Your conversations and communications."
  },

  communities: {
    title: "Communities",
    description: "Connect with communities and discussions."
  },

  social: {
    title: "Social",
    description: "Explore social activity and shared knowledge."
  },

  projects: {
    title: "Projects",
    description: "Organize projects, teams and collaboration."
  },

  decisions: {
    title: "Decisions",
    description: "Compare options, evidence and potential outcomes."
  },

  "ai-agents": {
    title: "AI Agents",
    description: "Explore specialized AI assistants."
  },

  profile: {
    title: "My Profile",
    description: "Your TrustNet identity and account information."
  },

  settings: {
    title: "Settings",
    description: "Manage your TrustNet account."
  }
};

const routeIcons = {
  "trust-score": "◇",
  notifications: "♢",
  discover: "⌕",
  marketplace: "◫",
  businesses: "▣",
  people: "◉",
  products: "◇",
  services: "✦",
  jobs: "▤",
  opportunities: "↗",
  information: "i",
  messages: "◌",
  communities: "◎",
  social: "✧",
  projects: "▣",
  decisions: "◈",
  "ai-agents": "✦"
};

const discoverItems = [
  {
    route: "marketplace",
    title: "Marketplace",
    description: "Explore products, services, sellers and listings."
  },
  {
    route: "businesses",
    title: "Businesses",
    description: "Explore businesses and their available trust information."
  },
  {
    route: "people",
    title: "People",
    description: "Discover public and professional profiles."
  },
  {
    route: "products",
    title: "Products",
    description: "Research products and compare available information."
  },
  {
    route: "services",
    title: "Services",
    description: "Discover service providers and available services."
  },
  {
    route: "jobs",
    title: "Jobs",
    description: "Explore jobs and employment opportunities."
  },
  {
    route: "opportunities",
    title: "Opportunities",
    description: "Explore partnerships and other opportunities."
  },
  {
    route: "information",
    title: "Information",
    description: "Investigate claims, sources and information."
  }
];

let currentProfile = {};
let searchQuery = "";

const getElement = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return replacements[character];
  });
}

function getUser() {
  return window.trustNetFirebaseUser || null;
}

function getName() {
  const user = getUser();

  return currentProfile.fullName ||
    user?.displayName ||
    "TrustNet User";
}

function getUsername() {
  return currentProfile.username
    ? `@${currentProfile.username}`
    : "TrustNet member";
}

function getInitials(name) {
  return String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "U";
}

function getPhotoURL() {
  return currentProfile.photoURL ||
    getUser()?.photoURL ||
    "";
}

function avatarMarkup(className = "profile-avatar") {
  const photo = getPhotoURL();

  if (photo) {
    return `
      <div class="${className}">
        <img
          src="${escapeHTML(photo)}"
          alt="Profile photo"
          referrerpolicy="no-referrer"
        >
      </div>
    `;
  }

  return `
    <div class="${className}">
      ${escapeHTML(getInitials(getName()))}
    </div>
  `;
}

/* ==========================================
   TOAST NOTIFICATIONS
========================================== */

export function showToast(message, type = "success") {
  const container = getElement("toastContainer");

  if (!container) return;

  const toast = document.createElement("div");

  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;

  container.appendChild(toast);

  window.setTimeout(() => toast.remove(), 3500);
}

/* ==========================================
   PROFILE DISPLAY
========================================== */

export function setProfile(profile = {}) {
  currentProfile = profile;

  const name = getName();
  const username = getUsername();
  const photo = getPhotoURL();

  const sidebarName = getElement("sidebarUserName");
  const sidebarUsername = getElement("sidebarUsername");
  const headerName = getElement("headerUserName");

  if (sidebarName) sidebarName.textContent = name;
  if (sidebarUsername) sidebarUsername.textContent = username;
  if (headerName) headerName.textContent = name;

  const avatarTargets = [
    getElement("sidebarAvatar"),
    getElement("headerAvatar")
  ];

  avatarTargets.forEach(target => {
    if (!target) return;

    if (photo) {
      const img = document.createElement("img");

      img.src = photo;
      img.alt = "Profile photo";
      img.referrerPolicy = "no-referrer";

      target.replaceChildren(img);
    } else {
      target.textContent = getInitials(name);
    }
  });
}

/* ==========================================
   PROFILE PAGE
========================================== */

function renderProfile() {
  const user = getUser();

  return `
    <div class="page-heading">
      <div>
        <span class="section-kicker">YOUR ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Manage and view your TrustNet identity.</p>
      </div>
    </div>

    <article class="profile-card">

      <div class="profile-card-top">
        ${avatarMarkup("profile-large-avatar")}

        <div>
          <h2>${escapeHTML(getName())}</h2>
          <p>${escapeHTML(getUsername())}</p>
          <span class="status-pill success" style="margin-top:9px">
            Authenticated account
          </span>
        </div>
      </div>

      <div class="profile-fields">

        <div class="profile-field">
          <label>Full name</label>
          <strong>${escapeHTML(currentProfile.fullName || "Not provided")}</strong>
        </div>

        <div class="profile-field">
          <label>Username</label>
          <strong>${escapeHTML(currentProfile.username || "Not provided")}</strong>
        </div>

        <div class="profile-field">
          <label>Email address</label>
          <strong>${escapeHTML(user?.email || "Not available")}</strong>
        </div>

        <div class="profile-field">
          <label>Country</label>
          <strong>${escapeHTML(currentProfile.country || "Not provided")}</strong>
        </div>

        <div class="profile-field full">
          <label>Bio</label>
          <strong>${escapeHTML(currentProfile.bio || "No bio added yet.")}</strong>
        </div>

      </div>

      <div style="padding:0 20px 20px">
        <p class="small-note">
          Profile editing is not connected yet. This page currently displays
          your existing Firebase profile information.
        </p>
      </div>

    </article>
  `;
}

/* ==========================================
   OVERVIEW PAGE
========================================== */

function renderOverview() {
  const firstName = escapeHTML(getName().trim().split(/\s+/)[0]);

  const profileCompletion =
    currentProfile.profileComplete === true ? "Complete" : "Incomplete";

  return `
    <section class="welcome-section">

      <div class="welcome-content">

        <span class="welcome-eyebrow">
          YOUR TRUST INTELLIGENCE HUB
        </span>

        <h1>
          Welcome back,
          <span class="gradient-text">${firstName}</span>
        </h1>

        <p>
          Explore information, people, businesses, products and
          opportunities with greater confidence.
        </p>

      </div>

      <div class="welcome-visual">
        <div class="orb orb-one"></div>
        <div class="orb orb-two"></div>
        <div class="orb orb-three"></div>

        <div class="trust-core">
          <div class="trust-core-ring"></div>
          <span class="trust-core-symbol">T</span>
        </div>
      </div>

    </section>

    <!-- QUICK ACTIONS -->
    <section class="section-block">

      <div class="section-heading">
        <div>
          <span class="section-kicker">QUICK ACTIONS</span>
          <h2>What do you want to check?</h2>
        </div>
      </div>

      <div class="quick-actions-grid">

        <a href="#information" class="quick-action-card" data-go="information">
          <div class="quick-action-icon">◈</div>
          <div>
            <strong>Check Information</strong>
            <span>Examine claims, sources and content.</span>
          </div>
          <span class="card-arrow">→</span>
        </a>

        <a href="#products" class="quick-action-card" data-go="products">
          <div class="quick-action-icon">◇</div>
          <div>
            <strong>Check a Product</strong>
            <span>Explore product and listing signals.</span>
          </div>
          <span class="card-arrow">→</span>
        </a>

        <a href="#businesses" class="quick-action-card" data-go="businesses">
          <div class="quick-action-icon">▣</div>
          <div>
            <strong>Check a Business</strong>
            <span>Review business trust signals.</span>
          </div>
          <span class="card-arrow">→</span>
        </a>

        <a href="#decisions" class="quick-action-card" data-go="decisions">
          <div class="quick-action-icon">✦</div>
          <div>
            <strong>Analyze a Decision</strong>
            <span>Compare evidence, risks and options.</span>
          </div>
          <span class="card-arrow">→</span>
        </a>

      </div>

    </section>

    <!-- ACCOUNT OVERVIEW -->
    <section class="section-block">

      <div class="section-heading">
        <div>
          <span class="section-kicker">YOUR TRUSTNET</span>
          <h2>Account overview</h2>
        </div>

        <button class="text-link" data-go="trust-score">
          View trust score →
        </button>
      </div>

      <div class="overview-grid">

        <article class="overview-card">
          <div class="overview-card-top">
            <span class="overview-icon">◈</span>
            <span class="overview-status">ACCOUNT</span>
          </div>
          <strong class="overview-value">Active</strong>
          <span class="overview-label">Account status</span>
        </article>

        <article class="overview-card">
          <div class="overview-card-top">
            <span class="overview-icon">✓</span>
            <span class="overview-status">PROFILE</span>
          </div>
          <strong class="overview-value">${profileCompletion}</strong>
          <span class="overview-label">Profile completion</span>
        </article>

        <article class="overview-card">
          <div class="overview-card-top">
            <span class="overview-icon">◇</span>
            <span class="overview-status">ACTIVITY</span>
          </div>
          <strong class="overview-value">—</strong>
          <span class="overview-label">Recent activities</span>
        </article>

        <article class="overview-card">
          <div class="overview-card-top">
            <span class="overview-icon">♢</span>
            <span class="overview-status">ALERTS</span>
          </div>
          <strong class="overview-value">—</strong>
          <span class="overview-label">Important alerts</span>
        </article>

      </div>

      <p class="small-note" style="margin-top:9px">
        Activity and alert statistics will display once their respective
        Firestore services are connected.
      </p>

    </section>

    <!-- DISCOVER -->
    <section class="section-block">

      <div class="section-heading">
        <div>
          <span class="section-kicker">DISCOVER</span>
          <h2>Explore TrustNet</h2>
        </div>

        <button class="text-link" data-go="discover">
          View all →
        </button>
      </div>

      <div class="discover-grid">

        <a href="#marketplace" class="discover-card featured" data-go="marketplace">
          <div class="discover-card-glow"></div>
          <span class="discover-icon">◫</span>

          <div class="discover-content">
            <span class="discover-category">MARKETPLACE</span>
            <h3>Buy and discover with more confidence.</h3>
            <p>Explore listings, sellers, products and trust signals.</p>
          </div>

          <span class="discover-arrow">→</span>
        </a>

        ${[
          ["businesses", "BUSINESSES", "Understand who you're dealing with.", "Explore business profiles and signals.", "▣"],
          ["people", "PEOPLE", "Discover people and profiles.", "Understand available trust information.", "◉"],
          ["services", "SERVICES", "Find services with confidence.", "Explore providers and relevant signals.", "✦"],
          ["jobs", "JOBS", "Explore employment opportunities.", "Review job and opportunity information.", "▤"],
          ["information", "INFORMATION", "Investigate information.", "Examine claims, sources and evidence.", "i"]
        ].map(([route, category, heading, description, icon]) => `
          <a href="#${route}" class="discover-card" data-go="${route}">
            <span class="discover-icon">${icon}</span>
            <div class="discover-content">
              <span class="discover-category">${category}</span>
              <h3>${heading}</h3>
              <p>${description}</p>
            </div>
            <span class="discover-arrow">→</span>
          </a>
        `).join("")}

      </div>

    </section>

    <!-- ACTIVITY / NOTIFICATIONS -->
    <section class="split-section">

      <div class="panel-card">

        <div class="panel-heading">
          <div>
            <span class="section-kicker">ACTIVITY</span>
            <h2>Recent activity</h2>
          </div>
          <span class="panel-live">ACCOUNT</span>
        </div>

        <div class="activity-list">
          <div class="empty-state">
            <div class="empty-icon">◇</div>
            <strong>No activity yet</strong>
            <p>Your TrustNet activity will appear here as you use the platform.</p>
          </div>
        </div>

      </div>

      <div class="panel-card">

        <div class="panel-heading">
          <div>
            <span class="section-kicker">UPDATES</span>
            <h2>Notifications</h2>
          </div>
          <button class="text-link" data-go="notifications">View all</button>
        </div>

        <div class="notification-list">
          <div class="empty-state">
            <div class="empty-icon">♢</div>
            <strong>You're all caught up</strong>
            <p>Important TrustNet updates will appear here.</p>
          </div>
        </div>

      </div>

    </section>

    <!-- INTELLIGENCE -->
    <section class="intelligence-card">

      <div class="intelligence-background">
        <div class="intelligence-orb orb-a"></div>
        <div class="intelligence-orb orb-b"></div>
      </div>

      <div class="intelligence-content">
        <span class="section-kicker">TRUST INTELLIGENCE</span>

        <h2>Have something you're unsure about?</h2>

        <p>
          TrustNet can help organize evidence, identify signals,
          compare information and surface questions worth investigating.
        </p>

        <div class="intelligence-actions">
          <button class="primary-button" data-go="information">
            Analyze something <span>→</span>
          </button>

          <button class="secondary-button" data-go="discover">
            Explore information
          </button>
        </div>
      </div>

      <div class="intelligence-visual">
        <div class="intelligence-ring ring-one"></div>
        <div class="intelligence-ring ring-two"></div>
        <div class="intelligence-ring ring-three"></div>
        <div class="intelligence-center">T</div>
      </div>

    </section>

    ${renderFooter()}
  `;
}

/* ==========================================
   DISCOVER PAGE
========================================== */

function renderDiscover() {
  return `
    <div class="page-heading">
      <div>
        <span class="section-kicker">GLOBAL DISCOVERY</span>
        <h1>Discover TrustNet</h1>
        <p>Explore people, businesses, products, services and opportunities.</p>
      </div>
    </div>

    <form class="search-page-form" id="discoverSearchForm">
      <input
        class="form-control"
        id="discoverSearchInput"
        type="search"
        placeholder="Search TrustNet..."
        value="${escapeHTML(searchQuery)}"
      >
      <button type="submit" class="button button-primary">Search</button>
    </form>

    <div class="module-grid">

      ${discoverItems.map(item => `
        <article class="module-card">
          <div class="module-card-icon">${routeIcons[item.route] || "◇"}</div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description)}</p>
          <button class="text-link" data-go="${item.route}" style="margin-top:12px">
            Explore →
          </button>
        </article>
      `).join("")}

    </div>

    <div class="module-placeholder">
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <strong>${searchQuery ? "Search service not connected" : "Your discoveries start here"}</strong>
        <p>
          ${searchQuery
            ? `Your search for "${escapeHTML(searchQuery)}" has been entered, but live discovery results still need a search backend.`
            : "Live search, filters, recommendations and saved discoveries will be added when the discovery service is implemented."
          }
        </p>
      </div>
    </div>
  `;
}

/* ==========================================
   TRUST SCORE PAGE
========================================== */

function renderTrustScore() {
  return `
    <div class="page-heading">
      <div>
        <span class="section-kicker">TRUST INTELLIGENCE</span>
        <h1>Trust Score</h1>
        <p>Understand trust indicators, evidence and assessment history.</p>
      </div>
    </div>

    <article class="module-placeholder">
      <div class="empty-state">
        <div class="empty-icon">◇</div>
        <strong>No personal Trust Score available</strong>
        <p>
          TrustNet does not automatically assign a personal trust score
          from account creation. Any future score must be based on a
          transparent methodology, appropriate evidence and clear explanations.
        </p>
      </div>
    </article>
  `;
}

/* ==========================================
   MODULE PAGE
========================================== */

function renderModule(route) {
  const module = routes[route];
  const icon = routeIcons[route] || "◇";

  return `
    <div class="page-heading">
      <div>
        <span class="section-kicker">TRUSTNET ECOSYSTEM</span>
        <h1>${escapeHTML(module.title)}</h1>
        <p>${escapeHTML(module.description)}</p>
      </div>
    </div>

    <div class="module-grid">
      <article class="module-card">
        <div class="module-card-icon">${icon}</div>
        <h3>${escapeHTML(module.title)}</h3>
        <p>${escapeHTML(module.description)}</p>
        <span class="status-pill pending">Foundation created</span>
      </article>
    </div>

    <article class="module-placeholder">
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <strong>${escapeHTML(module.title)} is being developed</strong>
        <p>
          This page has its own navigation route and dashboard interface.
          Its database, API, security rules and full interactive features
          still need to be implemented.
        </p>

        <button class="button button-primary" data-go="overview" style="margin-top:15px">
          Return to dashboard
        </button>
      </div>
    </article>
  `;
}

/* ==========================================
   SETTINGS PAGE
========================================== */

function renderSettings() {
  const user = getUser();

  return `
    <div class="page-heading">
      <div>
        <span class="section-kicker">ACCOUNT MANAGEMENT</span>
        <h1>Settings</h1>
        <p>Manage your TrustNet account and preferences.</p>
      </div>
    </div>

    <div class="module-placeholder">

      <h3 style="font-size:13px">Account information</h3>

      <p class="small-note" style="margin-top:8px">
        Signed in as ${escapeHTML(user?.email || "Unknown account")}
      </p>

      <button class="button" data-go="profile" style="margin-top:15px">
        View profile
      </button>

      <div style="border-top:1px solid var(--border);margin-top:20px;padding-top:18px">
        <h3 style="font-size:13px">Privacy and security</h3>
        <p class="small-note" style="margin-top:8px">
          Privacy preferences, session management, account deletion,
          notification controls and blocked accounts will be implemented
          in a later security development phase.
        </p>
      </div>

      <div style="border-top:1px solid var(--border);margin-top:20px;padding-top:18px">
        <h3 style="font-size:13px">Sign out</h3>
        <p class="small-note" style="margin-top:8px">
          End your current TrustNet session.
        </p>
        <button class="button button-primary" id="settingsLogout" style="margin-top:12px">
          Sign out
        </button>
      </div>

    </div>
  `;
}

/* ==========================================
   NOTIFICATIONS / MESSAGES
========================================== */

function renderEmptyPage(route) {
  const module = routes[route];

  const icon = routeIcons[route] || "◇";

  return `
    <div class="page-heading">
      <div>
        <span class="section-kicker">YOUR TRUSTNET</span>
        <h1>${escapeHTML(module.title)}</h1>
        <p>${escapeHTML(module.description)}</p>
      </div>
    </div>

    <article class="module-placeholder">
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <strong>No ${escapeHTML(module.title.toLowerCase())} to display</strong>
        <p>
          This page is ready for its next development phase.
          Its data service has not been connected yet.
        </p>
      </div>
    </article>
  `;
}

/* ==========================================
   FOOTER
========================================== */

function renderFooter() {
  return `
    <footer class="dashboard-footer">
      <div class="footer-brand">
        <span class="footer-symbol">T</span>
        <span>TrustNet</span>
      </div>

      <div class="footer-links">
        <button data-go="profile">Profile</button>
        <button data-go="settings">Settings</button>
        <button data-go="information">Help</button>
      </div>

      <span class="footer-copy">
        © ${new Date().getFullYear()} TrustNet. Trust intelligence for the connected world.
      </span>
    </footer>
  `;
}

/* ==========================================
   ROUTE RENDERER
========================================== */

function renderRoute(route) {
  if (route === "overview") return renderOverview();
  if (route === "discover") return renderDiscover();
  if (route === "trust-score") return renderTrustScore();
  if (route === "profile") return renderProfile();
  if (route === "settings") return renderSettings();

  if (route === "notifications" || route === "messages") {
    return renderEmptyPage(route);
  }

  return renderModule(route);
}

/* ==========================================
   NAVIGATION
========================================== */

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("mobile-open");
  document.getElementById("sidebarOverlay")?.classList.remove("active");
}

function closeQuickCheck() {
  const modal = getElement("quickCheckModal");

  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  getElement("quickCheckButton")?.focus();
}

export function navigate(route, options = {}) {
  if (!routes[route]) {
    route = "overview";
  }

  const content = getElement("dashboardContent");

  if (!content) return;

  if (options.updateHash !== false) {
    const targetHash = `#${route}`;

    if (window.location.hash !== targetHash) {
      window.history.pushState({ route }, "", targetHash);
    }
  }

  document.querySelectorAll("[data-route]").forEach(link => {
    const active = link.dataset.route === route;

    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const breadcrumb = getElement("breadcrumbCurrent");

  if (breadcrumb) {
    breadcrumb.textContent = routes[route].title;
  }

  content.innerHTML = renderRoute(route);

  closeSidebar();
  closeQuickCheck();

  content.scrollIntoView({
    behavior: "auto",
    block: "start"
  });
}

/* ==========================================
   QUICK CHECK
========================================== */

function openQuickCheck() {
  const modal = getElement("quickCheckModal");

  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  getElement("quickCheckClose")?.focus();
}

/* ==========================================
   EVENT LISTENERS
========================================== */

function initializeNavigation() {
  const navigation = getElement("sidebarNavigation");

  navigation?.addEventListener("click", event => {
    const link = event.target.closest("[data-route]");

    if (!link) return;

    event.preventDefault();
    navigate(link.dataset.route);
  });

  document.addEventListener("click", event => {
    const target = event.target.closest("[data-go]");

    if (!target) return;

    event.preventDefault();
    navigate(target.dataset.go);
  });

  window.addEventListener("popstate", () => {
    const route = window.location.hash.slice(1) || "overview";

    navigate(route, { updateHash: false });
  });

  getElement("sidebarProfile")?.addEventListener("click", () => {
    navigate("profile");
  });

  getElement("headerUser")?.addEventListener("click", () => {
    navigate("profile");
  });

  getElement("headerNotifications")?.addEventListener("click", () => {
    navigate("notifications");
  });

  getElement("headerMessages")?.addEventListener("click", () => {
    navigate("messages");
  });

  getElement("menuButton")?.addEventListener("click", () => {
    getElement("sidebar")?.classList.add("mobile-open");
    getElement("sidebarOverlay")?.classList.add("active");
  });

  getElement("sidebarClose")?.addEventListener("click", closeSidebar);
  getElement("sidebarOverlay")?.addEventListener("click", closeSidebar);

  getElement("quickCheckButton")?.addEventListener("click", openQuickCheck);
  getElement("quickCheckClose")?.addEventListener("click", closeQuickCheck);

  getElement("quickCheckModal")?.addEventListener("click", event => {
    if (event.target.id === "quickCheckModal") {
      closeQuickCheck();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeSidebar();
      closeQuickCheck();
    }

    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
    ) {
      event.preventDefault();
      getElement("globalSearch")?.focus();
    }
  });

  getElement("globalSearchForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const value = getElement("globalSearch")?.value.trim() || "";

    if (!value) {
      showToast("Enter something to search.");
      return;
    }

    searchQuery = value;
    navigate("discover");
  });

  document.addEventListener("submit", event => {
    if (event.target.id !== "discoverSearchForm") return;

    event.preventDefault();

    searchQuery =
      getElement("discoverSearchInput")?.value.trim() || "";

    if (!searchQuery) {
      showToast("Enter something to search.");
      return;
    }

    navigate("discover");
  });

  document.addEventListener("click", event => {
    if (event.target.closest("#settingsLogout")) {
      getElement("logoutButton")?.click();
    }
  });
}

/* ==========================================
   INITIALIZE ROUTER
========================================== */

export function initializeDashboardRouter() {
  initializeNavigation();

  const initialRoute =
    window.location.hash.slice(1) || "overview";

  navigate(initialRoute, { updateHash: false });
}
