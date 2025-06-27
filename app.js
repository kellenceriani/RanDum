(() => {
  let totalCategories = 0;

  const rosterTypes = {
    standard: {
      positions: ["C", "1B", "2B", "SS", "3B", "LF", "CF", "RF", "DH", "SP"]
    },
    expanded: {
      positions: ["C", "1B", "2B", "SS", "3B", "LF", "CF", "RF", "DH", "SP#1", "SP#2", "SP#3", "CP", "UTIL#1", "UTIL#2"]
    },
    xtra: {
      positions: [
        "C", "1B", "2B", "SS", "3B", "LF", "CF", "RF", "DH",
        "SP#1", "SP#2", "SP#3", "SP#4", "RP#1", "RP#2", "CP",
        "UTIL#1", "UTIL#2", "UTIL#3", "UTIL#4"
      ]
  },
  small: {
    positions: ["OF", "IF#1", "IF#2", "SP", "DH"]
  }
  };

let battingOrderPositions = [];

function updateBattingOrderPositions(rosterKey) {
  // Default to 1–9 for most rosters
  battingOrderPositions = rosterKey === "small"
    ? ["1", "2", "3", "4"]
    : ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
}


  const playerCountInput = document.getElementById("playerCount");
  const playersContainer = document.getElementById("playersContainer");
  const snakeDraftCheckbox = document.getElementById("snakeDraftCheckbox");
  const lockedPositionsCheckbox = document.getElementById("lockedPositionsCheckbox");
  const rosterTypeSelect = document.getElementById("rosterTypeSelect");
  const startDraftBtn = document.getElementById("startDraftBtn");

  const setupSection = document.getElementById("setup");
  const draftSection = document.getElementById("draftSection");
  const categoryDisplay = document.getElementById("categoryDisplay");
  const draftArea = document.getElementById("draftArea");
  const finishDraftBtn = document.getElementById("finishDraftBtn");

  const resultSection = document.getElementById("resultSection");
  const promptOutput = document.getElementById("promptOutput");
  const copyPromptBtn = document.getElementById("copyPromptBtn");
  const editPromptBtn = document.getElementById("editPromptBtn");

  let players = [];
  let pickOrder = [];
  let currentPick = 0;
  let totalPicks = 0;
  let currentCategory = "";
  let currentRound = 0;
  let lockedPositionPickOrder = [];
  let activeRoster = rosterTypes.standard;

  function initCategories() {
    totalCategories = typeof getCategoryCount === "function" ? getCategoryCount() : (categories ? categories.length : 0);
  }

  function generateSnakePickOrder(playerCount, totalPicksNeeded) {
    const order = [];
    while (order.length < totalPicksNeeded) {
      const forward = Array.from({ length: playerCount }, (_, i) => i);
      const backward = [...forward].reverse();
      order.push(...forward);
      if (order.length < totalPicksNeeded) order.push(...backward);
    }
    return order.slice(0, totalPicksNeeded);
  }

  function generateLockedPositionPickOrder(playerCount, positions) {
    const order = [];
    for (let i = 0; i < positions.length; i++) {
      for (let p = 0; p < playerCount; p++) {
        order.push(positions[i]);
      }
    }
    return order;
  }

  function remainingPicks(player) {
    return activeRoster.positions.length - player.lineup.length;
  }

  function renderPlayerInputs() {
    playersContainer.innerHTML = "";
    let count = Math.min(8, Math.max(2, +playerCountInput.value));
    for (let i = 1; i <= count; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Player ${i} Name`;
      input.className = "playerNameInput";
      input.dataset.index = i - 1;
      input.style.marginRight = "0.5em";
      playersContainer.appendChild(input);
    }
  }

  playerCountInput.addEventListener("input", renderPlayerInputs);
  renderPlayerInputs();

  function animateCategory(newCategory) {
    const index = categories.indexOf(newCategory);
    const displayIndex = index >= 0 ? index + 1 : '?';
    categoryDisplay.classList.remove("spin");
    void categoryDisplay.offsetWidth;
    categoryDisplay.textContent = newCategory;
    document.getElementById("categoryCounter").textContent = `category: ${displayIndex}/${totalCategories}`;
    categoryDisplay.classList.add("spin");
  }

  function renderDraftArea() {
    draftArea.innerHTML = "";
    const currentPlayerIndex = pickOrder[currentPick];
    const lockedMode = lockedPositionsCheckbox.checked;

    players.forEach((p, idx) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "playerDraft";
      playerDiv.style.border = idx === currentPlayerIndex ? "2px solid #007bff" : "1px solid #ccc";
      playerDiv.style.margin = "0.5em 0";
      playerDiv.style.padding = "0.5em";
      playerDiv.style.borderRadius = "4px";
      playerDiv.style.background = idx === currentPlayerIndex ? "#e7f1ff" : "white";

      const title = document.createElement("h3");
      title.textContent = `${p.name} — Remaining Picks: ${remainingPicks(p)}`;
      playerDiv.appendChild(title);

      const battingOrderList = document.createElement("ol");
      battingOrderList.innerHTML = "<strong>Batting Order:</strong>";
      battingOrderList.style.paddingLeft = "1.5em";
const maxBattingSlot = rosterTypeSelect.value === "small" ? 4 : 9;
for (let i = 1; i <= maxBattingSlot; i++) {
  const pick = p.lineup.find(l => l.battingOrder === i);
  const li = document.createElement("li");
  li.style.marginLeft = "1em";
  li.textContent = pick ? `${pick.character} (${pick.position}) — ${pick.category}` : "[Not Picked]";
  battingOrderList.appendChild(li);
}
const remainingPositions = activeRoster.positions.filter(pos => !p.lineup.some(pick => pick.position === pos));
if (remainingPositions.length > 0) {
  const redText = document.createElement("div");
  redText.style.fontSize = "0.7em";
  redText.style.color = "red";
  redText.style.marginTop = "0.2em";
  redText.textContent = `Remaining Positions: ${remainingPositions.join(", ")}`;
  playerDiv.appendChild(redText);
}

      playerDiv.appendChild(battingOrderList);

      const extras = p.lineup.filter(l => l.battingOrder === null);
      if (extras.length) {
        const benchList = document.createElement("ul");
        benchList.innerHTML = "<strong>Bench/Pitching:</strong>";
        extras.forEach(pick => {
          const li = document.createElement("li");
          li.textContent = `${pick.position}: ${pick.character} — ${pick.category}`;
          benchList.appendChild(li);
        });
        playerDiv.appendChild(benchList);
      }

      if (idx === currentPlayerIndex) {
        const form = document.createElement("form");
        form.style.marginTop = "0.5em";

        const charInput = document.createElement("input");
        charInput.type = "text";
        charInput.placeholder = "Character";
        charInput.required = true;
        charInput.style.marginRight = "0.5em";

        let posSelect;
        let lockedPosition = null;

        if (lockedMode) {
          lockedPosition = lockedPositionPickOrder[currentPick];
          const posDisplay = document.createElement("span");
          posDisplay.textContent = lockedPosition;
          posDisplay.style.marginRight = "1em";
          form.appendChild(posDisplay);
        } else {
          posSelect = document.createElement("select");
          posSelect.required = true;
          posSelect.style.marginRight = "0.5em";

          const taken = p.lineup.map(i => i.position);
          activeRoster.positions.forEach(pos => {
            if (!taken.includes(pos)) {
              const option = document.createElement("option");
              option.value = pos;
              option.textContent = pos;
              posSelect.appendChild(option);
            }
          });

          form.appendChild(posSelect);
        }

        const battingOrderSelect = document.createElement("select");
        battingOrderSelect.required = true;
        battingOrderSelect.style.marginRight = "0.5em";

        const takenOrders = p.lineup.map(l => l.battingOrder).filter(b => b);
        battingOrderPositions.forEach(n => {
          if (!takenOrders.includes(+n)) {
            const option = document.createElement("option");
            option.value = n;
            option.textContent = n;
            battingOrderSelect.appendChild(option);
          }
        });

        function updateBattingVisibility() {
          const posVal = lockedMode ? lockedPosition : posSelect.value;
          if (posVal.includes("SP") || posVal.includes("RP") || posVal.includes("CP") || posVal.includes("UTIL")) {
            battingOrderSelect.style.display = "none";
            battingOrderSelect.required = false;
          } else {
            battingOrderSelect.style.display = "inline-block";
            battingOrderSelect.required = true;
          }
        }

        if (!lockedMode) posSelect.addEventListener("change", updateBattingVisibility);
        updateBattingVisibility();

        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.textContent = "Pick";

        form.appendChild(charInput);
        form.appendChild(battingOrderSelect);
        form.appendChild(submitBtn);

        form.addEventListener("submit", e => {
          e.preventDefault();
          const character = charInput.value.trim();
          const position = lockedMode ? lockedPosition : posSelect.value;
          const battingOrder = position.match(/SP|RP|CP|UTIL/) ? null : parseInt(battingOrderSelect.value, 10);

          if (!character || !position || (!battingOrder && battingOrder !== 0 && battingOrder !== null)) return;

          if (p.lineup.find(l => l.position === position)) return alert("Position already drafted.");
          if (battingOrder && p.lineup.find(l => l.battingOrder === battingOrder)) return alert("Batting slot taken.");

          p.lineup.push({ character, position, category: currentCategory, battingOrder });
        recordPick(p.name, position, character, currentCategory, Math.floor(currentPick / players.length) + 1);
          currentPick++;

          if (players.every(pl => pl.lineup.length === activeRoster.positions.length)) {
            finishDraftBtn.classList.remove("hidden");
            renderDraftArea();
            return;
          }

          if (currentPick % players.length === 0) {
            currentCategory = categories[Math.floor(Math.random() * categories.length)];
            animateCategory(currentCategory);
          } else {
            categoryDisplay.textContent = currentCategory;
            const index = categories.indexOf(currentCategory);
            document.getElementById("categoryCounter").textContent = `category: ${index + 1}/${totalCategories}`;
          }

          renderDraftArea();
        });

        playerDiv.appendChild(form);
      }

      draftArea.appendChild(playerDiv);
    });
  }

  startDraftBtn.addEventListener("click", () => {
    initCategories();

    const selectedRoster = rosterTypeSelect.value;
    updateBattingOrderPositions(selectedRoster);

    activeRoster = rosterTypes[selectedRoster];

    const inputs = [...document.querySelectorAll(".playerNameInput")];
    players = inputs.map((inp, i) => ({
      name: inp.value.trim() || `Player ${i + 1}`,
      lineup: []
    }));

    totalPicks = players.length * activeRoster.positions.length;
    const isSnake = snakeDraftCheckbox.checked;
    const isLocked = lockedPositionsCheckbox.checked;

    if (isLocked) {
      lockedPositionPickOrder = generateLockedPositionPickOrder(players.length, activeRoster.positions);
    } else {
      lockedPositionPickOrder = [];
    }

    pickOrder = isSnake
      ? generateSnakePickOrder(players.length, totalPicks)
      : Array.from({ length: totalPicks }, (_, i) => i % players.length);

    currentPick = 0;
    currentCategory = categories[Math.floor(Math.random() * categories.length)];
    animateCategory(currentCategory);

    setupSection.classList.add("hidden");
    draftSection.classList.remove("hidden");
    finishDraftBtn.classList.add("hidden");

    renderDraftArea();
  });

  finishDraftBtn.addEventListener("click", () => {
    draftSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    let summary = `Draft Summary:\n\n`;
    players.forEach(p => {
      summary += `${p.name}'s Lineup:\n`;
      const batting = p.lineup.filter(l => l.battingOrder).sort((a, b) => a.battingOrder - b.battingOrder);
      batting.forEach(pick => {
        summary += `-${pick.battingOrder}: ${pick.character} (${pick.position}) — ${pick.category}\n`;
      });
      const extras = p.lineup.filter(l => !l.battingOrder);
      extras.forEach(pick => {
        summary += `- ${pick.position}: ${pick.character} — ${pick.category}\n`;
      });
      summary += "\n";
    });

    summary += `Evaluate these baseball lineups for fit, talent, and strategy. Assign MLB The Show-style OVR ratings and pick the strongest roster.`;
    promptOutput.value = summary;
  });

  copyPromptBtn.addEventListener("click", () => {
    promptOutput.select();
    document.execCommand("copy");
  });

  editPromptBtn.addEventListener("click", () => {
    if (promptOutput.hasAttribute("readonly")) {
      promptOutput.removeAttribute("readonly");
      editPromptBtn.textContent = "Lock Prompt";
    } else {
      promptOutput.setAttribute("readonly", true);
      editPromptBtn.textContent = "Edit Prompt";
    }
  });
})();