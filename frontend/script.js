// Fix macOS NSSpellServer timeout spam by disabling spellcheck globally
const disableSpellcheck = (el) => {
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    el.spellcheck = false;
    el.autocomplete = "off";
    el.autocorrect = "off";
    el.autocapitalize = "off";
  }
};

// Initial pass for existing elements
document.querySelectorAll("input, textarea").forEach(disableSpellcheck);

// Observer for dynamically mounted React components
const spellcheckObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
          disableSpellcheck(node);
        }
        node.querySelectorAll("input, textarea").forEach(disableSpellcheck);
      }
    });
  });
});

spellcheckObserver.observe(document.body, { childList: true, subtree: true });

// Lazy loaded component mounting system with memory management
let activeRoots = new Map();
const mountStageLazy = async (stage) => {
  // Use canonical keys for shared components to prevent redundant remounting
  let canonicalKey = stage;
  if (stage === "member-profiles" || stage === "past-members") {
    canonicalKey = "member-profile-shared";
  } else if (stage === "membership-plans" || stage === "membership-pricing") {
    canonicalKey = "membership-plans-shared";
  } else if (stage === "daily-checkin" || stage === "attendance") {
    canonicalKey = "daily-checkin-shared";
  }

  if (activeRoots.has(canonicalKey)) return;
  
  let mountPromise;
  if (stage === "member-profiles" || stage === "past-members") {
    mountPromise = import("./memberProfilesDashboard.jsx").then(m => m.mountMemberProfilesDashboard(stage));
  } else if (stage === "membership-plans" || stage === "membership-pricing") {
    mountPromise = import("./MembershipPlans.jsx").then(m => m.mountMembershipPlans());
  } else if (stage === "expiring-memberships") {
    mountPromise = import("./ExpiringMemberships.jsx").then(m => m.mountExpiringMemberships());
  } else if (stage === "freeze-pause") {
    mountPromise = import("./FreezePause.jsx").then(m => m.mountFreezePause());
  } else if (stage === "daily-checkin" || stage === "attendance") {
    mountPromise = import("./DailyCheckin.jsx").then(m => m.mountDailyCheckin());
  } else if (stage === "manual-entry") {
    mountPromise = import("./ManualEntry.jsx").then(m => m.mountManualEntry());
  } else if (stage === "attendance-reports") {
    mountPromise = import("./AttendanceReports.jsx").then(m => m.mountAttendanceReports());
  } else if (stage === "payments") {
    mountPromise = import("./CollectFees.jsx").then(m => m.mountCollectFees());
  }
  
  if (mountPromise) {
    const root = await mountPromise;
    if (root) activeRoots.set(canonicalKey, root);
  }
};

const unmountInactiveStages = (currentStage) => {
  // Determine the canonical key for the current stage
  let currentCanonicalKey = currentStage;
  if (currentStage === "member-profiles" || currentStage === "past-members") {
    currentCanonicalKey = "member-profile-shared";
  } else if (currentStage === "membership-plans" || currentStage === "membership-pricing") {
    currentCanonicalKey = "membership-plans-shared";
  } else if (currentStage === "daily-checkin" || currentStage === "attendance") {
    currentCanonicalKey = "daily-checkin-shared";
  }

  // Keep dashboard and the current stage, unmount everything else to save RAM
  for (const [stage, root] of activeRoots.entries()) {
    if (stage !== currentCanonicalKey && stage !== "dashboard") {
      try {
        root.unmount();
        activeRoots.delete(stage);
        console.log(`GymDeck: Unmounted ${stage} to optimize memory`);
      } catch (err) {
        console.warn(`GymDeck: Failed to unmount ${stage}:`, err);
      }
    }
  }
};

// Post-Login Welcome Sequence
const initWelcome = () => {
  const enterMode = sessionStorage.getItem("gymdeck-enter");

  if (enterMode === "dashboard") {
    sessionStorage.removeItem("gymdeck-enter");
    
    const shell = document.querySelector(".page-shell");
    if (shell) shell.classList.add("is-loading");

    // Safety fallback: reveal dashboard after 3.5s if overlay fails
    const safetyTimeout = setTimeout(() => {
      if (shell && shell.classList.contains("is-loading")) {
        shell.classList.remove("is-loading");
        document.documentElement.classList.add("dashboard-enter-active");
      }
    }, 3500);

    import("./WelcomeOverlay.jsx").then(({ mountWelcomeOverlay }) => {
      mountWelcomeOverlay("Admin", () => {
        clearTimeout(safetyTimeout);
        if (shell) {
          shell.classList.remove("is-loading");
          document.documentElement.classList.add("dashboard-enter-active");
          
          // Initialize dashboard widgets after welcome overlay
          import("./DashboardWidgets.jsx").then(m => m.mountDashboardWidgets());
        }
      });
    });
  } else if (document.documentElement.classList.contains("dashboard-enter")) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add("dashboard-enter-active");
        // Initialize dashboard widgets for direct entries
        import("./DashboardWidgets.jsx").then(m => m.mountDashboardWidgets());
      });
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWelcome);
} else {
  initWelcome();
}

