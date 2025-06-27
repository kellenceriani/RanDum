(() => {
  let categories = [];

  async function loadCategories() {
categories = [
    "Superheroes", "Mario Characters", "TV Characters", "Dog Breeds", "Famous Scientists",
    "Movie Villains", "Mythical Creatures", "Star Wars Characters", "Pokemon", "NBA players (past/present)",
    "Pixar Characters", "Disney Characters", "Avengers", "DC Characters", "Inanimate Objects",
    "Anime Characters", "Harry Potter Characters", "Marvel Villains", "Cartoon Characters", "Video Game Characters",
    "Famous Artists", "Famous Athletes", "Comedians", "SNL Cast Members", "Rappers",
    "Politicians", "Rock Bands", "Nonfictional Women", "Robots", "Sitcom Characters",
    "Fast Food Chains", "Snacks", "Cereals", "Candies", "Fruits",
    "Vegetables", "Soft Drinks", "Pizza Toppings", "Ice Cream Flavors", "Sandwich Types",
    "Reptiles", "(mostly) White things", "(mostly) orange things", "Mobile Games", "Numbers",
    "Beautiful Things", "Fantasy Book Characters", "RPG Characters", "Baseball Players (Past/Present)", "Girly things",
    "Countries", "Cities", "Landmarks", "Fictional Stupid Characters", "Historical Figures",
    "Inventors (fiction/nonfiction)", "School related things", "Cartoon Network Characters", "Nickelodeon Characters", "Royalty",
    "Nintendo Characters (no pokemon)", "Bird Species", "Insects", "Marine Animals", "Jungle Animals",
    "Animals", "Farm Animals", "Mammals", "Fictional Animals", "Sci-Fi Characters",
    "YouTubers", "Phone Apps", "Influencers", "Sports Movie/Show Characters", "Detriments to Society",
    "Jobs/Occupations", "Fictional Inanimate Objects", "Fictional Women", "Soccer players (past/present)", "NFL players (past/present)","Cars", "Historic Events", "Inventions", "Essential Items/Objects", "Famous Couples",
    "Travel Destinations", "Magic Related things", "Superpowers", "Fictional Locations", "Gross things",
    "Comedians", "Toys", "Cartoon Network Shows", "Nickelodeon Shows", "Fictional Kid Characters",
    "Princesses (fiction & nonfiction)", "Sidekicks", "Monkeys (fiction & nonfiction)", "Movies", "Fantasy Novels",
    "Villains", "Household Items", "Common Names", "Olympic Sports", "Sports Mascots",
    "Gods/Goddesses", "Big things (real)", "Holiday Related Entities", "Stupid People", "Smart People", "Anything starting with 'A'", "Anything starting with 'B'", "Anything starting with 'C'", "Anything starting with 'D'", "Anything starting with 'E'", "Anything starting with 'F'", "Anything starting with 'G'", "Anything starting with 'H'", "Anything starting with 'I'", "Anything starting with 'J'", "Anything starting with 'K'", "Anything starting with 'L'", "Anything starting with 'M'", "Anything starting with 'N'", "Anything starting with 'O'", "Anything starting with 'P'", "Anything starting with 'Q'", "Anything starting with 'R'", "Anything starting with 'S'", "Anything starting with 'T'", "Anything starting with 'U'", "Anything starting with 'V'", "Anything starting with 'W'", "Anything starting with 'X'", "Anything starting with 'Y'", "Anything starting with 'Z'",
  ];
  }

  const lineupPositions = ["CF", "LF", "RF", "2B", "3B", "SS", "1B", "C", "DH", "SP"];
  const battingOrderPositions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const playerCountInput = document.getElementById("playerCount");
  const playersContainer = document.getElementById("playersContainer");
  const snakeDraftCheckbox = document.getElementById("snakeDraftCheckbox");
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

  function remainingPicks(player) {
    return 10 - player.lineup.length;
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
    categoryDisplay.classList.remove("spin");
    void categoryDisplay.offsetWidth;
    categoryDisplay.textContent = newCategory;
    categoryDisplay.classList.add("spin");
  }

  function renderDraftArea() {
    draftArea.innerHTML = "";
    const currentPlayerIndex = pickOrder[currentPick];
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
      for (let i = 1; i <= 9; i++) {
        const pick = p.lineup.find(l => l.battingOrder === i && l.position !== "SP");
        const li = document.createElement("li");
        li.style.marginLeft = "1em";
        li.textContent = pick ? `${pick.character} (${pick.position}) — ${pick.category}` : "[Not Picked]";
        battingOrderList.appendChild(li);
      }
      playerDiv.appendChild(battingOrderList);

      const spPick = p.lineup.find(l => l.position === "SP");
      const spDiv = document.createElement("div");
      spDiv.innerHTML = `<strong>SP:</strong> ${spPick ? `${spPick.character} — ${spPick.category}` : "[Not Picked]"}`;
      playerDiv.appendChild(spDiv);

      if (idx === currentPlayerIndex) {
        const form = document.createElement("form");
        form.style.marginTop = "0.5em";

        const charInput = document.createElement("input");
        charInput.type = "text";
        charInput.placeholder = "Character";
        charInput.required = true;
        charInput.style.marginRight = "0.5em";

        const posSelect = document.createElement("select");
        posSelect.required = true;
        posSelect.style.marginRight = "0.5em";

        const takenPositions = p.lineup.map(i => i.position);
        lineupPositions.forEach(pos => {
          if (!takenPositions.includes(pos)) {
            const option = document.createElement("option");
            option.value = pos;
            option.textContent = pos;
            posSelect.appendChild(option);
          }
        });

        const battingOrderSelect = document.createElement("select");
        battingOrderSelect.required = true;
        battingOrderSelect.style.marginRight = "0.5em";

        const takenOrders = p.lineup
          .filter(l => l.position !== "SP")
          .map(l => l.battingOrder);
        battingOrderPositions.forEach(n => {
          if (!takenOrders.includes(+n)) {
            const option = document.createElement("option");
            option.value = n;
            option.textContent = n;
            battingOrderSelect.appendChild(option);
          }
        });

        function updateBattingVisibility() {
          if (posSelect.value === "SP") {
            battingOrderSelect.style.display = "none";
            battingOrderSelect.required = false;
          } else {
            battingOrderSelect.style.display = "inline-block";
            battingOrderSelect.required = true;
          }
        }

        posSelect.addEventListener("change", updateBattingVisibility);
        updateBattingVisibility();

        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.textContent = "Pick";

        form.appendChild(charInput);
        form.appendChild(posSelect);
        form.appendChild(battingOrderSelect);
        form.appendChild(submitBtn);

        form.addEventListener("submit", e => {
          e.preventDefault();
          const character = charInput.value.trim();
          const position = posSelect.value;
          const battingOrder = position !== "SP" ? parseInt(battingOrderSelect.value, 10) : null;

          if (!character || !position || (position !== "SP" && !battingOrder)) return;

          if (p.lineup.find(l => l.position === position)) return alert("Position already drafted.");
          if (position !== "SP" && p.lineup.find(l => l.battingOrder === battingOrder)) return alert("Batting slot taken.");

          p.lineup.push({ character, position, category: currentCategory, battingOrder });

          currentPick++;

          if (players.every(pl => pl.lineup.length === 10)) {
            finishDraftBtn.classList.remove("hidden");
            draftArea.innerHTML = "";
            renderDraftArea();
            return;
          }

          if (currentPick % players.length === 0) {
            currentCategory = categories[Math.floor(Math.random() * categories.length)];
            animateCategory(currentCategory);
          } else {
            categoryDisplay.textContent = currentCategory;
          }

          renderDraftArea();
        });

        playerDiv.appendChild(form);
      }

      draftArea.appendChild(playerDiv);
    });
  }

  startDraftBtn.addEventListener("click", () => {
    const inputs = [...document.querySelectorAll(".playerNameInput")];
    players = inputs.map((inp, i) => ({
      name: inp.value.trim() || `Player ${i + 1}`,
      lineup: []
    }));

    const isSnake = snakeDraftCheckbox.checked;
    const picksPerPlayer = 10;
    totalPicks = players.length * picksPerPlayer;

    currentPick = 0;
    currentRound = 0;
    pickOrder = isSnake
      ? generateSnakePickOrder(players.length, totalPicks)
      : Array.from({ length: totalPicks }, (_, i) => i % players.length);

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

      const batting = p.lineup.filter(l => l.position !== "SP").sort((a, b) => a.battingOrder - b.battingOrder);
      batting.forEach(pick => {
        summary += `-${pick.battingOrder}: ${pick.character} (${pick.position}) — ${pick.category}\n`;
      });

      const sp = p.lineup.find(l => l.position === "SP");
      summary += `- SP: ${sp ? `${sp.character} — ${sp.category}` : "[No pick]"}\n\n`;
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

  loadCategories();
})();
