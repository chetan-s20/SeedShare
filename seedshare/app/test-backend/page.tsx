import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Database, Lock, Image, Users } from 'lucide-react';

export const dynamic = 'force-dynamic'

export default async function BackendTestPage() {
  const supabase = await createClient();
  
  // Test 1: Database Connection
  let dbConnected = false;
  let dbError = null;
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    dbConnected = !error;
    dbError = error?.message;
  } catch (e: any) {
    dbError = e.message;
  }
  
  // Test 2: Auth Status
  let authWorking = false;
  let currentUser = null;
  let authError = null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    authWorking = !error;
    currentUser = user;
    authError = error?.message;
  } catch (e: any) {
    authError = e.message;
  }
  
  // Test 3: Check Tables
  const tables = [
    'profiles',
    'seeds',
    'marketplace_products',
    'orders',
    'seed_requests',
    'qa_posts',
    'qa_answers',
    'communities',
    'consultations',
    'gamification'
  ];
  
  const tableResults = await Promise.all(
    tables.map(async (table) => {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        return { table, exists: !error, error: error?.message };
      } catch (e: any) {
        return { table, exists: false, error: e.message };
      }
    })
  );
  
  // Test 4: Storage Buckets
  const buckets = ['seed-images', 'product-images', 'qr-codes', 'avatars', 'community-images'];
  let storageWorking = false;
  let bucketResults: any[] = [];
  try {
    const { data, error } = await supabase.storage.listBuckets();
    storageWorking = !error;
    bucketResults = buckets.map(bucket => ({
      name: bucket,
      exists: data?.some(b => b.name === bucket) || false
    }));
  } catch (e: any) {
    // Storage check failed
  }
  
  const allTestsPassed = dbConnected && authWorking && tableResults.every(t => t.exists);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Backend Status Check
          </h1>
          <p className="text-gray-600">
            Testing Supabase connection and database setup
          </p>
        </div>
        
        {/* Overall Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Status</CardTitle>
              {allTestsPassed ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  All Systems Operational
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-4 w-4" />
                  Issues Detected
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Database Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <CardTitle>Database Connection</CardTitle>
              </div>
              <CardDescription>PostgreSQL via Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {dbConnected ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700 font-medium">Failed</span>
                  </>
                )}
              </div>
              {dbError && (
                <p className="mt-2 text-sm text-red-600">Error: {dbError}</p>
              )}
            </CardContent>
          </Card>
          
          {/* Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-purple-600" />
                <CardTitle>Authentication</CardTitle>
              </div>
              <CardDescription>Supabase Auth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {authWorking ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">Working</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700 font-medium">Failed</span>
                  </>
                )}
              </div>
              {currentUser ? (
                <p className="mt-2 text-sm text-gray-600">
                  Logged in as: {currentUser.email}
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-600">No user logged in</p>
              )}
              {authError && (
                <p className="mt-2 text-sm text-red-600">Error: {authError}</p>
              )}
            </CardContent>
          </Card>
          
          {/* Storage */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-orange-600" />
                <CardTitle>Storage Buckets</CardTitle>
              </div>
              <CardDescription>Supabase Storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bucketResults.length > 0 ? (
                  bucketResults.map((bucket) => (
                    <div key={bucket.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{bucket.name}</span>
                      {bucket.exists ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-yellow-600">
                    Storage check unavailable. Create buckets manually.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tables */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle>Database Tables</CardTitle>
              </div>
              <CardDescription>{tableResults.length} tables checked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tableResults.map((result) => (
                  <div key={result.table} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{result.table}</span>
                    {result.exists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Configuration Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Environment variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL</span>
              <span className="text-green-600 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span className="text-green-600 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            {process.env.NEXT_PUBLIC_SUPABASE_URL && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium text-gray-700 mb-1">Project URL:</p>
                <p className="text-gray-600 font-mono break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Instructions */}
        {!allTestsPassed && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Setup Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!dbConnected && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">❌ Database not connected</p>
                  <p className="text-yellow-700">
                    1. Go to Supabase Dashboard → SQL Editor<br />
                    2. Copy contents of <code className="bg-yellow-100 px-1 rounded">supabase-schema.sql</code><br />
                    3. Paste and run the SQL code
                  </p>
                </div>
              )}
              {tableResults.some(t => !t.exists) && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">❌ Some tables missing</p>
                  <p className="text-yellow-700">
                    Run the complete database schema in Supabase SQL Editor
                  </p>
                </div>
              )}
              {bucketResults.some(b => !b.exists) && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">❌ Storage buckets missing</p>
                  <p className="text-yellow-700">
                    Create these public buckets in Supabase Storage:<br />
                    {buckets.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Success Message */}
        {allTestsPassed && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">
                    🎉 Backend is fully operational!
                  </h3>
                  <p className="text-green-700 text-sm">
                    All systems are working correctly. You can now start building features!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