document.querySelectorAll(".icon-btn, .join-btn, .dots, .slider-nav button, .follow-btn, .see-all-btn, .plus-btn, .launch-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
const sidebar = document.querySelector(".sidebar");
const pageShell = document.querySelector(".page-shell");
const sidebarMenuScroll = document.querySelector(".sidebar-menu-scroll");
const sidebarScrollIndicator = document.querySelector("[data-sidebar-scroll-indicator]");
const sidebarScrollThumb = document.querySelector("[data-sidebar-scroll-thumb]");
const mobileNavBreakpoint = window.matchMedia("(max-width: 1024px)");
const logoutTrigger = document.querySelector(".logout");
const logoutDialog = document.querySelector(".logout-dialog");
const logoutBackdrop = document.querySelector(".logout-dialog-backdrop");
const logoutCancel = document.querySelector("[data-logout-cancel]");
const logoutConfirm = document.querySelector("[data-logout-confirm]");
const documentModal = document.querySelector(".document-modal");
const documentModalBackdrop = document.querySelector(".document-modal-backdrop");
const documentCloseButtons = Array.from(document.querySelectorAll("[data-document-close]"));
const documentViewButtons = Array.from(document.querySelectorAll(".doc-view-btn"));
const photoViewButtons = Array.from(document.querySelectorAll("[data-photo-view]"));
const documentMemberLabel = document.querySelector("[data-document-member]");
const documentTypeLabel = document.querySelector("[data-document-type]");
const documentFigure = document.querySelector("[data-document-figure]");
const documentImage = document.querySelector("[data-document-image]");
const addMemberModal = document.querySelector(".member-form-modal");
const addMemberBackdrop = document.querySelector(".member-form-backdrop");
const addMemberOpenButtons = Array.from(document.querySelectorAll("[data-add-member-open]"));
const addMemberCloseButtons = Array.from(document.querySelectorAll("[data-add-member-close]"));
const addMemberForm = document.querySelector(".member-form-grid");
const addMemberSaveButton = document.querySelector("[data-member-save]");
const addMemberFormAlert = document.querySelector("[data-member-form-alert]");
const addMemberDatePicker = document.querySelector("[data-date-picker]");
const addMemberDobInput = document.querySelector("[data-member-dob-input]");
const addMemberDobDisplay = document.querySelector("[data-member-dob-display]");
const addMemberDobTrigger = document.querySelector("[data-member-dob-trigger]");
const addMemberDatePickerPanel = document.querySelector("[data-date-picker-panel]");
const addMemberDatePickerTitle = document.querySelector("[data-date-picker-title]");
const addMemberDatePickerMonth = document.querySelector("[data-date-picker-month]");
const addMemberDatePickerGrid = document.querySelector("[data-date-picker-grid]");
const addMemberDatePickerYears = document.querySelector("[data-date-picker-years]");
const addMemberDatePickerPrev = document.querySelector("[data-date-picker-prev]");
const addMemberDatePickerNext = document.querySelector("[data-date-picker-next]");
const addMemberDatePickerToday = document.querySelector("[data-date-picker-today]");
const addMemberDatePickerClear = document.querySelector("[data-date-picker-clear]");
const addMemberUploadInputs = Array.from(document.querySelectorAll("[data-member-upload-input]"));
const addMemberUploadTriggers = Array.from(document.querySelectorAll("[data-member-upload-trigger]"));
const addMemberUploadRemoveButtons = Array.from(document.querySelectorAll("[data-member-upload-remove]"));
const logoutDestination = "../index.html";
const authStorageKey = "gymdeck-authenticated";
const overviewLinks = Array.from(document.querySelectorAll(".sidebar [data-view]"));
const navDropdowns = Array.from(document.querySelectorAll("[data-nav-dropdown]"));
const navDropdownToggles = Array.from(document.querySelectorAll("[data-nav-dropdown-toggle]"));
const dashboardStage = document.querySelector('[data-stage="dashboard"]');
const membersStage = document.querySelector('[data-stage="members"]');
const memberProfileStage = document.querySelector('[data-stage="member-profile"]');
const comingSoonStage = document.querySelector('[data-stage="coming-soon"]');
const comingSoonFeature = document.querySelector(".coming-soon-feature");
const comingSoonButtons = Array.from(document.querySelectorAll("[data-view-target]"));
const memberSearchInput = document.querySelector("[data-member-search]");
const memberCount = document.querySelector("[data-member-count]");
const memberFilterButtons = Array.from(document.querySelectorAll("[data-member-filter]"));
const membersRefreshButton = document.querySelector(".members-icon-btn");
const membersEmptyState = document.querySelector("[data-members-empty]");
const membersTableBody = document.querySelector(".members-table tbody");

// Create a DOM cache for frequently accessed dynamic stages
const DOM = {
  get membershipPlansStage() { return document.querySelector('[data-stage="membership-plans"]'); },
  get expiringMembershipsStage() { return document.querySelector('[data-stage="expiring-memberships"]'); },
  get freezePauseStage() { return document.querySelector('[data-stage="freeze-pause"]'); },
  get dailyCheckinStage() { return document.querySelector('[data-stage="daily-checkin"]'); },
  get manualEntryStage() { return document.querySelector('[data-stage="manual-entry"]'); },
  get attendanceReportsStage() { return document.querySelector('[data-stage="attendance-reports"]'); },
  get paymentsStage() { return document.querySelector('[data-stage="payments"]'); }
};
const viewLabels = {
  dashboard: "Dashboard",
  members: "All Members",
  "add-new-member": "Add New Member",
  "member-profiles": "Member Profiles",
  "past-members": "Past Members",
  "membership-plans": "Membership Plans",
  "expiring-memberships": "Expiring Memberships",
  "freeze-pause": "Freeze / Pause",
  "daily-checkin": "Daily Check-in",
  attendance: "Daily Check-in",
  "manual-entry": "Manual Entry",
  "attendance-reports": "Attendance Reports",
  payments: "Collect Fees",
  "pending-dues": "Pending Dues",
  "payment-history": "Payment History",
  "generate-receipt": "Generate Receipt",
  "renew-membership": "Renew Membership",
  trainers: "All Trainers",
  "assign-trainer": "Assign Trainer",
  "trainer-schedule": "Trainer Schedule",
  "staff-roles": "Staff Roles",
  "personal-training": "PT Clients",
  "pt-packages": "PT Packages",
  "session-tracking": "Session Tracking",
  "trainer-earnings": "Trainer Earnings",
  "notify-members": "Send Notification",
  "whatsapp-alerts": "WhatsApp Alerts",
  "renewal-reminders": "Renewal Reminders",
  announcements: "Announcements",
  "revenue-reports": "Revenue Report",
  "attendance-analytics": "Attendance Trends",
  "member-growth": "Membership Growth",
  "trainer-performance": "Trainer Performance",
  documents: "Member Documents",
  "id-proofs": "ID Proofs",
  agreements: "Agreements",
  settings: "Settings",
  "gym-profile": "Gym Profile",
  "membership-pricing": "Membership Pricing",
  "app-settings": "App Settings",
  "backup-restore": "Backup & Restore",
  "sync-status": "Device Sync (QR)",
  account: "Profile"
};
const previewOrder = Object.keys(viewLabels).filter((view) => view !== "dashboard");
const MEMBER_DELETED_STORAGE_KEY = "gymdeck-deleted-member-ids";
let lastFocusedElement = null;
let activeView = "dashboard";
let activeMemberFilter = "all";
let lastDocumentTrigger = null;
let lastAddMemberTrigger = null;
let activeCalendarDate = new Date();
let datePickerMode = "day";
const uploadPreviewUrls = new WeakMap();
let sidebarScrollFrame = null;
let sidebarScrollIdleTimeout = null;

const getMemberFormFields = () =>
  addMemberForm
    ? Array.from(addMemberForm.querySelectorAll(".member-field"))
    : [];

const setMenuState = (isOpen) => {
  document.body.classList.toggle("sidebar-open", isOpen);

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }
};

