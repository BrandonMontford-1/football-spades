// constants/coaches.js
export const COACHES = [
  // AFC East
  { name: "McDermott", team: "buf", difficulty: "expert" },
  { name: "McDaniel", team: "mia", difficulty: "medium" },
  { name: "Belichick", team: "ne", difficulty: "expert" },
  { name: "Saleh", team: "nyj", difficulty: "easy" },
  
  // AFC North
  { name: "Harbaugh", team: "bal", difficulty: "expert" },
  { name: "Taylor", team: "cin", difficulty: "medium" },
  { name: "Stefanski", team: "cle", difficulty: "medium" },
  { name: "Tomlin", team: "pit", difficulty: "expert" },
  
  // AFC South
  { name: "Ryans", team: "hou", difficulty: "medium" },
  { name: "Steichen", team: "ind", difficulty: "medium" },
  { name: "Pederson", team: "jac", difficulty: "medium" },
  { name: "Callahan", team: "ten", difficulty: "medium" },
  
  // AFC West
  { name: "Payton", team: "den", difficulty: "medium" },
  { name: "Reid", team: "kc", difficulty: "expert" },
  { name: "Pierce", team: "lv", difficulty: "easy" },
  { name: "Harbaugh", team: "lac", difficulty: "expert" },
  
  // NFC East
  { name: "McCarthy", team: "dal", difficulty: "medium" },
  { name: "Daboll", team: "nyg", difficulty: "easy" },
  { name: "Sirianni", team: "phi", difficulty: "medium" },
  { name: "Quinn", team: "was", difficulty: "medium" },
  
  // NFC North
  { name: "Eberflus", team: "chi", difficulty: "easy" },
  { name: "Campbell", team: "det", difficulty: "medium" },
  { name: "LaFleur", team: "gb", difficulty: "expert" },
  { name: "O'Connell", team: "min", difficulty: "medium" },
  
  // NFC South
  { name: "Morris", team: "atl", difficulty: "medium" },
  { name: "Canales", team: "car", difficulty: "easy" },
  { name: "Allen", team: "no", difficulty: "medium" },
  { name: "Bowles", team: "tb", difficulty: "medium" },
  
  // NFC West
  { name: "Gannon", team: "ari", difficulty: "easy" },
  { name: "McVay", team: "lar", difficulty: "expert" },
  { name: "Shanahan", team: "sf", difficulty: "expert" },
  { name: "MacDonald", team: "sea", difficulty: "medium" },
];

export function getRandomCoaches(count = 3, excludeTeam = null) {
  let available = [...COACHES];
  if (excludeTeam) {
    available = available.filter(c => c.team !== excludeTeam);
  }
  // Fisher-Yates shuffle
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, count);
}

export const getRandomCoach = (difficulty) => {
  const filtered = COACHES.filter(c => c.difficulty === difficulty);
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  return { name: random?.name || "Coach", id: random?.team || "none" };
};
