document.querySelectorAll(".icon-btn, .join-btn, .dots, .slider-nav button, .follow-btn, .see-all-btn, .plus-btn, .launch-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

if (document.documentElement.classList.contains("dashboard-enter")) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("dashboard-enter-active");
    });
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
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
const addMemberOpenButton = document.querySelector("[data-add-member-open]");
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
const logoutDestination = "../authentication/index.html";
const overviewLinks = Array.from(document.querySelectorAll(".sidebar-group-overview .nav-item[data-view]"));
const dashboardStage = document.querySelector('[data-stage="dashboard"]');
const membersStage = document.querySelector('[data-stage="members"]');
const comingSoonStage = document.querySelector('[data-stage="coming-soon"]');
const comingSoonFeature = document.querySelector(".coming-soon-feature");
const comingSoonButtons = Array.from(document.querySelectorAll("[data-view-target]"));
const memberSearchInput = document.querySelector("[data-member-search]");
const memberCount = document.querySelector("[data-member-count]");
const membersEmptyState = document.querySelector("[data-members-empty]");
const membersTableBody = document.querySelector(".members-table tbody");
const viewLabels = {
  dashboard: "Dashboard",
  members: "Members",
  attendance: "Attendance",
  payments: "Payments",
  trainers: "Trainers",
  "personal-training": "Personal Training",
  "notify-members": "Notify Members"
};
const previewOrder = Object.keys(viewLabels).filter((view) => view !== "dashboard");
let lastFocusedElement = null;
let activeView = "dashboard";
let lastDocumentTrigger = null;
let lastAddMemberTrigger = null;
let activeCalendarDate = new Date();
let datePickerMode = "day";
const uploadPreviewUrls = new WeakMap();

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
    document.body.classList.add("member-form-open");
    addMemberModal.querySelector("input")?.focus();
    return;
  }

  document.body.classList.remove("member-form-open");
  addMemberModal.hidden = true;
  addMemberBackdrop.hidden = true;
  closeDatePicker();
  resetUploadFields();
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
    const memberName = row.children[1]?.textContent?.trim() || "Member Record";
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
    const memberName = row.children[1]?.textContent?.trim() || "Member Record";
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
  row.dataset.search = createMemberSearchIndex(member);
  row.innerHTML = `
    <td>
      <button class="member-photo-btn" type="button" data-photo-view aria-label="View ${escapeHtml(member.name)} photo">
        <img class="member-photo" src="${escapeHtml(member.photoUrl)}" alt="${escapeHtml(member.name)}" />
      </button>
    </td>
    <td>${escapeHtml(member.name)}</td>
    <td>${escapeHtml(member.contactNumber)}</td>
    <td>${escapeHtml(member.alternateContact)}</td>
    <td>${escapeHtml(member.email || "Not provided")}</td>
    <td data-member-dob="${escapeHtml(member.dobValue)}">${escapeHtml(member.dobDisplay)}</td>
    <td data-member-age></td>
    <td data-member-joined-date="${escapeHtml(member.joiningDateValue)}">${escapeHtml(member.joiningDateDisplay)}</td>
    <td data-member-joined-time="${escapeHtml(member.joiningTimeValue)}">${escapeHtml(member.joiningTimeDisplay)}</td>
    <td>${escapeHtml(member.height || "-")}</td>
    <td>${escapeHtml(member.weight || "-")}</td>
    <td>${escapeHtml(member.address)}</td>
    <td>
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
  sessionStorage.setItem("gymdeck-enter", "auth");
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
  comingSoonStage?.classList.toggle("is-active", activeStage === "coming-soon");

  dashboardStage?.setAttribute("aria-hidden", String(activeStage !== "dashboard"));
  membersStage?.setAttribute("aria-hidden", String(activeStage !== "members"));
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

    ageCell.textContent = calculateAge(dobCell.dataset.memberDob);
  });
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
    const matches = !query || searchableContent.includes(query);
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
  activeView = safeView;

  overviewLinks.forEach((link) => {
    const isActive = link.dataset.view === safeView;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (comingSoonFeature) {
    comingSoonFeature.textContent = viewLabels[safeView] || "Workspace";
  }

  if (safeView === "dashboard") {
    setStageVisibility("dashboard");
  } else if (safeView === "members") {
    setStageVisibility("members");
    updateMemberResults();
  } else {
    setStageVisibility("coming-soon");
  }

  if (window.matchMedia("(max-width: 1180px)").matches) {
    setMenuState(false);
  }
};

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.contains("sidebar-open");
  setMenuState(!isOpen);
});

sidebarOverlay?.addEventListener("click", () => {
  setMenuState(false);
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
    const memberName = row?.children[1]?.textContent?.trim() || "Member Record";
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
    const memberName = row?.children[1]?.textContent?.trim() || "Member Record";
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

addMemberOpenButton?.addEventListener("click", () => {
  clearMemberFormErrors();
  setAddMemberModalState(true, addMemberOpenButton);
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

setActiveView(activeView);
updateMemberAges();
updateMemberResults();
syncDateDisplay();
renderDatePicker();
resetUploadFields();
