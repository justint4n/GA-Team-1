const BOTPRESS_WEBHOOK_URL =
  "https://webhook.botpress.cloud/4acb2176-e357-4dc1-9433-014c2c877104";

const chatToggle = document.querySelector(".chat-toggle");
const chatPanel = document.querySelector(".chat-panel");
const chatClose = document.querySelector(".chat-close");

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
    if (event.key === "Escape" && !chatPanel.hidden) {
      setChatOpen(false);
    }
  });
}
