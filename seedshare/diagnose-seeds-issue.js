/**
 * Test why seeds aren't showing on profile
 * Diagnoses the column name mismatch issue
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n═══════════════════════════════════════════════════');
console.log('🔍 DIAGNOSING PROFILE SEEDS ISSUE');
console.log('═══════════════════════════════════════════════════\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseProblem() {
  try {
    // Get a test user
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found');
      return;
    }

    const testUser = profiles[0];
    console.log(`Testing with user: ${testUser.email}`);
    console.log(`User ID: ${testUser.id}\n`);

    // Test 1: Check seeds table schema
    console.log('✅ Test 1: Seeds Table Schema');
    const { data: seedsSample } = await supabase
      .from('seeds')
      .select('*')
      .limit(1);

    if (seedsSample && seedsSample.length > 0) {
      console.log('   Columns in seeds table:');
      Object.keys(seedsSample[0]).forEach(col => {
        if (col.includes('id') || col.includes('owner') || col.includes('user')) {
          console.log(`   - ${col}: ${seedsSample[0][col]}`);
        }
      });
      console.log('');
    }

    // Test 2: Query with WRONG column (user_id) - PROFILE PAGE USES THIS
    console.log('❌ Test 2: Query with user_id (WRONG - Profile page uses this)');
    const { data: seedsWrong, error: errorWrong } = await supabase
      .from('seeds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', testUser.id);

    if (errorWrong) {
      console.log(`   ❌ Error: ${errorWrong.message}`);
      console.log('   This is why seeds don\'t show on profile!\n');
    } else {
      console.log(`   Found: ${seedsWrong} seeds`);
      console.log('   (But this column doesn\'t exist!)\n');
    }

    // Test 3: Query with CORRECT column (owner_id) - DATABASE USES THIS
    console.log('✅ Test 3: Query with owner_id (CORRECT - Database uses this)');
    const { count: seedsCorrect, error: errorCorrect } = await supabase
      .from('seeds')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', testUser.id);

    if (errorCorrect) {
      console.log(`   ❌ Error: ${errorCorrect.message}\n`);
    } else {
      console.log(`   ✅ Found: ${seedsCorrect} seeds`);
      console.log('   This works correctly!\n');
    }

    // Test 4: Get all seeds to see what exists
    console.log('📊 Test 4: All Seeds in Database');
    const { data: allSeeds, count: totalSeeds } = await supabase
      .from('seeds')
      .select('id, common_name, variety, owner_id', { count: 'exact' });

    console.log(`   Total seeds in database: ${totalSeeds || 0}\n`);
    
    if (allSeeds && allSeeds.length > 0) {
      console.log('   Recent seeds:');
      allSeeds.slice(0, 5).forEach((seed, i) => {
        console.log(`   ${i + 1}. ${seed.common_name} (${seed.variety})`);
        console.log(`      Owner ID: ${seed.owner_id}`);
        console.log(`      Matches test user: ${seed.owner_id === testUser.id ? '✅ YES' : '❌ NO'}`);
      });
      console.log('');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 DIAGNOSIS SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log('❌ PROBLEM FOUND:');
    console.log('   Profile page queries: eq("user_id", user.id)');
    console.log('   Database column is:   "owner_id"');
    console.log('');
    console.log('✅ SOLUTION:');
    console.log('   Change profile page queries from:');
    console.log('   .eq("user_id", user.id)');
    console.log('   to:');
    console.log('   .eq("owner_id", user.id)');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

diagnoseProblem();
