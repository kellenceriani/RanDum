(() => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");
  const sortSelect = document.getElementById("sortMode");
  const picksList = document.getElementById("picksList");
  const timerDisplay = document.getElementById("timerDisplay");
  const timeSlider = document.getElementById("timeSlider");
  const timeValue = document.getElementById("timeValue");
  const enableTimerCheckbox = document.getElementById("enableTimerCheckbox");
  const timerControls = document.getElementById("timerControls");

  let timer, timeLeft;
  const pickLog = [];

  const beepAudio = new Audio("beep/beep-6.mp3");

  // Sidebar toggle
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // Timer slider value display
  timeSlider.addEventListener("input", () => {
    timeValue.textContent = timeSlider.value;
  });

  // Show/hide timer controls when checkbox is toggled
  enableTimerCheckbox.addEventListener("change", () => {
    timerControls.style.display = enableTimerCheckbox.checked ? "block" : "none";
  });

  // Record pick
  window.recordPick = function (playerName, position, character, category, round) {
    pickLog.push({ playerName, position, character, category, round });
    renderSidebar();
  };

  // Render sorted picks
  function renderSidebar() {
    const sort = sortSelect.value;
    let sorted = [...pickLog];

    switch (sort) {
      case "player":
        sorted.sort((a, b) => a.playerName.localeCompare(b.playerName));
        break;
      case "position":
        sorted.sort((a, b) => a.position.localeCompare(b.position));
        break;
      case "round":
      default:
        sorted.sort((a, b) => a.round - b.round);
    }

    picksList.innerHTML = sorted
      .map(
        (p) =>
          `<li><strong>${p.playerName}</strong>: ${p.character} (${p.position}) - ${p.category} [R${p.round}]</li>`
      )
      .join("");
  }

  sortSelect.addEventListener("change", renderSidebar);

  // Start pick timer (only if enabled)
  window.startPickTimer = function (onExpire) {
    clearInterval(timer);
    timerDisplay.textContent = "";

    if (!enableTimerCheckbox.checked) return;

    timeLeft = parseInt(timeSlider.value, 10);
    updateTimerDisplay();

    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        playBeep();
        if (typeof onExpire === "function") onExpire();
      }
    }, 1000);
  };

  function updateTimerDisplay() {
    timerDisplay.textContent = `⏳ ${timeLeft}s`;
  }

  function playBeep() {
    if (beepAudio) {
      beepAudio.currentTime = 0;
      beepAudio.play().catch((e) => console.warn("Beep failed:", e));
    }
  }

  // Auto-start timer for new pick form
  const observer = new MutationObserver(() => {
    const forms = document.querySelectorAll("#draftArea form");
    if (forms.length > 0) {
      window.startPickTimer(() => {
        const form = forms[0];
        const input = form.querySelector("input");
        if (input) input.value = "DnA (ChatGPT, Give Bad Anwser from Category)"; // Auto-pick fallback
        form.requestSubmit();
      });
    }
  });

  observer.observe(document.getElementById("draftArea"), {
    childList: true,
    subtree: true,
  });
})();