const syncSidebarScrollIndicator = () => {
  sidebarScrollFrame = null;

  if (!sidebar || !sidebarMenuScroll || !sidebarScrollIndicator || !sidebarScrollThumb) {
    return;
  }

  const maxScroll = sidebarMenuScroll.scrollHeight - sidebarMenuScroll.clientHeight;
  const canScroll = maxScroll > 1;

  sidebar.classList.toggle("has-menu-scroll", canScroll);

  if (!canScroll) {
    sidebarScrollThumb.style.setProperty("--sidebar-scroll-thumb-y", "0px");
    return;
  }

  const trackHeight = sidebarScrollIndicator.clientHeight;
  const thumbHeight = sidebarScrollThumb.offsetHeight;
  const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);
  const scrollProgress = sidebarMenuScroll.scrollTop / maxScroll;
  const thumbOffset = Math.round(scrollProgress * maxThumbOffset);

  sidebarScrollThumb.style.setProperty("--sidebar-scroll-thumb-y", `${thumbOffset}px`);
};

const scheduleSidebarScrollIndicatorSync = () => {
  if (sidebarScrollFrame !== null) {
    return;
  }

  sidebarScrollFrame = requestAnimationFrame(syncSidebarScrollIndicator);
};

const revealSidebarScrollIndicator = () => {
  if (!sidebar) {
    return;
  }

  sidebar.classList.add("is-menu-scrolling");
  window.clearTimeout(sidebarScrollIdleTimeout);
  sidebarScrollIdleTimeout = window.setTimeout(() => {
    sidebar.classList.remove("is-menu-scrolling");
  }, 650);
};

const refreshSidebarScrollIndicator = () => {
  scheduleSidebarScrollIndicatorSync();
  window.setTimeout(scheduleSidebarScrollIndicatorSync, 260);
};

const refreshSidebarRailAfterTransition = () => {
  refreshSidebarScrollIndicator();
  window.setTimeout(refreshSidebarScrollIndicator, 560);
};

const setSidebarRailExpanded = (isExpanded) => {
  pageShell?.classList.toggle("is-sidebar-expanded", isExpanded);
  refreshSidebarRailAfterTransition();
};

const setLogoutDialogState = (isOpen) => {
  if (!logoutDialog || !logoutBackdrop) {
    return;
  }

  if (isOpen) {
    lastFocusedElement = document.activeElement;
    logoutDialog.hidden = false;
    logoutBackdrop.hidden = false;
    document.body.classList.add("logout-dialog-open");
    logoutCancel?.focus();
    return;
  }

  document.body.classList.remove("logout-dialog-open");
  logoutDialog.hidden = true;
  logoutBackdrop.hidden = true;
  lastFocusedElement?.focus?.();
};

const setDocumentModalState = (isOpen, triggerButton = null) => {
  if (!documentModal || !documentModalBackdrop) {
    return;
  }

  if (isOpen) {
    lastDocumentTrigger = triggerButton || document.activeElement;
    documentModal.hidden = false;
    documentModalBackdrop.hidden = false;
    document.body.classList.add("document-modal-open");
    documentCloseButtons[0]?.focus();
    return;
  }

  document.body.classList.remove("document-modal-open");
  documentModal.hidden = true;
  documentModalBackdrop.hidden = true;
  lastDocumentTrigger?.focus?.();
};

const setAddMemberModalState = (isOpen, triggerButton = null) => {
  if (!addMemberModal || !addMemberBackdrop) {
    return;
  }

  if (isOpen) {
    lastAddMemberTrigger = triggerButton || document.activeElement;
    addMemberModal.hidden = false;
    addMemberBackdrop.hidden = false;
    
    // Force a reflow to ensure the transition triggers
    addMemberModal.offsetHeight;
    
    document.body.classList.add("member-form-open");
    addMemberModal.querySelector("input")?.focus();
    return;
  }

  document.body.classList.remove("member-form-open");
  
  // Wait for transition to finish before hiding (matching the 0.6s in CSS)
  setTimeout(() => {
    if (!document.body.classList.contains("member-form-open")) {
      addMemberModal.hidden = true;
      addMemberBackdrop.hidden = true;
      closeDatePicker();
      resetUploadFields();
    }
  }, 600);
  
  lastAddMemberTrigger?.focus?.();
};

const formatCalendarDate = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);

const formatCalendarValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseCalendarValue = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const closeDatePicker = () => {
  addMemberDatePickerPanel.hidden = true;
  addMemberDatePicker?.classList.remove("is-open");
  datePickerMode = "day";
};

const openDatePicker = () => {
  addMemberDatePickerPanel.hidden = false;
  addMemberDatePicker?.classList.add("is-open");
};

const setFieldErrorState = (field, message = "") => {
  const errorNode = field?.querySelector(".member-field-error");

  if (errorNode) {
    errorNode.hidden = true;
  }
};

const clearMemberFormErrors = () => {
  getMemberFormFields().forEach((field) => {
    setFieldErrorState(field, "");
  });

  if (addMemberFormAlert) {
    addMemberFormAlert.hidden = true;
    addMemberFormAlert.textContent = "";
  }
};

