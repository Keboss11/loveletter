async function loadJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}`);
  }
  return response.json();
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function pickRandom(items) {
  return items[randomInt(items.length)];
}

function seededShuffle(items, seed) {
  const result = [...items];
  let current = hashString(seed) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    current = (current * 9301 + 49297) % 233280;
    const swapIndex = current % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekKey(date = new Date()) {
  const localDate = new Date(date);
  const day = (localDate.getDay() + 6) % 7;
  localDate.setDate(localDate.getDate() - day);
  return getDateKey(localDate);
}

function getDailySelection(items, count, dateKey = getDateKey()) {
  return seededShuffle(items, dateKey).slice(0, count);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatRatio(current, total) {
  return `${current}/${total}`;
}