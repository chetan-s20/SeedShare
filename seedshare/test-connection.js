// Quick Backend Connectivity Test
// Run this with: node test-connection.js

const SUPABASE_URL = 'https://robnrtjlgzohlpkljyzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYm5ydGpsZ3pvaGxwa2xqeXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTYwMDMsImV4cCI6MjA3NTc5MjAwM30.D7w-GBivy2r6Gf4Kv_U_U3W7favP2OG7CSZvX_11BM8';

async function testConnection() {
  console.log('🔍 Testing Supabase Backend Connectivity...\n');
  
  // Test 1: Basic API endpoint
  console.log('Test 1: Checking Supabase REST API...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok || response.status === 404) {
      console.log('✅ Supabase REST API is reachable');
      console.log(`   Status: ${response.status}`);
    } else {
      console.log('❌ Supabase REST API returned unexpected status');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Failed to reach Supabase REST API');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 2: Check profiles table
  console.log('\nTest 2: Checking profiles table...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Profiles table exists and is accessible');
      console.log(`   Response: ${data}`);
    } else if (response.status === 404 || response.status === 406) {
      console.log('⚠️  Profiles table might not exist yet');
      console.log(`   Status: ${response.status}`);
      const errorText = await response.text();
      console.log(`   Message: ${errorText.substring(0, 100)}`);
    } else {
      console.log('❌ Unexpected response from profiles table');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Failed to query profiles table');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 3: Check auth endpoint
  console.log('\nTest 3: Checking Auth endpoint...');
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: {
        'apikey': SUPABASE_KEY
      }
    });
    
    if (response.ok) {
      console.log('✅ Auth service is healthy');
      const data = await response.json();
      console.log(`   Response:`, data);
    } else {
      console.log('⚠️  Auth health check returned non-OK status');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Failed to check auth health');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 4: Check storage endpoint
  console.log('\nTest 4: Checking Storage API...');
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      const buckets = await response.json();
      console.log('✅ Storage API is accessible');
      console.log(`   Found ${buckets.length} bucket(s)`);
      if (buckets.length > 0) {
        console.log('   Buckets:', buckets.map(b => b.name).join(', '));
      }
    } else {
      console.log('⚠️  Storage API returned non-OK status');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Failed to check storage buckets');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  console.log('Next steps:');
  console.log('1. Visit http://localhost:3002/system-check for detailed status');
  console.log('2. If tables are missing, run supabase-schema.sql in Supabase SQL Editor');
  console.log('3. If buckets are missing, create them in Supabase Storage');
  console.log('='.repeat(50));
}

testConnection();
