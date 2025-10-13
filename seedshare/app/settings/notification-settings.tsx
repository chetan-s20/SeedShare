'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUserProfile } from '@/lib/supabase/profile'
import type { User } from '@supabase/supabase-js'

interface NotificationSettingsProps {
  user: User
  profile: any
  initialSettings?: {
    email_notifications: boolean
    exchange_notifications: boolean
    order_notifications: boolean
    community_notifications: boolean
    marketing_emails: boolean
  }
}

export function NotificationSettings({ user, profile, initialSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    email_notifications: initialSettings?.email_notifications ?? true,
    exchange_notifications: initialSettings?.exchange_notifications ?? true,
    order_notifications: initialSettings?.order_notifications ?? true,
    community_notifications: initialSettings?.community_notifications ?? true,
    marketing_emails: initialSettings?.marketing_emails ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // TODO: Implement notification preferences save to database
      // For now, just store in localStorage as a temporary solution
      if (typeof window !== 'undefined') {
        localStorage.setItem('notification_preferences', JSON.stringify(settings))
      }
      
      setMessage({ type: 'success', text: 'Notification preferences saved successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save notification preferences' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">All Email Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Master toggle for all email notifications
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.email_notifications}
              onClick={() => handleToggle('email_notifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                settings.email_notifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="exchange-notifications">Seed Exchange Updates</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about seed exchange requests and updates
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.exchange_notifications}
              onClick={() => handleToggle('exchange_notifications')}
              disabled={!settings.email_notifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                settings.exchange_notifications && settings.email_notifications
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${!settings.email_notifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.exchange_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-notifications">Marketplace Orders</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive updates about your marketplace orders and sales
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.order_notifications}
              onClick={() => handleToggle('order_notifications')}
              disabled={!settings.email_notifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                settings.order_notifications && settings.email_notifications
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${!settings.email_notifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.order_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="community-notifications">Community Activity</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about replies, likes, and mentions in the community
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.community_notifications}
              onClick={() => handleToggle('community_notifications')}
              disabled={!settings.email_notifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                settings.community_notifications && settings.email_notifications
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${!settings.email_notifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.community_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing & Updates</CardTitle>
          <CardDescription>
            Receive news, tips, and updates from SeedShare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive newsletters, promotions, and product updates
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.marketing_emails}
              onClick={() => handleToggle('marketing_emails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                settings.marketing_emails ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.marketing_emails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications (Future) */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Receive notifications directly in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browser push notifications coming soon. You'll be able to receive real-time updates even when you're not actively using SeedShare.
            </p>
            <Button variant="outline" disabled>
              Enable Push Notifications (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
