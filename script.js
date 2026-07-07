const BOTPRESS_WEBHOOK_URL =
  "https://webhook.botpress.cloud/4acb2176-e357-4dc1-9433-014c2c877104";

const plannerContent = {
  energy: {
    title: "Build a steadier, more energising plate.",
    copy:
      "Start with slower-release carbs, add a strong protein source, and include fruit or vegetables for fibre and micronutrients.",
    idea: "Oats or whole-grain carbs",
    protein: "Eggs, tofu, or yogurt",
    addon: "Banana, berries, or nuts",
  },
  balance: {
    title: "Keep the meal balanced and easier to sustain.",
    copy:
      "Aim for a plate with vegetables, a filling protein, and a sensible carb portion so the meal feels complete without being too heavy.",
    idea: "Brown rice or wholemeal wrap",
    protein: "Chicken, fish, beans, or tempeh",
    addon: "Leafy greens and colorful vegetables",
  },
  focus: {
    title: "Support concentration with lighter, smarter fuel.",
    copy:
      "Choose foods that help avoid energy crashes and include hydration, protein, and fibre to stay sharper through the day.",
    idea: "Whole-grain toast or overnight oats",
    protein: "Greek yogurt, tuna, or soy milk",
    addon: "Water, seeds, and fresh fruit",
  },
};

const chatToggle = document.querySelector(".chat-toggle");
const chatPanel = document.querySelector(".chat-panel");
const chatClose = document.querySelector(".chat-close");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const plannerTabs = document.querySelectorAll(".planner-tab");

const sendWebhookEvent = async (eventName, details = {}) => {
  try {
    await fetch(BOTPRESS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: eventName,
        page: window.location.pathname || "/",
        title: document.title,
        sentAt: new Date().toISOString(),
        details,
      }),
    });
  } catch (error) {
    console.warn(
      "Botpress webhook request failed. Check Allowed Origins in Botpress if this site is running in the browser.",
      error
    );
  }
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

if (plannerTabs.length) {
  const plannerTitle = document.querySelector(".planner-title");
  const plannerCopy = document.querySelector(".planner-copy");
  const plannerIdea = document.querySelector(".planner-idea");
  const plannerProtein = document.querySelector(".planner-protein");
  const plannerAddon = document.querySelector(".planner-addon");

  const updatePlanner = (goal) => {
    const data = plannerContent[goal];

    if (!data || !plannerTitle || !plannerCopy || !plannerIdea || !plannerProtein || !plannerAddon) {
      return;
    }

    plannerTitle.textContent = data.title;
    plannerCopy.textContent = data.copy;
    plannerIdea.textContent = data.idea;
    plannerProtein.textContent = data.protein;
    plannerAddon.textContent = data.addon;

    plannerTabs.forEach((tab) => {
      const isActive = tab.dataset.goal === goal;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
  };

  plannerTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const goal = tab.dataset.goal;
      updatePlanner(goal);
      sendWebhookEvent("planner_goal_selected", { goal });
    });
  });
}

if (chatToggle && chatPanel && chatClose) {
  const setChatOpen = (isOpen, { restoreFocus = true } = {}) => {
    chatPanel.hidden = !isOpen;
    chatToggle.classList.toggle("chat-toggle-hidden", isOpen);
    chatToggle.setAttribute("aria-hidden", String(isOpen));
    chatToggle.setAttribute("aria-expanded", String(isOpen));
    chatToggle.setAttribute(
      "aria-label",
      isOpen ? "Close chat assistant" : "Open chat assistant"
    );

    if (isOpen) {
      sendWebhookEvent("chat_opened");
      chatClose.focus();
      return;
    }

    if (restoreFocus) {
      chatToggle.focus();
    }
  };

  setChatOpen(false, { restoreFocus: false });

  chatToggle.addEventListener("click", () => {
    const isOpen = chatPanel.hidden;
    setChatOpen(isOpen);
  });

  chatClose.addEventListener("click", () => {
    setChatOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!chatPanel.hidden) {
        setChatOpen(false);
      }

      if (siteNav?.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
        navToggle?.setAttribute("aria-label", "Open navigation");
      }
    }
  });
}