const clearUploadPreview = (input) => {
  const field = input.closest(".member-field");
  const preview = field?.querySelector("[data-member-upload-preview]");
  const image = field?.querySelector("[data-member-upload-image]");
  const pdf = field?.querySelector("[data-member-upload-pdf]");
  const existingUrl = uploadPreviewUrls.get(input);

  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    uploadPreviewUrls.delete(input);
  }

  if (image) {
    image.src = "";
    image.alt = "";
    image.hidden = true;
  }

  if (pdf) {
    pdf.src = "";
    pdf.hidden = true;
  }

  if (preview) {
    preview.hidden = true;
  }
};

const syncUploadMeta = (input) => {
  const field = input.closest(".member-field");
  const meta = field?.querySelector("[data-member-upload-meta]");

  if (!meta) {
    return;
  }

  const selectedFile = input.files?.[0];
  meta.textContent = selectedFile ? "" : "No file selected";
  meta.title = selectedFile ? "" : "No file selected";
  meta.hidden = Boolean(selectedFile);
};

const syncUploadPreview = (input) => {
  const field = input.closest(".member-field");
  const preview = field?.querySelector("[data-member-upload-preview]");
  const image = field?.querySelector("[data-member-upload-image]");
  const pdf = field?.querySelector("[data-member-upload-pdf]");
  const selectedFile = input.files?.[0];
  const label = input.dataset.uploadLabel || "Document";

  clearUploadPreview(input);

  if (!selectedFile || !preview || !image || !pdf) {
    return;
  }

  const objectUrl = URL.createObjectURL(selectedFile);
  uploadPreviewUrls.set(input, objectUrl);

  if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
    pdf.src = objectUrl;
    pdf.hidden = false;
  } else {
    image.src = objectUrl;
    image.alt = `${label} preview`;
    image.hidden = false;
  }

  preview.hidden = false;
};

const resetUploadFields = () => {
  addMemberUploadInputs.forEach((input) => {
    clearUploadPreview(input);
    input.value = "";
    syncUploadMeta(input);
  });
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "Not provided";
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(parsedDate);
};

const formatJoinDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatJoinTimeValue = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatJoinDateDisplay = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);

