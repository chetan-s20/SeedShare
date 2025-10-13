import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Database, Lock, Image, Users, Code, Server } from 'lucide-react';
import Link from 'next/link';

export default async function SystemCheckPage() {
  const checks = {
    environment: false,
    database: false,
    auth: false,
    tables: [] as any[],
    storage: false,
    components: false,
  };

  let currentUser = null;
  let errors: string[] = [];

  try {
    // 1. Environment Variables Check
    checks.environment = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (checks.environment) {
      const supabase = await createClient();

      // 2. Database Connection Check
      try {
        const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
        checks.database = !dbError;
        if (dbError) errors.push(`Database: ${dbError.message}`);
      } catch (e: any) {
        errors.push(`Database connection: ${e.message}`);
      }

      // 3. Auth Check
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        checks.auth = !authError;
        currentUser = user;
        if (authError) errors.push(`Auth: ${authError.message}`);
      } catch (e: any) {
        errors.push(`Auth check: ${e.message}`);
      }

      // 4. Tables Check
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
        'gamification',
      ];

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          checks.tables.push({ name: table, exists: !error, error: error?.message });
        } catch (e: any) {
          checks.tables.push({ name: table, exists: false, error: e.message });
        }
      }

      // 5. Storage Check
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        checks.storage = !storageError && buckets && buckets.length > 0;
        if (storageError) errors.push(`Storage: ${storageError.message}`);
      } catch (e: any) {
        errors.push(`Storage check: ${e.message}`);
      }
    } else {
      errors.push('Environment variables not configured');
    }

    // 6. Components Check
    checks.components = true; // If page loads, components are working
  } catch (e: any) {
    errors.push(`System check error: ${e.message}`);
  }

  const allTablesPassing = checks.tables.every((t) => t.exists);
  const criticalSystemsOk = checks.environment && checks.database && checks.auth;
  const allSystemsOk = criticalSystemsOk && allTablesPassing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Status Check
          </h1>
          <p className="text-gray-600">
            Complete diagnostic of SeedShare platform
          </p>
        </div>

        {/* Overall Status */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Overall Status</CardTitle>
              {allSystemsOk ? (
                <Badge className="bg-green-500 text-white px-4 py-2 text-base">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  All Systems Operational
                </Badge>
              ) : criticalSystemsOk ? (
                <Badge className="bg-yellow-500 text-white px-4 py-2 text-base">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Partial - Setup Required
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-4 py-2 text-base">
                  <XCircle className="mr-2 h-5 w-5" />
                  Critical Issues Detected
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Environment Variables */}
          <Card className={checks.environment ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className={`h-5 w-5 ${checks.environment ? 'text-green-600' : 'text-red-600'}`} />
                  <CardTitle className="text-lg">Environment</CardTitle>
                </div>
                {checks.environment ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>SUPABASE_URL</span>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex justify-between">
                  <span>SUPABASE_ANON_KEY</span>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card className={checks.database ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className={`h-5 w-5 ${checks.database ? 'text-green-600' : 'text-red-600'}`} />
                  <CardTitle className="text-lg">Database</CardTitle>
                </div>
                {checks.database ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {checks.database ? (
                  <span className="text-green-700 font-medium">PostgreSQL Connected</span>
                ) : (
                  <span className="text-red-700 font-medium">Connection Failed</span>
                )}
              </p>
              {!checks.database && (
                <p className="text-xs text-red-600 mt-2">
                  Run supabase-schema.sql in Supabase SQL Editor
                </p>
              )}
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card className={checks.auth ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className={`h-5 w-5 ${checks.auth ? 'text-green-600' : 'text-red-600'}`} />
                  <CardTitle className="text-lg">Authentication</CardTitle>
                </div>
                {checks.auth ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="text-sm">
                  <p className="text-green-700 font-medium mb-1">✓ Logged In</p>
                  <p className="text-gray-600 text-xs truncate">{currentUser.email}</p>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-gray-600 mb-2">Not logged in</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Storage */}
          <Card className={checks.storage ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image className={`h-5 w-5 ${checks.storage ? 'text-green-600' : 'text-yellow-600'}`} />
                  <CardTitle className="text-lg">Storage</CardTitle>
                </div>
                {checks.storage ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {checks.storage ? (
                  <span className="text-green-700 font-medium">Buckets Available</span>
                ) : (
                  <span className="text-yellow-700 font-medium">Create Storage Buckets</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Components */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Components</CardTitle>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 font-medium">
                shadcn/ui Loaded
              </p>
            </CardContent>
          </Card>

          {/* Tables Summary */}
          <Card className={allTablesPassing ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className={`h-5 w-5 ${allTablesPassing ? 'text-green-600' : 'text-yellow-600'}`} />
                  <CardTitle className="text-lg">Database Tables</CardTitle>
                </div>
                {allTablesPassing ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">
                <span className={allTablesPassing ? 'text-green-700' : 'text-yellow-700'} >
                  {checks.tables.filter((t) => t.exists).length} / {checks.tables.length} tables
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Database Tables Detail */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>Status of all required tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {checks.tables.map((table) => (
                <div
                  key={table.name}
                  className={`p-3 rounded-lg border ${
                    table.exists
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{table.name}</span>
                    {table.exists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Errors */}
        {errors.length > 0 && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Errors Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-red-700">
                {errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {allSystemsOk && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2 text-lg">
                    🎉 System Fully Operational!
                  </h3>
                  <p className="text-green-700 mb-3">
                    All systems are working correctly. Your SeedShare platform is ready to use!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href="/">Go to Homepage</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/library">Seed Library</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/marketplace">Marketplace</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        {!allSystemsOk && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!checks.environment && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">1. Configure Environment Variables</p>
                  <p className="text-yellow-700">
                    Add your Supabase credentials to <code className="bg-yellow-100 px-1 rounded">.env.local</code>
                  </p>
                </div>
              )}
              {!checks.database && checks.environment && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">2. Run Database Schema</p>
                  <p className="text-yellow-700">
                    1. Go to Supabase Dashboard → SQL Editor<br />
                    2. Copy contents of <code className="bg-yellow-100 px-1 rounded">supabase-schema.sql</code><br />
                    3. Paste and run the SQL code
                  </p>
                </div>
              )}
              {!checks.storage && checks.environment && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">3. Create Storage Buckets</p>
                  <p className="text-yellow-700">
                    Go to Storage tab and create: seed-images, product-images, qr-codes, avatars, community-images
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            <Link href="/" className="text-green-600 hover:underline">Home</Link>
            {' • '}
            <Link href="/test-backend" className="text-green-600 hover:underline">Backend Test</Link>
            {' • '}
            <Link href="/auth/login" className="text-green-600 hover:underline">Login</Link>
            {' • '}
            <a href="https://github.com/chetan-s20/SeedShare" className="text-green-600 hover:underline">GitHub</a>
          </p>
        </div>
      </div>
    </div>
  );
}
