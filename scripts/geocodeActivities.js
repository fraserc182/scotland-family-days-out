const fs = require('fs');
const path = require('path');
const https = require('https');

const activitiesPath = path.join(__dirname, '../public/activities.json');

// Nominatim API endpoint
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Rate limiting: Nominatim requests 1 request per second max
const DELAY_MS = 1100;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function geocodeLocation(name, location) {
  return new Promise((resolve) => {
    // Try searching by location first (more reliable)
    // Extract just the town/city name from location
    const locationParts = location.split(/[,\.]/).map(p => p.trim());
    const town = locationParts[0];

    // Build search query - prioritize location over name
    const query = `${town}, Scotland`;
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: 1
    });

    const url = `${NOMINATIM_URL}?${params.toString()}`;

    https.get(url, {
      headers: { 'User-Agent': 'ScotlandDaysOut/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            const result = results[0];
            resolve({
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
              success: true
            });
          } else {
            resolve({ success: false });
          }
        } catch (e) {
          resolve({ success: false });
        }
      });
    }).on('error', () => {
      resolve({ success: false });
    });
  });
}

async function geocodeActivities() {
  console.log('📍 Starting geocoding...\n');

  const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));
  let geocoded = 0;
  let failed = 0;

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    // Skip if already has coordinates
    if (activity.lat && activity.lng) {
      console.log(`⏭️  [${i + 1}/${activities.length}] ${activity.name} (already geocoded)`);
      continue;
    }

    process.stdout.write(`🔍 [${i + 1}/${activities.length}] Geocoding: ${activity.name}... `);

    const result = await geocodeLocation(activity.name, activity.location);

    if (result.success) {
      activity.lat = result.lat;
      activity.lng = result.lng;
      console.log(`✓ (${result.lat.toFixed(3)}, ${result.lng.toFixed(3)})`);
      geocoded++;
    } else {
      console.log('✗ (no result)');
      failed++;
    }

    // Rate limiting
    if (i < activities.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Write updated activities
  fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2));

  console.log(`\n✓ Geocoding complete!`);
  console.log(`  - Geocoded: ${geocoded}`);
  console.log(`  - Failed: ${failed}`);
  console.log(`  - Total: ${activities.length}`);
}

geocodeActivities().catch(console.error);

