// Diagnostic Script - Run this to test seed image analysis setup
// Usage: Create test-seed-analysis.ts in the root and run: npx tsx test-seed-analysis.ts

import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const geminiApiKey = process.env.OPENAI_API_KEY!

console.log('🔍 Seed Image Analysis Diagnostic\n')

// Test 1: Check environment variables
console.log('1️⃣ Checking environment variables...')
if (!supabaseUrl) {
  console.error('   ❌ NEXT_PUBLIC_SUPABASE_URL is missing')
} else {
  console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
}

if (!supabaseAnonKey) {
  console.error('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
} else {
  console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: [HIDDEN]')
}

if (!geminiApiKey) {
  console.error('   ❌ OPENAI_API_KEY (Gemini) is missing')
} else {
  console.log('   ✅ OPENAI_API_KEY: [HIDDEN]')
}

// Test 2: Check Supabase connection
console.log('\n2️⃣ Testing Supabase connection...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('   ❌ Supabase connection failed:', error.message)
    } else {
      console.log('   ✅ Supabase connection successful')
    }
  })

// Test 3: Check if seed_image_analysis table exists
console.log('\n3️⃣ Checking seed_image_analysis table...')
supabase.from('seed_image_analysis').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('   ❌ Table does not exist')
        console.log('   💡 Solution: Run supabase-seed-analysis-schema.sql in Supabase SQL Editor')
      } else {
        console.error('   ❌ Error:', error.message)
      }
    } else {
      console.log(`   ✅ Table exists (${count} records)`)
    }
  })

// Test 4: Check storage bucket
console.log('\n4️⃣ Checking seed-images storage bucket...')
supabase.storage.getBucket('seed-images')
  .then(({ data, error }) => {
    if (error) {
      console.error('   ❌ Bucket does not exist:', error.message)
      console.log('   💡 Solution: Create "seed-images" bucket in Supabase Dashboard → Storage')
    } else {
      console.log('   ✅ Bucket exists')
      console.log('      - Public:', data.public)
      console.log('      - File size limit:', data.file_size_limit, 'bytes')
    }
  })

// Test 5: Check Gemini API
console.log('\n5️⃣ Testing Gemini API...')
try {
  const genAI = new GoogleGenerativeAI(geminiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  model.generateContent('Say "API Working"')
    .then((result) => {
      const text = result.response.text()
      console.log('   ✅ Gemini API working:', text.substring(0, 50))
    })
    .catch((error) => {
      console.error('   ❌ Gemini API failed:', error.message)
      console.log('   💡 Check if OPENAI_API_KEY is a valid Gemini API key')
    })
} catch (error: any) {
  console.error('   ❌ Failed to initialize Gemini:', error.message)
}

// Test 6: Check storage policies
console.log('\n6️⃣ Checking storage policies...')
supabase.storage.from('seed-images').list('', { limit: 1 })
  .then(({ data, error }) => {
    if (error && error.message.includes('policies')) {
      console.error('   ❌ Storage RLS policies missing')
      console.log('   💡 Solution: Run simple-storage-rls-fix.sql')
    } else {
      console.log('   ✅ Storage policies configured')
    }
  })

setTimeout(() => {
  console.log('\n✨ Diagnostic complete!\n')
  console.log('📋 Summary:')
  console.log('   - If table missing: Run supabase-seed-analysis-schema.sql')
  console.log('   - If bucket missing: Create seed-images bucket in Supabase')
  console.log('   - If API error: Check Gemini API key')
  console.log('   - If policies missing: Run simple-storage-rls-fix.sql')
}, 3000)
