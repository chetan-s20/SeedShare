'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUserPassword } from '@/lib/supabase/profile'
import type { User } from '@supabase/supabase-js'

interface SecuritySettingsProps {
  user: User
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validate passwords
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setLoading(true)

    try {
      const { error } = await updateUserPassword(newPassword)
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        router.refresh()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across different devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {typeof window !== 'undefined' ? window.navigator.userAgent.split(' ').slice(0, 3).join(' ') : 'Browser'} • Active now
                </p>
              </div>
              <Button variant="outline" disabled>
                Current Device
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Session management features coming soon. You'll be able to view and revoke access from other devices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Two-factor authentication is not enabled
                </p>
              </div>
              <Button variant="outline" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login attempts to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Login history tracking coming soon. You'll be able to see recent login attempts, locations, and devices used to access your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
