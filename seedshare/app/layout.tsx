import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SeedShare - Enhanced Seed Library & Marketplace",
  description: "A unified digital ecosystem for seed sharing, expert guidance, and certified seed sales for farmers and urban gardeners.",
  keywords: ["seeds", "agriculture", "farming", "gardening", "marketplace", "seed exchange"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user from Supabase session
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  let user: { name: string; email: string; avatar?: string; role: string; points: number } | null = null;
  
  if (authUser) {
    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, email, avatar_url, role, points')
      .eq('id', authUser.id)
      .single();
    
    if (profile && !error) {
      const profileData = profile as any; // Type assertion for profile data
      user = {
        name: profileData.full_name || authUser.email?.split('@')[0] || 'User',
        email: profileData.email,
        avatar: profileData.avatar_url || undefined,
        role: profileData.role,
        points: profileData.points || 0,
      };
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
