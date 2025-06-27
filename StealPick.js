(() => {
  const finishDraftBtn = document.getElementById("finishDraftBtn");
  const resultSection = document.getElementById("resultSection");
  const draftSection = document.getElementById("draftSection");
  const promptOutput = document.getElementById("promptOutput");

  let players = [];
  const stealModeCheckbox = document.getElementById("stealPickCheckbox");

  // Wait for Finish Draft to be clicked and players to exist
  finishDraftBtn.addEventListener("click", () => {
    if (!stealModeCheckbox.checked) return;

    try {
      const summary = promptOutput.value;
      players = extractPlayersFromSummary(summary);
    } catch (e) {
      alert("Failed to initialize steal mode.");
      return;
    }

    promptOutput.setAttribute("readonly", true);
    runLockPhase();
  });

  function extractPlayersFromSummary(text) {
    const playerBlocks = text.split(/\n\s*\n/).filter(s => s.includes("'s Lineup"));
    return playerBlocks.map(block => {
      const lines = block.split("\n");
      const name = lines[0].replace(/'s Lineup:$/, "").trim();
      const picks = lines.slice(1).map(line => {
        const match = line.match(/(-\s*\d*:?)([^()]+)\(([^)]+)\)\s*—\s*(.*)/);
        if (!match) return null;
        const [, , character, position, category] = match.map(x => x.trim());
        return { character, position, category, locked: false };
      }).filter(Boolean);
      return { name, picks, lockedIndices: [], stealUsed: false };
    });
  }

  function runLockPhase() {
    resultSection.insertAdjacentHTML("beforeend", `
      <div id="lockPhase" style="margin-top:1em;">
        <h3>🔒 Lock Phase</h3>
        <p>Each player must lock 2 picks. These cannot be stolen.</p>
        <div id="lockContainers"></div>
        <button id="confirmLocksBtn" disabled>Confirm Locks</button>
      </div>
    `);

    const container = document.getElementById("lockContainers");
    players.forEach((p, idx) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${p.name}</strong><br>`;
      p.picks.forEach((pick, i) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.player = idx;
        checkbox.dataset.pick = i;
        checkbox.addEventListener("change", validateLocks);
        div.appendChild(checkbox);
        div.insertAdjacentText("beforeend", ` ${pick.character} (${pick.position}) — ${pick.category}\n`);
        div.appendChild(document.createElement("br"));
      });
      container.appendChild(div);
      container.appendChild(document.createElement("br"));
    });

    document.getElementById("confirmLocksBtn").addEventListener("click", () => {
      const checkboxes = container.querySelectorAll("input[type='checkbox']");
      checkboxes.forEach(cb => {
        if (cb.checked) {
          const player = players[cb.dataset.player];
          player.lockedIndices.push(+cb.dataset.pick);
        }
      });
      runStealPhase();
    });

    function validateLocks() {
      const confirmBtn = document.getElementById("confirmLocksBtn");
      let valid = true;
      const grouped = {};

      container.querySelectorAll("input[type='checkbox']").forEach(cb => {
        const pid = cb.dataset.player;
        grouped[pid] = grouped[pid] || 0;
        if (cb.checked) grouped[pid]++;
      });

      for (let id in grouped) {
        if (grouped[id] !== 2) {
          valid = false;
          break;
        }
      }

      confirmBtn.disabled = !valid;
    }
  }

  function runStealPhase() {
  document.getElementById("lockPhase").remove();

  resultSection.insertAdjacentHTML("beforeend", `
    <div id="stealPhase" style="margin-top:1em;">
      <h3>🕵️ Steal Phase</h3>
      <p>Each player can steal 1 unlocked pick from another player. The swap must be for the same position.</p>
      <div id="stealContainer"></div>
      <button id="finalizeDraftBtn">Finalize Draft</button>
    </div>
  `);

  const container = document.getElementById("stealContainer");
  players.forEach((p, pIdx) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${p.name}'s Turn:</strong><br>`;

    // Select target player
    const selectTargetPlayer = document.createElement("select");
    selectTargetPlayer.id = `targetPlayer-${pIdx}`;
    selectTargetPlayer.innerHTML = `<option disabled selected value="">-- Choose Opponent --</option>` +
      players.map((op, i) => {
        if (i === pIdx) return "";
        return `<option value="${i}">${op.name}</option>`;
      }).join("");

    // Select target pick
    const selectTargetPick = document.createElement("select");
    selectTargetPick.id = `targetPick-${pIdx}`;
    selectTargetPick.innerHTML = `<option>Select a player first</option>`;

    // Confirm button
    const btn = document.createElement("button");
    btn.textContent = "Confirm Steal";
    btn.disabled = true;

    // Update pick options when a player is selected
    selectTargetPlayer.addEventListener("change", () => {
      const targetId = +selectTargetPlayer.value;
      const targetPlayer = players[targetId];
      const available = targetPlayer.picks
        .map((pick, i) => ({ ...pick, index: i }))
        .filter(pick => !targetPlayer.lockedIndices.includes(pick.index));

      if (!available.length) {
        selectTargetPick.innerHTML = `<option disabled>No unlocked picks</option>`;
        btn.disabled = true;
        return;
      }

      selectTargetPick.innerHTML = available.map(pick =>
        `<option value="${pick.index}" data-position="${pick.position}">${pick.character} (${pick.position}) — ${pick.category}</option>`
      ).join("");
      btn.disabled = false;
    });

    // Confirm button logic
btn.addEventListener("click", () => {
  const targetPlayerId = +selectTargetPlayer.value;
  const targetPickIndex = +selectTargetPick.value;
  const targetPick = players[targetPlayerId].picks[targetPickIndex];
  const position = targetPick.position;

  const ownPickIndex = p.picks.findIndex((pick, i) =>
    pick.position === position && !p.lockedIndices.includes(i)
  );

  if (ownPickIndex === -1) {
    alert(`No unlocked pick at position ${position} to swap.`);
    return;
  }

// Add markers
p.picks[ownPickIndex]._wasStolen = true; // Took this from someone (gets 🔄)
players[targetPlayerId].picks[targetPickIndex]._wasReceived = true; // Received a replacement (gets 🚮)


  // Swap picks
  const temp = { ...p.picks[ownPickIndex] };
  p.picks[ownPickIndex] = { ...targetPick };
  players[targetPlayerId].picks[targetPickIndex] = temp;

  // Disable UI
  btn.disabled = true;
  selectTargetPlayer.disabled = true;
  selectTargetPick.disabled = true;
});


    div.appendChild(selectTargetPlayer);
    div.appendChild(document.createTextNode(" → "));
    div.appendChild(selectTargetPick);
    div.appendChild(document.createElement("br"));
    div.appendChild(btn);
    container.appendChild(div);
    container.appendChild(document.createElement("br"));
  });

  document.getElementById("finalizeDraftBtn").addEventListener("click", () => {
    regeneratePrompt();
    document.getElementById("stealPhase").remove();
  });
}


function regeneratePrompt() {
  let newPrompt = `Final Draft Summary (with Locks and Steals):\n\n`;
  players.forEach(p => {
    newPrompt += `${p.name}'s Lineup:\n`;
    p.picks.forEach((pick, i) => {
      const isLocked = p.lockedIndices.includes(i);
      const lockNote = isLocked ? " 🔒" : "";
const stealNote = pick._wasStolen ? " 🔄" : pick._wasReceived ? " 🚮" : "";
newPrompt += `- ${pick.character} (${pick.position}) — ${pick.category}${lockNote}${stealNote}\n`;

    });
    newPrompt += "\n";
  });
newPrompt += `🔄 means the player took this pick from another player.\n🚮 means the player received this pick because one of theirs was stolen.\n\nEvaluate these baseball lineups after post-draft strategy (locks + steals). Assign OVR ratings and declare the strongest roster.`;
  promptOutput.value = newPrompt;
}

})();
