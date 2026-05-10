import { mountIntroScreen } from "./IntroScreen.jsx";

// Initializing the app with the Intro sequence on launch or logout
const initIntro = () => {
  const authPage = document.querySelector(".auth-page");
  const introShown = sessionStorage.getItem("gymdeck-intro-shown");
  const enterMode = sessionStorage.getItem("gymdeck-enter");
  
  // Only show intro if:
  // 1. First time in this session (introShown is null)
  // 2. OR we specifically just logged out (enterMode is "logout")
  const shouldShowIntro = !introShown || enterMode === "logout";

  if (shouldShowIntro) {
    mountIntroScreen(() => {
      sessionStorage.setItem("gymdeck-intro-shown", "true");
      sessionStorage.removeItem("gymdeck-enter");
      
      document.documentElement.classList.remove("app-loading");
      document.documentElement.style.backgroundColor = "";
      
      if (authPage) {
        authPage.classList.remove("is-loading");
        document.documentElement.classList.add("auth-enter-active");
      }
    });
  } else {
    // Skip intro: immediately reveal the auth page
    document.documentElement.classList.remove("app-loading");
    document.documentElement.style.backgroundColor = "";
    
    if (authPage) {
      authPage.classList.remove("is-loading");
      // Ensure the entry class is present for standard transition
      document.documentElement.classList.add("auth-enter");
      
      requestAnimationFrame(() => {
        document.documentElement.classList.add("auth-enter-active");
      });
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIntro);
} else {
  initIntro();
}

const phoneTimeElements = document.querySelectorAll(".phone-time");

if (phoneTimeElements.length > 0) {
  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const updatePhoneTime = () => {
    const currentTime = timeFormatter.format(new Date());
    phoneTimeElements.forEach((element) => {
      element.textContent = currentTime;
    });
  };

  const scheduleNextTimeUpdate = () => {
    const now = new Date();
    const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    window.setTimeout(() => {
      updatePhoneTime();
      scheduleNextTimeUpdate();
    }, Math.max(250, delayUntilNextMinute));
  };

  updatePhoneTime();
  scheduleNextTimeUpdate();
}

const toggleButtons = document.querySelectorAll(".toggle-password");

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement?.querySelector("input");
    const inputWrap = button.closest(".input-wrap");

    if (!input) {
      return;
    }

    const nextType = input.type === "password" ? "text" : "password";
    const isPasswordVisible = nextType === "text";

    input.type = nextType;
    button.classList.toggle("is-active", isPasswordVisible);
    inputWrap?.classList.toggle("password-visible", isPasswordVisible);
    button.setAttribute("aria-pressed", String(isPasswordVisible));
    button.setAttribute("aria-label", isPasswordVisible ? "Hide password" : "Show password");
    button.setAttribute("title", isPasswordVisible ? "Hide password" : "Show password");
  });
});

const otpSlots = Array.from(document.querySelectorAll(".otp-slot"));

otpSlots.forEach((slot, index) => {
  slot.addEventListener("input", () => {
    slot.value = slot.value.replace(/\D/g, "").slice(0, 1);

    if (slot.value && index < otpSlots.length - 1) {
      otpSlots[index + 1].focus();
      otpSlots[index + 1].select();
    }
  });

  slot.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !slot.value && index > 0) {
      otpSlots[index - 1].focus();
    }
  });
});

/* 
// Handled by IntroScreen completion callback
if (document.documentElement.classList.contains("auth-enter")) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("auth-enter-active");
      window.setTimeout(() => {
        sessionStorage.removeItem("gymdeck-enter");
      }, 560);
    });
  });
}
*/

const isAuthDestination = (destination) => {
  if (!destination) {
    return false;
  }

  try {
    const url = new URL(destination, window.location.href);
    return url.origin === window.location.origin && url.pathname.includes("/authentication/");
  } catch {
    return false;
  }
};

const isDashboardDestination = (destination) => {
  if (!destination) {
    return false;
  }

  const destLower = destination.toLowerCase();
  return destLower.includes("frontend") || destLower.includes("dashboard");
};

const rememberAuthenticatedSession = () => {
  const rememberMe = document.querySelector('input[name="remember-me"], #remember-me');
  const targetStorage = rememberMe?.checked ? localStorage : sessionStorage;

  sessionStorage.removeItem("gymdeck-authenticated");
  localStorage.removeItem("gymdeck-authenticated");
  targetStorage.setItem("gymdeck-authenticated", "true");
};

const navigateWithTransition = (destination, enterState, trigger) => {
  if (!destination) {
    return;
  }

  const resolvedEnterState = enterState || (isAuthDestination(destination) ? "auth" : "");

  if (isDashboardDestination(destination)) {
    rememberAuthenticatedSession();
  }

  if (resolvedEnterState) {
    sessionStorage.setItem("gymdeck-enter", resolvedEnterState);
    console.log("GymDeck: Set gymdeck-enter to:", resolvedEnterState);
  } else {
    sessionStorage.removeItem("gymdeck-enter");
  }

  if (trigger instanceof HTMLButtonElement) {
    trigger.setAttribute("disabled", "true");

    if (trigger.type === "submit") {
      trigger.textContent = "Please wait...";
    }
  }

  console.log("GymDeck: Navigating to:", destination);
  document.body.classList.add("is-transitioning");

  window.setTimeout(() => {
    window.location.href = destination;
  }, 200);
};

document.querySelectorAll("form[data-redirect]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const destination = form.getAttribute("data-redirect") || form.getAttribute("action");
    const enterState = form.getAttribute("data-enter-state");
    const submitButton = form.querySelector(".primary-btn");

    navigateWithTransition(destination, enterState, submitButton);
  });
});

document.querySelectorAll("button[data-redirect]").forEach((button) => {
  button.addEventListener("click", () => {
    const destination = button.getAttribute("data-redirect");
    const enterState = button.getAttribute("data-enter-state");

    navigateWithTransition(destination, enterState, button);
  });
});

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const destination = link.getAttribute("href");

    if (!destination || destination.startsWith("#") || destination.startsWith("mailto:") || destination.startsWith("tel:")) {
      return;
    }

    event.preventDefault();
    navigateWithTransition(destination, link.getAttribute("data-enter-state"), link);
  });
});
