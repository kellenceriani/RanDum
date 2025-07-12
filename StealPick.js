(() => {
  const finishDraftBtn = document.getElementById("finishDraftBtn");
  const resultSection = document.getElementById("resultSection");
  const promptOutput = document.getElementById("promptOutput");
  const stealModeCheckbox = document.getElementById("stealPickCheckbox");

  let players = [];

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
        let match = line.match(/^\d+\.\s*([^()]+)\s*\(([^)]+)\)\s*—\s*(.*)/);
        if (!match) {
          match = line.match(/-\s*([^()]+)\s*\(([^)]+)\)\s*—\s*(.*)/);
        }
        if (!match) return null;
        const [, character, position, category] = match.map(x => x.trim());
        return { character, position, category, locked: false };
      }).filter(Boolean);
      return { name, picks, lockedIndices: [], stealUsed: false };
    });
  }

  function runLockPhase() {
    resultSection.insertAdjacentHTML("beforeend", `
      <div id="lockPhase" style="margin-top:1em;">
        <h3>🔒 Lock Phase</h3>
        <p>Each player must lock 2 picks. These cannot be stolen or swapped.</p>
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
        div.insertAdjacentText("beforeend", ` ${pick.character} (${pick.position}) — ${pick.category}`);
        div.appendChild(document.createElement("br"));
      });
      container.appendChild(div);
      container.appendChild(document.createElement("br"));
    });

    function validateLocks() {
      const confirmBtn = document.getElementById("confirmLocksBtn");
      const grouped = {};
      container.querySelectorAll("input[type='checkbox']").forEach(cb => {
        const pid = cb.dataset.player;
        grouped[pid] = grouped[pid] || 0;
        if (cb.checked) grouped[pid]++;
      });
      confirmBtn.disabled = !Object.values(grouped).every(count => count === 2);
    }

    document.getElementById("confirmLocksBtn").addEventListener("click", () => {
      container.querySelectorAll("input[type='checkbox']").forEach(cb => {
        if (cb.checked) {
          players[cb.dataset.player].lockedIndices.push(+cb.dataset.pick);
        }
      });
      runStealPhase();
    });
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

    players.forEach((player, pIdx) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${player.name}'s Turn:</strong><br>`;

      const selectOpponent = document.createElement("select");
      selectOpponent.innerHTML = `<option disabled selected value="">-- Choose Opponent --</option>` +
        players.map((op, i) => (i === pIdx ? "" : `<option value="${i}">${op.name}</option>`)).join("");

      const selectPick = document.createElement("select");
      selectPick.innerHTML = `<option>Select opponent first</option>`;

      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "Confirm Steal";
      confirmBtn.disabled = true;

      selectOpponent.addEventListener("change", () => {
        const targetId = +selectOpponent.value;
        const targetPlayer = players[targetId];

        const eligible = targetPlayer.picks
          .map((pick, idx) => ({ ...pick, index: idx }))
          .filter(pick =>
            !targetPlayer.lockedIndices.includes(pick.index) &&
            !pick._wasStolen &&
            player.picks.some((ownPick, i) =>
              ownPick.position === pick.position && !player.lockedIndices.includes(i)
            )
          );

        if (!eligible.length) {
          selectPick.innerHTML = `<option disabled>No eligible swaps</option>`;
          confirmBtn.disabled = true;
        } else {
          selectPick.innerHTML = eligible.map(p =>
            `<option value="${p.index}" data-pos="${p.position}">${p.character} (${p.position}) — ${p.category}</option>`
          ).join("");
          confirmBtn.disabled = false;
        }
      });

      confirmBtn.addEventListener("click", () => {
        const opponentId = +selectOpponent.value;
        const opponent = players[opponentId];
        const targetPickIndex = +selectPick.value;
        const targetPick = opponent.picks[targetPickIndex];
        const pos = targetPick.position;

        const ownPickIndex = player.picks.findIndex((p, i) =>
          p.position === pos && !player.lockedIndices.includes(i)
        );

        if (ownPickIndex === -1) {
          alert("No unlocked pick to swap in that position.");
          return;
        }

        // Perform strict position-based swap
        const tempOwn = { ...player.picks[ownPickIndex], _wasStolen: true };
        const tempOpponent = { ...targetPick, _wasReceived: true };

        player.picks[ownPickIndex] = tempOpponent;
        opponent.picks[targetPickIndex] = tempOwn;

        // Lock the buttons to prevent multiple steals
        confirmBtn.disabled = true;
        selectOpponent.disabled = true;
        selectPick.disabled = true;
      });

      div.appendChild(selectOpponent);
      div.appendChild(document.createTextNode(" → "));
      div.appendChild(selectPick);
      div.appendChild(document.createElement("br"));
      div.appendChild(confirmBtn);
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
      let batting = 1;
      p.picks.forEach((pick, i) => {
        const locked = p.lockedIndices.includes(i) ? " 🔒" : "";
        const stealNote = pick._wasStolen ? "🚮" : pick._wasReceived ? "🔄" : "";
        const isPitcher = /^(SP|RP|CP|UTIL|BENCH)/.test(pick.position);
        const prefix = isPitcher ? `-` : `${batting++}.`;
        newPrompt += `${prefix} ${pick.character} (${pick.position}) — ${pick.category}${locked}${stealNote}\n`;
      });
      newPrompt += `\n`;
    });

    newPrompt += `✨ SYMBOL KEY ✨\n`;
    newPrompt += `🔒 Locked: This pick was protected and safe from being stolen.\n`;
    newPrompt += `🔄 Snatched!: This pick was stolen **by** this player from another team's lineup.\n`;
    newPrompt += `🚮 Given: This pick was **taken from** this player and they received another in return.\n\n`;
    newPrompt += `📣 ANALYSIS REQUEST 📣\n`;
    newPrompt += `Please evaluate the final rosters in the following way:\n`;
    newPrompt += `1. **Rate the impact of steals and locks** – who played defensively, who took big risks, and who pulled off sneaky genius moves?\n`;
    newPrompt += `2. **Assign each player an Overal (OVR) score** from 1 to 99 (MLB the show style).\n`;
    newPrompt += `3. **Assign each team an Overall (OVR) score** from 1 to 100, with breakdowns – identify strengths, weaknesses, and unique combo.\n`;
    newPrompt += `**Declare the ultimate champion**\n`;

    promptOutput.value = newPrompt;
  }
})();