const formatJoinTimeDisplay = (date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getMemberRows = () => Array.from(document.querySelectorAll("[data-member-card]"));

const getMemberDobCells = () => Array.from(document.querySelectorAll("[data-member-dob]"));

const getMemberDisplayName = (row) =>
  row?.dataset.memberName ||
  row?.querySelector(".member-name-cell strong")?.textContent?.trim() ||
  row?.children[1]?.textContent?.trim() ||
  "Member Record";

const getMemberField = (label) =>
  addMemberForm?.querySelector(`.member-field[data-field-label="${label}"]`);

const getFieldValue = (label, selector = "input, textarea") =>
  getMemberField(label)?.querySelector(selector)?.value.trim() || "";

const resetMemberForm = () => {
  addMemberForm?.reset();

  if (addMemberDobInput) {
    addMemberDobInput.value = "";
  }

  syncDateDisplay();
  activeCalendarDate = new Date();
  datePickerMode = "day";
  renderDatePicker();
  closeDatePicker();
  resetUploadFields();
  clearMemberFormErrors();
};

const createMemberSearchIndex = (member) =>
  [
    member.name,
    member.contactNumber,
    member.alternateContact,
    member.email,
    member.dobDisplay,
    member.joiningDateDisplay,
    member.joiningTimeDisplay,
    member.height,
    member.weight,
    member.address,
    member.docsLabel
  ]
    .join(" ")
    .toLowerCase();

const bindMemberRowInteractions = (row) => {
  const photoButton = row.querySelector("[data-photo-view]");
  const documentButton = row.querySelector(".doc-view-btn");

  photoButton?.addEventListener("click", () => {
    const memberName = getMemberDisplayName(row);
    const memberImage = photoButton.querySelector("img");

    setDocumentModalContent({
      memberName,
      title: "Member Photo",
      imageSrc: memberImage?.src || "",
      imageAlt: memberImage?.alt || memberName
    });

    setDocumentModalState(true, photoButton);
  });

  documentButton?.addEventListener("click", (event) => {
    event.preventDefault();
    const memberName = getMemberDisplayName(row);
    const documentLabel = documentButton.previousElementSibling?.textContent?.trim() || "Residence Proof";

    setDocumentModalContent({
      memberName,
      title: documentLabel
    });

    setDocumentModalState(true, documentButton);
  });
};

const createMemberRow = (member) => {
  const row = document.createElement("tr");
  row.setAttribute("data-member-card", "");
  row.dataset.memberName = member.name;
  row.dataset.memberStatus = "verified";
  row.dataset.memberRecent = "true";
  row.dataset.search = createMemberSearchIndex(member);
  row.innerHTML = `
    <td data-label="Member">
      <button class="member-photo-btn" type="button" data-photo-view aria-label="View ${escapeHtml(member.name)} photo">
        <img class="member-photo" src="${escapeHtml(member.photoUrl)}" alt="${escapeHtml(member.name)}" />
      </button>
      <div class="member-name-cell">
        <strong>${escapeHtml(member.name)}</strong>
        <span>New registration</span>
      </div>
    </td>
    <td data-label="Contact">
      <div class="member-stack">
        <span><b>Primary</b> ${escapeHtml(member.contactNumber)}</span>
        <span><b>Alternate</b> ${escapeHtml(member.alternateContact)}</span>
        <span><b>Email</b> ${escapeHtml(member.email || "Not provided")}</span>
      </div>
    </td>
    <td data-label="Personal">
      <div class="member-metrics">
        <span data-member-dob="${escapeHtml(member.dobValue)}"><b>DOB</b> ${escapeHtml(member.dobDisplay)}</span>
        <span data-member-age><b>Age</b></span>
        <span><b>Height</b> ${escapeHtml(member.height || "-")}</span>
        <span><b>Weight</b> ${escapeHtml(member.weight || "-")}</span>
      </div>
    </td>
    <td data-label="Joined">
      <div class="member-metrics">
        <span data-member-joined-date="${escapeHtml(member.joiningDateValue)}"><b>Date</b> ${escapeHtml(member.joiningDateDisplay)}</span>
        <span data-member-joined-time="${escapeHtml(member.joiningTimeValue)}"><b>Time</b> ${escapeHtml(member.joiningTimeDisplay)}</span>
      </div>
    </td>
    <td data-label="Address">${escapeHtml(member.address)}</td>
    <td data-label="Documents">
      <div class="doc-cell">
        <span>${escapeHtml(member.docsLabel)}</span>
        <button class="doc-view-btn" type="button">View Document</button>
      </div>
    </td>
  `;
  bindMemberRowInteractions(row);
  return row;
};

const getNewMemberPayload = () => {
  const joinedAt = new Date();
  const fullName = getFieldValue("Full Name");
  const contactNumber = getFieldValue("Contact Number");
  const alternateContact = getFieldValue("Alternate Contact");
  const email = getFieldValue("Email Address");
  const dobValue = addMemberDobInput?.value || "";
  const govtDocument = getFieldValue("Govt Document");
  const proofOfResidence = getFieldValue("Proof of Residence");

  return {
    name: fullName,
    contactNumber,
    alternateContact,
    email,
    dobValue,
    dobDisplay: formatDisplayDate(dobValue),
    height: getFieldValue("Height"),
    weight: getFieldValue("Weight"),
    address: getFieldValue("Address"),
    docsLabel: [govtDocument, proofOfResidence].filter(Boolean).join(", "),
    joiningDateValue: formatJoinDateValue(joinedAt),
    joiningTimeValue: formatJoinTimeValue(joinedAt),
    joiningDateDisplay: formatJoinDateDisplay(joinedAt),
    joiningTimeDisplay: formatJoinTimeDisplay(joinedAt),
    photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName || "GymDeckMember")}`
  };
};

const syncDateDisplay = () => {
  const selectedDate = parseCalendarValue(addMemberDobInput?.value || "");

  if (!selectedDate || !addMemberDobDisplay) {
    if (addMemberDobDisplay) {
      addMemberDobDisplay.value = "";
    }
    return;
  }

  addMemberDobDisplay.value = formatCalendarDate(selectedDate);
};

const renderDatePicker = () => {
  if (!addMemberDatePickerGrid || !addMemberDatePickerMonth || !addMemberDatePickerYears) {
    return;
  }

  const visibleYear = activeCalendarDate.getFullYear();
  const visibleMonth = activeCalendarDate.getMonth();
  const monthStart = new Date(visibleYear, visibleMonth, 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const selectedValue = addMemberDobInput?.value || "";
  const todayValue = formatCalendarValue(new Date());

  addMemberDatePickerMonth.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(monthStart);

  addMemberDatePickerGrid.hidden = datePickerMode === "year";
  const weekdays = addMemberDatePickerGrid.previousElementSibling;

  if (weekdays) {
    weekdays.hidden = datePickerMode === "year";
  }

  addMemberDatePickerYears.hidden = datePickerMode !== "year";
  addMemberDatePickerGrid.innerHTML = "";
  addMemberDatePickerYears.innerHTML = "";

  if (datePickerMode === "year") {
    const selectedDate = parseCalendarValue(selectedValue);
    const selectedYear = selectedDate?.getFullYear() ?? visibleYear;
    const currentYear = new Date().getFullYear();
    const baseYear = visibleYear - 7;

    Array.from({ length: 16 }).forEach((_, index) => {
      const year = baseYear + index;
      const yearButton = document.createElement("button");

      yearButton.type = "button";
      yearButton.className = "date-picker-year";
      yearButton.textContent = String(year);

      if (year === currentYear) {
        yearButton.classList.add("is-current");
      }

      if (year === selectedYear) {
        yearButton.classList.add("is-selected");
      }

      yearButton.addEventListener("click", () => {
        activeCalendarDate = new Date(year, activeCalendarDate.getMonth(), 1);
        datePickerMode = "day";
        renderDatePicker();
      });

      addMemberDatePickerYears.append(yearButton);
    });

    return;
  }

  Array.from({ length: 42 }).forEach((_, index) => {
    const dayDate = new Date(gridStart);
    dayDate.setDate(gridStart.getDate() + index);
    const dayValue = formatCalendarValue(dayDate);
    const dayButton = document.createElement("button");
    const isMuted = dayDate.getMonth() !== visibleMonth;

    dayButton.type = "button";
    dayButton.className = "date-picker-day";
    dayButton.textContent = String(dayDate.getDate());
    dayButton.dataset.dateValue = dayValue;

    if (isMuted) {
      dayButton.classList.add("is-muted");
    }

    if (dayValue === todayValue) {
      dayButton.classList.add("is-today");
    }

    if (dayValue === selectedValue) {
      dayButton.classList.add("is-selected");
    }

    dayButton.addEventListener("click", () => {
      if (addMemberDobInput) {
        addMemberDobInput.value = dayValue;
      }

      syncDateDisplay();
      renderDatePicker();
      closeDatePicker();
    });

    addMemberDatePickerGrid.append(dayButton);
  });
};

const validateMemberForm = () => {
  const errors = [];

  getMemberFormFields().forEach((field) => {
    const input = field.querySelector("input:not([type='hidden']), textarea");
    const hiddenInput = field.querySelector("input[type='hidden']");
    const label = field.dataset.fieldLabel || "This field";
    let message = "";

    if (field.contains(addMemberDobDisplay) && !addMemberDobInput?.value) {
      message = "Please select the member's date of birth.";
    } else if (input?.required && !input.value.trim()) {
      message = `Please fill in ${label.toLowerCase()}.`;
    } else if (input?.type === "email" && input.value.trim() && !input.checkValidity()) {
      message = "Please enter a valid email address.";
    } else if (hiddenInput?.required && !hiddenInput.value.trim()) {
      message = `Please fill in ${label.toLowerCase()}.`;
    }

    setFieldErrorState(field, message);

    if (message) {
      errors.push({ field, input, label, message });
    }
  });

  return errors;
};

const focusInvalidField = (field) => {
  const focusTarget =
    field.querySelector("input:not([type='hidden']), textarea") ||
    field.querySelector("button");

  field.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    focusTarget?.focus?.();
  }, 180);
};

const setDocumentModalContent = ({ memberName, title, imageSrc = "", imageAlt = "" }) => {
  if (documentMemberLabel) {
    documentMemberLabel.textContent = memberName || "Member Record";
  }

  if (documentTypeLabel) {
    documentTypeLabel.textContent = title || "Preview";
  }

  if (!documentFigure || !documentImage) {
    return;
  }

  if (imageSrc) {
    documentImage.src = imageSrc;
    documentImage.alt = imageAlt || title || memberName || "Preview";
    documentFigure.hidden = false;
    return;
  }

  documentImage.src = "";
  documentImage.alt = "";
  documentFigure.hidden = true;
};

const performLogout = () => {
  sessionStorage.removeItem(authStorageKey);
  localStorage.removeItem(authStorageKey);
  sessionStorage.setItem("gymdeck-enter", "logout");
  document.body.classList.remove("logout-dialog-open");
  document.body.classList.add("is-logging-out");

  if (logoutDialog) {
    logoutDialog.hidden = true;
  }

  if (logoutBackdrop) {
    logoutBackdrop.hidden = true;
  }

  window.setTimeout(() => {
    window.location.href = logoutDestination;
  }, 320);
};

const setStageVisibility = (activeStage) => {
  dashboardStage?.classList.toggle("is-hidden", activeStage !== "dashboard");
  membersStage?.classList.toggle("is-active", activeStage === "members");
  memberProfileStage?.classList.toggle("is-active", activeStage === "member-profile");
  
  DOM.membershipPlansStage?.classList.toggle("is-active", activeStage === "membership-plans");
  DOM.expiringMembershipsStage?.classList.toggle("is-active", activeStage === "expiring-memberships");
  DOM.freezePauseStage?.classList.toggle("is-active", activeStage === "freeze-pause");
  DOM.dailyCheckinStage?.classList.toggle("is-active", activeStage === "daily-checkin");
  DOM.manualEntryStage?.classList.toggle("is-active", activeStage === "manual-entry");
  DOM.attendanceReportsStage?.classList.toggle("is-active", activeStage === "attendance-reports");
  DOM.paymentsStage?.classList.toggle("is-active", activeStage === "payments");
  comingSoonStage?.classList.toggle("is-active", activeStage === "coming-soon");

  dashboardStage?.setAttribute("aria-hidden", String(activeStage !== "dashboard"));
  membersStage?.setAttribute("aria-hidden", String(activeStage !== "members"));
  memberProfileStage?.setAttribute("aria-hidden", String(activeStage !== "member-profile"));
  
  DOM.membershipPlansStage?.setAttribute("aria-hidden", String(activeStage !== "membership-plans"));
  DOM.expiringMembershipsStage?.setAttribute("aria-hidden", String(activeStage !== "expiring-memberships"));
  DOM.freezePauseStage?.setAttribute("aria-hidden", String(activeStage !== "freeze-pause"));
  DOM.dailyCheckinStage?.setAttribute("aria-hidden", String(activeStage !== "daily-checkin"));
  DOM.manualEntryStage?.setAttribute("aria-hidden", String(activeStage !== "manual-entry"));
  DOM.attendanceReportsStage?.setAttribute("aria-hidden", String(activeStage !== "attendance-reports"));
  DOM.paymentsStage?.setAttribute("aria-hidden", String(activeStage !== "payments"));
  comingSoonStage?.setAttribute("aria-hidden", String(activeStage !== "coming-soon"));
};

const calculateAge = (dobValue) => {
  if (!dobValue) {
    return "";
  }

  const dob = new Date(dobValue);

  if (Number.isNaN(dob.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  const dayDifference = today.getDate() - dob.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1;
  }

  return `${age} years`;
};

const updateMemberAges = () => {
  getMemberDobCells().forEach((dobCell) => {
    const ageCell = dobCell.nextElementSibling;

    if (!ageCell?.hasAttribute("data-member-age")) {
      return;
    }

    const age = calculateAge(dobCell.dataset.memberDob);
    const label = document.createElement("b");
    label.textContent = "Age";
    ageCell.replaceChildren(label, document.createTextNode(age ? ` ${age}` : ""));
  });
};

const matchesMemberFilter = (card) => {
  if (activeMemberFilter === "verified") {
    return card.dataset.memberStatus === "verified";
  }

  if (activeMemberFilter === "recent") {
    return card.dataset.memberRecent === "true";
  }

  return true;
};

const updateMemberResults = () => {
  const memberCards = getMemberRows();

  if (!memberCards.length) {
    return;
  }

  const query = memberSearchInput?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  memberCards.forEach((card) => {
    const searchableContent = card.dataset.search || "";
    const matches = (!query || searchableContent.includes(query)) && matchesMemberFilter(card);
    card.hidden = !matches;

    if (matches) {
      visibleCount += 1;
    }
  });

  if (memberCount) {
    memberCount.textContent = `${visibleCount} ${visibleCount === 1 ? "profile" : "profiles"}`;
  }

  if (membersEmptyState) {
    membersEmptyState.hidden = visibleCount !== 0;
  }
};

const setActiveView = (viewName) => {
  const safeView = viewLabels[viewName] ? viewName : "dashboard";
  if (activeView === safeView && activeRoots.has(safeView)) return;
  
  activeView = safeView;
  
  // Lazy mount the required stage
  mountStageLazy(safeView);
  
  // Unmount other heavy stages to free up memory
  unmountInactiveStages(safeView);

  overviewLinks.forEach((link) => {
    const isActive = link.dataset.view === safeView;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  navDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-nav-dropdown-toggle]");
    const hasActiveView = Boolean(dropdown.querySelector(`[data-view="${safeView}"]`));

    dropdown.classList.toggle("has-active-view", hasActiveView);
    toggle?.classList.toggle("active", hasActiveView);
  });

  if (comingSoonFeature) {
    comingSoonFeature.textContent = viewLabels[safeView] || "Workspace";
  }

  setStageVisibility(
    ["dashboard", "members", "member-profiles", "past-members", "membership-pricing", "membership-plans", 
     "expiring-memberships", "freeze-pause", "daily-checkin", "attendance", "manual-entry", 
     "attendance-reports", "payments"].includes(safeView) 
    ? (safeView === "member-profiles" || safeView === "past-members" ? "member-profile" : 
       safeView === "membership-pricing" || safeView === "membership-plans" ? "membership-plans" :
       safeView === "attendance" ? "daily-checkin" : safeView)
    : "coming-soon"
  );

  if (safeView === "members") {
    updateMemberResults();
  } else if (safeView === "member-profiles" || safeView === "past-members") {
    window.dispatchEvent(new CustomEvent("memberProfilesRoute", { detail: { screen: safeView } }));
  }

  const isCompactNavigation = window.matchMedia("(max-width: 1180px)").matches;

  if (isCompactNavigation) {
    setMenuState(false);
  }

  navDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-nav-dropdown-toggle]");
    const shouldStayOpen = !isCompactNavigation && dropdown.classList.contains("has-active-view");

    dropdown.classList.toggle("is-open", shouldStayOpen);
    toggle?.setAttribute("aria-expanded", String(shouldStayOpen));
  });

  refreshSidebarScrollIndicator();
};

const getDeletedMemberIds = () => {
  try {
    const serialized = window.localStorage.getItem(MEMBER_DELETED_STORAGE_KEY);
    return serialized ? new Set(JSON.parse(serialized)) : new Set();
  } catch {
    return new Set();
  }
};

const hideDeletedMembersInAllViews = () => {
  const deletedIds = getDeletedMemberIds();
  const memberCards = Array.from(document.querySelectorAll("[data-member-card][data-member-id]"));

  memberCards.forEach((card) => {
    const memberId = card.dataset.memberId;
    card.hidden = memberId ? deletedIds.has(memberId) : card.hidden;
  });

  updateMemberResults();
};

window.addEventListener("gymdeck-member-deleted", hideDeletedMembersInAllViews);

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.contains("sidebar-open");
  setMenuState(!isOpen);
  refreshSidebarScrollIndicator();
});

sidebarOverlay?.addEventListener("click", () => {
  setMenuState(false);
  refreshSidebarScrollIndicator();
});

sidebarMenuScroll?.addEventListener("scroll", () => {
  revealSidebarScrollIndicator();
  scheduleSidebarScrollIndicatorSync();
}, { passive: true });
window.addEventListener("resize", refreshSidebarScrollIndicator);

sidebar?.addEventListener("mouseenter", () => {
  setSidebarRailExpanded(true);
});

sidebar?.addEventListener("mouseleave", () => {
  if (!sidebar.matches(":focus-within")) {
    setSidebarRailExpanded(false);
  }
});

sidebar?.addEventListener("focusin", () => {
  setSidebarRailExpanded(true);
});

sidebar?.addEventListener("focusout", (event) => {
  if (!sidebar.contains(event.relatedTarget)) {
    setSidebarRailExpanded(sidebar.matches(":hover"));
  }
});

if (window.ResizeObserver && sidebarMenuScroll && sidebarScrollIndicator) {
  const sidebarScrollObserver = new ResizeObserver(refreshSidebarScrollIndicator);
  sidebarScrollObserver.observe(sidebarMenuScroll);
  sidebarScrollObserver.observe(sidebarScrollIndicator);
}

navDropdownToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const dropdown = toggle.closest("[data-nav-dropdown]");
    const isOpen = !dropdown?.classList.contains("is-open");

    navDropdowns.forEach((currentDropdown) => {
      if (currentDropdown === dropdown) {
        return;
      }

      currentDropdown.classList.remove("is-open");
      currentDropdown.querySelector("[data-nav-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
    });

    dropdown?.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    refreshSidebarScrollIndicator();
  });
});

logoutTrigger?.addEventListener("click", (event) => {
  event.preventDefault();
  setMenuState(false);
  setLogoutDialogState(true);
});

logoutBackdrop?.addEventListener("click", () => {
  setLogoutDialogState(false);
});

logoutCancel?.addEventListener("click", () => {
  setLogoutDialogState(false);
});

logoutConfirm?.addEventListener("click", () => {
  performLogout();
});

documentViewButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const row = button.closest("tr");
    const memberName = getMemberDisplayName(row);
    const documentLabel = button.previousElementSibling?.textContent?.trim() || "Residence Proof";

    setDocumentModalContent({
      memberName,
      title: documentLabel
    });

    setDocumentModalState(true, button);
  });
});

photoViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest("tr");
    const memberName = getMemberDisplayName(row);
    const memberImage = button.querySelector("img");

    setDocumentModalContent({
      memberName,
      title: "Member Photo",
      imageSrc: memberImage?.src || "",
      imageAlt: memberImage?.alt || memberName
    });

    setDocumentModalState(true, button);
  });
});

documentModalBackdrop?.addEventListener("click", () => {
  setDocumentModalState(false);
});

documentCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDocumentModalState(false);
  });
});

addMemberOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView("members");
    clearMemberFormErrors();
    setAddMemberModalState(true, button);
  });
});

addMemberBackdrop?.addEventListener("click", () => {
  setAddMemberModalState(false);
});

addMemberCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    clearMemberFormErrors();
    setAddMemberModalState(false);
  });
});

addMemberUploadTriggers.forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".member-upload")?.querySelector("[data-member-upload-input]")?.click();
  });
});

addMemberUploadInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncUploadMeta(input);
    syncUploadPreview(input);
    setFieldErrorState(input.closest(".member-field"), "");

    if (addMemberFormAlert && !validateMemberForm().length) {
      addMemberFormAlert.hidden = true;
      addMemberFormAlert.textContent = "";
    }
  });
});

addMemberUploadRemoveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const uploadWrap = button.closest(".member-upload");
    const input = uploadWrap?.querySelector("[data-member-upload-input]");

    if (!input) {
      return;
    }

    clearUploadPreview(input);
    input.value = "";
    syncUploadMeta(input);
  });
});

addMemberDobTrigger?.addEventListener("click", () => {
  const selectedDate = parseCalendarValue(addMemberDobInput?.value || "");
  activeCalendarDate = selectedDate || activeCalendarDate || new Date();
  datePickerMode = "day";
  renderDatePicker();
  openDatePicker();
});

addMemberDobDisplay?.addEventListener("click", () => {
  addMemberDobTrigger?.click();
});

addMemberDatePickerPrev?.addEventListener("click", () => {
  activeCalendarDate =
    datePickerMode === "year"
      ? new Date(activeCalendarDate.getFullYear() - 12, activeCalendarDate.getMonth(), 1)
      : new Date(activeCalendarDate.getFullYear(), activeCalendarDate.getMonth() - 1, 1);
  renderDatePicker();
});

addMemberDatePickerNext?.addEventListener("click", () => {
  activeCalendarDate =
    datePickerMode === "year"
      ? new Date(activeCalendarDate.getFullYear() + 12, activeCalendarDate.getMonth(), 1)
      : new Date(activeCalendarDate.getFullYear(), activeCalendarDate.getMonth() + 1, 1);
  renderDatePicker();
});

addMemberDatePickerTitle?.addEventListener("click", () => {
  datePickerMode = datePickerMode === "year" ? "day" : "year";
  renderDatePicker();
});

addMemberDatePickerToday?.addEventListener("click", () => {
  const today = new Date();
  activeCalendarDate = today;
  datePickerMode = "day";

  if (addMemberDobInput) {
    addMemberDobInput.value = formatCalendarValue(today);
  }

  syncDateDisplay();
  renderDatePicker();
  closeDatePicker();
});

addMemberDatePickerClear?.addEventListener("click", () => {
  if (addMemberDobInput) {
    addMemberDobInput.value = "";
  }

  syncDateDisplay();
  renderDatePicker();
  closeDatePicker();
  setFieldErrorState(
    addMemberDobDisplay?.closest(".member-field"),
    ""
  );
});

addMemberSaveButton?.addEventListener("click", () => {
  const errors = validateMemberForm();

  if (!errors.length) {
    clearMemberFormErrors();
    const newMember = getNewMemberPayload();
    const newRow = createMemberRow(newMember);
    membersTableBody?.prepend(newRow);
    updateMemberAges();
    updateMemberResults();
    resetMemberForm();
    setActiveView("members");
    setAddMemberModalState(false);
    return;
  }

  if (addMemberFormAlert) {
    const fieldList = errors.map(({ label }) => label).join(", ");
    addMemberFormAlert.textContent = `Complete the required fields before saving: ${fieldList}.`;
    addMemberFormAlert.hidden = false;
  }

  focusInvalidField(errors[0].field);
});

getMemberFormFields().forEach((field) => {
  const input = field.querySelector("input:not([type='hidden']), textarea");

  input?.addEventListener("input", () => {
    const isDobField = field.contains(addMemberDobDisplay);
    const currentValue = isDobField ? addMemberDobInput?.value || "" : input.value.trim();

    if (currentValue) {
      setFieldErrorState(field, "");
    }

    if (addMemberFormAlert && !validateMemberForm().length) {
      addMemberFormAlert.hidden = true;
      addMemberFormAlert.textContent = "";
    }
  });
});

overviewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView(link.dataset.view || "dashboard");
  });
});

comingSoonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetView = button.dataset.viewTarget || "dashboard";
    const currentPreviewIndex = previewOrder.indexOf(activeView);
    const nextPreview =
      currentPreviewIndex >= 0
        ? previewOrder[(currentPreviewIndex + 1) % previewOrder.length]
        : previewOrder[0];
    const nextView = targetView === "members" ? nextPreview : targetView;
    setActiveView(nextView);
  });
});

let memberSearchTimeout;
const debounce = (fn, delay) => (...args) => {
  clearTimeout(memberSearchTimeout);
  memberSearchTimeout = setTimeout(() => fn(...args), delay);
};

memberSearchInput?.addEventListener("input", debounce(() => {
  updateMemberResults();
}, 150));

memberFilterButtons.forEach((button) => {
  const isInitiallyActive = button.dataset.memberFilter === activeMemberFilter;
  button.setAttribute("aria-pressed", String(isInitiallyActive));

  button.addEventListener("click", () => {
    activeMemberFilter = button.dataset.memberFilter || "all";

    memberFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    updateMemberResults();
  });
});

membersRefreshButton?.addEventListener("click", () => {
  if (memberSearchInput) {
    memberSearchInput.value = "";
  }

  activeMemberFilter = "all";
  memberFilterButtons.forEach((button) => {
    const isActive = button.dataset.memberFilter === "all";
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  updateMemberResults();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!addMemberDatePickerPanel?.hidden) {
      closeDatePicker();
      return;
    }

    if (document.body.classList.contains("member-form-open")) {
      setAddMemberModalState(false);
      return;
    }

    if (document.body.classList.contains("document-modal-open")) {
      setDocumentModalState(false);
      return;
    }

    if (document.body.classList.contains("logout-dialog-open")) {
      setLogoutDialogState(false);
      return;
    }

    setMenuState(false);
  }
});

mobileNavBreakpoint.addEventListener("change", (event) => {
  if (!event.matches) {
    setMenuState(false);
  }
});

document.addEventListener("click", (event) => {
  if (!addMemberDatePicker || addMemberDatePickerPanel.hidden) {
    return;
  }

  if (!addMemberDatePicker.contains(event.target)) {
    closeDatePicker();
  }
});

// Lazy mounting is now handled by setActiveView
setActiveView(activeView);
hideDeletedMembersInAllViews();
refreshSidebarScrollIndicator();
updateMemberAges();
updateMemberResults();
syncDateDisplay();
renderDatePicker();
resetUploadFields();
