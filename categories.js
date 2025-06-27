const categories = [
  // Fictional Characters
  "Superheroes", "Movie Villains", "TV Characters", "Sitcom Characters", "Anime Characters",
  "Cartoon Characters", "Pixar Characters", "Disney Characters", "Avengers", "DC Characters",
  "Harry Potter Characters", "Fantasy Book Characters", "Sci-Fi Characters", "Fictional Kid Characters", "Fictional Women",
  "Fictional Animals", "Fictional Dumb Characters", "Fictional Coaches", "Fictional Robots", "Fictional Siblings",
  "Fictional Teachers", "Star Trek Characters", "Video Game Villains", "Fictional Sidekicks", "Fictional Warriors",

  // Real People
  "Famous Scientists", "Famous Artists", "Famous Athletes", "Comedians", "Politicians",
  "Inventors", "Historical Women", "Historical Figures", "Royalty", "Billionaires",
  "Smart People", "Infamously Dumb People", "Influencers", "YouTubers", "SNL Cast Members",
  "CEOs", "Talk Show Hosts", "Celebrity Chefs", "Reality TV Stars", "Pop Culture Icons",
  "TV Judges", "Famous Dads", "Famous Moms", "Famous Kids", "Famous Siblings",

  // Athletes & Sports
  "NBA Players", "NFL Players", "Soccer Players", "MLB Players", "Olympians",
  "Sports Mascots", "Sports Movie Characters", "Fantasy Races (elves, orcs)", "RPG Characters", "Sports Coaches",
  "WWE Wrestlers", "Boxers", "Skateboarders", "Extreme Sports Athletes", "Announcers/Commentators",
  "Tennis Players", "Golfers", "Hockey Players", "Track & Field Stars", "Martial Artists",

  // Music & Entertainment
  "Rock Stars", "Rappers", "Pop Stars", "Boy Band Members", "Musicians",
  "TV Hosts", "Reality Show Contestants/Stars", "Broadway Characters", "Parody Artists",
  "Movie Characters", "Movie Heroes", "Movie Sidekicks", "Action Movie Characters", "Rom-Com Leads",
  "Nickelodeon Characters", "Cartoon Network Characters", "Looney Tunes", "Sesame Street Characters", "Muppets",
  "YouTube Stars", "Twitch Streamers", "Voice Actors", "Viral Personalities", "Music Video Stars",

  // Food & Drink (Personified)
  "Personified Candies", "Cereal/Snack Mascots", "Fast Food Mascots", "Fictional Foods", "Pizza Mascots",
  "Yellow and/or Green Food", "Soft Drinks", "Any Drinks", "Any Food", "Food Commercial Characters",

  // Animals & Creatures (Playable/Anthropomorphic)
  "Dog Breeds", "Bird Species", "Farm Animals", "Marine Animals", "Zoo Animals",
  "Dinosaurs", "Mythical Creatures", "Aliens", "Wizards", "Ninjas",
  "Pirates", "Cowboys", "Animal Sidekicks/Friends", "Flying Creatures", "Cute Creatures",
  "Real Animals", "Fictional Animals", "Jungle Animals", "Talking Animals", "Tiny Creatures",

  // Fictional Worlds & Powers
  "Star Wars Characters", "Pokemon", "Magic Users", "Superpowered Beings", "Fictional Warriors",
  "Fictional Leaders", "Fantasy Creatures", "Demigods", "Deities (any mythology)", "Legendary Heroes",
  "Magical Objects", "Supervillains", "Anything related to Elements", "Time Travelers", "Post-Apocalyptic Characters",

  // Places & Travel (Personified or Themed)
  "Anything Country Music Related", "City-Themed Characters", "Fictional Countries", "Theme Park Characters", "Island Characters",
  "Landmark-Themed Mascots", "Space Explorers", "Underwater Dwellers", "Vacation-Themed Characters", "Travel Show Hosts",

  // Objects (Only if Characterized or Anthropomorphic)
  "Fictional Vehicles (w/ personality)", "Animated Toys", "Musical Instruments (personified)", "Board Game Characters", "Tool-Themed Characters",
  "Fictional Weapons", "Toy Story Characters", "Household Objects", "Talking Furniture", "Real Weapons",

  // Tech & Games (Playable)
  "Video Game Characters", "Nintendo Characters (non-Pokemon)", "Arcade Characters", "Mobile Game Characters", "Retro Game Characters",
  "Fictional Hackers", "AI/Robot Characters", "Robots/Machines", "Gamers", "Gaming Avatars",

  // School & Learning
  "Fictional Teachers", "Fictional Students", "Baseball Movie Characters", "School Archetypes", "High School Movie Characters",
  "Hall Monitor Types", "Bullies & Nerds", "Detention Room Regulars", "Fictional People with Glasses", "Fictional People w/ More or Less than 2 eyes",

  // Letters & Names
  "Common Names (Boys)", "Common Names (Girls)", "Celebrity First Names", "Celebrity Last Names", "Fictional Last Names",
  "Alphabet-Themed Characters", "Nicknames", "Initial-Based Personas", "Funny Last Names", "Stage Names",

  // Themed Drafts A–Z
  "Anything starting with A", "Anything starting with B", "Anything starting with C", "Anything starting with D",
  "Anything starting with E", "Anything starting with F", "Anything starting with G", "Anything starting with H",
  "Anything starting with I", "Anything starting with J", "Anything starting with K", "Anything starting with L",
  "Anything starting with M", "Anything starting with N", "Anything starting with O", "Anything starting with P",
  "Anything starting with Q", "Anything starting with R", "Anything starting with S", "Anything starting with T",
  "Anything starting with U", "Anything starting with V", "Anything starting with W", "Anything starting with X",
  "Anything starting with Y", "Anything starting with Z",

  // Visual & Conceptual
  "(Mostly) White Things", "(Mostly) Orange Things", "Big Fictional Things", "Beautiful Characters", "Gross (but iconic) Characters",
  "Characters/People with Crazy Hairstyles", "Weather-Themed Characters", "Villains of Society", "Parental Figures (fictional)", "Holiday-Themed Characters",
  "Yellow Characters", "Tiny characters", "Sharp-Dressed Characters", "Round-Themed Characters", "Sticky or Slimy things/characters",

  // Abstract/Fun (Playable or Characterizable)
  "Meme Characters", "Viral Stars", "Famous Duos", "Mean Characters", "Fat Characters",
  "Aquatic Monsters", "Urban Legends", "Crazy Characters", "Bears (Fictional or Real)", "Parody Characters",

  // Time & Seasons & Numbers (Playable)
  "Famous Baseball Numbers", "Famous Soccer Numbers", "Famous Football Numbers", "Fictional Characters that have an iconic number", "Historical Dates",
  "Holiday Characters", "Halloween Monsters", "Christmas Characters", "Literally Anything", "Beach-Themed Characters"
];


// Helper function to get category count
function getCategoryCount() {
  return categories.length;
}