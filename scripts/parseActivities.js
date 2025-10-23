const fs = require('fs');
const path = require('path');

// Emoji to tag mapping
// Note: Some emojis have variation selectors (U+FE0F) which need to be handled
const emojiMap = {
  '💶': 'paid',
  '🆓': 'free',
  '☀️': 'sunny',
  '☀': 'sunny',
  '☔️': 'rainy',
  '☔': 'rainy',
  '🐶': 'dog_friendly',
  '♿️': 'accessible',
  '♿': 'accessible'
};

function parseActivities() {
  const inputPath = path.join(__dirname, '../activites.txt');
  const outputPath = path.join(__dirname, '../public/activities.json');

  // Read the file
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header lines (first 6 lines are the legend)
  const activities = [];
  const legendLines = 6;

  for (let i = legendLines; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const activity = parseLine(line);
    if (activity) {
      activities.push(activity);
    }
  }

  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(activities, null, 2));
  console.log(`✓ Parsed ${activities.length} activities`);
  console.log(`✓ Written to ${outputPath}`);
}

function parseLine(line) {
  // Extract emojis at the start
  const emojiRegex = /^([\u{1F300}-\u{1F9FF}💶🆓☀️☔️🐶♿️]+)\s+(.+)$/u;
  const match = line.match(emojiRegex);

  if (!match) {
    console.warn(`⚠ Could not parse: ${line.substring(0, 50)}...`);
    return null;
  }

  const emojis = match[1];
  const rest = match[2];

  // Parse tags from emojis
  const tags = [];
  const properties = {
    cost: null,
    weather: [],
    dog_friendly: false,
    accessible: false
  };

  for (const char of emojis) {
    if (emojiMap[char]) {
      const tag = emojiMap[char];
      tags.push(char);

      if (tag === 'paid' || tag === 'free') {
        properties.cost = tag;
      } else if (tag === 'sunny' || tag === 'rainy') {
        properties.weather.push(tag);
      } else if (tag === 'dog_friendly') {
        properties.dog_friendly = true;
      } else if (tag === 'accessible') {
        properties.accessible = true;
      }
    }
  }

  // Parse the rest: "Name, Location, Price/Details"
  // Split by comma to get parts
  const parts = rest.split(',').map(p => p.trim());

  let name = parts[0] || '';
  let location = '';
  let price = '';

  // Usually: parts[0] = name, parts[1] = location, parts[2+] = price/details
  if (parts.length > 1) {
    location = parts[1];
  }
  if (parts.length > 2) {
    price = parts.slice(2).join(', ');
  }

  // Clean up location - remove any trailing price indicators
  location = location.replace(/\s*\(.*\).*$/, '').trim();

  // If location still has price info, extract it
  const locPriceMatch = location.match(/^(.+?)\s*([£\$].*|FREE|from\s+.*)$/i);
  if (locPriceMatch) {
    location = locPriceMatch[1].trim();
    if (!price) price = locPriceMatch[2].trim();
  }

  // Generate ID from name
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id,
    name,
    location: location || 'Scotland',
    price: price || 'Contact for details',
    cost: properties.cost || 'mixed',
    weather: properties.weather.length > 0 ? properties.weather : ['sunny'],
    dog_friendly: properties.dog_friendly,
    accessible: properties.accessible,
    tags,
    lat: null,
    lng: null,
    description: `${name} in ${location}. ${price}`
  };
}

parseActivities();

