const fs = require('fs');
const path = require('path');
const https = require('https');

const activitiesPath = path.join(__dirname, '../public/activities.json');

// Simple web search using Google Custom Search API alternative
// We'll use a basic approach with common patterns for Scottish attractions

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Search for activity details using DuckDuckGo API (no key required)
function searchActivity(name, location) {
  return new Promise((resolve) => {
    const query = `${name} ${location} Scotland`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json`;

    https.get(url, {
      headers: { 'User-Agent': 'ScotlandDaysOut/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const abstract = result.AbstractText || '';
          const url = result.AbstractURL || '';

          // Also check related topics for more info
          let relatedText = '';
          if (result.RelatedTopics && result.RelatedTopics.length > 0) {
            relatedText = result.RelatedTopics
              .slice(0, 3)
              .map(t => t.Text || '')
              .join(' ');
          }

          resolve({
            abstract: abstract,
            url: url,
            relatedText: relatedText
          });
        } catch (e) {
          resolve({ abstract: '', url: '', relatedText: '' });
        }
      });
    }).on('error', () => {
      resolve({ abstract: '', url: '', relatedText: '' });
    });
  });
}

function guessAgeRange(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('baby') || text.includes('toddler') || text.includes('under 3')) {
    return '0-3 years';
  }
  if (text.includes('preschool') || text.includes('nursery')) {
    return '2-5 years';
  }
  if (text.includes('softplay') || text.includes('bouncy')) {
    return '1-8 years';
  }
  if (text.includes('adventure') || text.includes('extreme') || text.includes('climbing')) {
    return '8+ years';
  }
  if (text.includes('zoo') || text.includes('farm') || text.includes('beach')) {
    return 'All ages';
  }
  
  return 'All ages';
}

async function enrichActivities() {
  console.log('🔍 Starting activity enrichment...\n');

  const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));
  let enriched = 0;

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    process.stdout.write(`📝 [${i + 1}/${activities.length}] Enriching: ${activity.name}... `);

    const searchResult = await searchActivity(activity.name, activity.location);

    // Extract website
    if (searchResult.url && !activity.website) {
      activity.website = searchResult.url;
    }

    // Guess age range
    activity.ageRange = guessAgeRange(activity.name, searchResult.abstract);

    // Enhance description if we got search results
    if (searchResult.abstract && searchResult.abstract.length > activity.description.length) {
      activity.description = searchResult.abstract;
    }

    console.log(`✓`);
    enriched++;

    // Rate limiting - be respectful to the API
    if (i < activities.length - 1) {
      await sleep(500);
    }
  }

  // Write updated activities
  fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2));

  console.log(`\n✓ Enrichment complete!`);
  console.log(`  - Enriched: ${enriched}`);
  console.log(`  - Total: ${activities.length}`);
}

enrichActivities().catch(console.error);

