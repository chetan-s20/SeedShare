'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserEmail, deleteUserAccount } from '@/lib/supabase/profile'
import { Loader2, Mail, Trash2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AccountSettingsProps {
  user: any
  profile: any
}

export function AccountSettings({ user, profile }: AccountSettingsProps) {
  const router = useRouter()
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [newEmail, setNewEmail] = useState(user.email || '')

  const handleUpdateEmail = async () => {
    if (newEmail === user.email) {
      alert('New email is the same as current email')
      return
    }

    setIsUpdatingEmail(true)

    try {
      const { success, error } = await updateUserEmail(newEmail)

      if (error) {
        alert(`Error updating email: ${error.message}`)
      } else {
        alert('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      console.error('Email update error:', err)
      alert('Failed to update email')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)

    try {
      const { success, error } = await deleteUserAccount()

      if (error) {
        alert(`Error deleting account: ${error.message}`)
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('Delete account error:', err)
      alert('Failed to delete account')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>Update your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your-email@example.com"
              />
              <Button
                onClick={handleUpdateEmail}
                disabled={isUpdatingEmail || newEmail === user.email}
              >
                {isUpdatingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current: {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">User ID</p>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-semibold">{profile?.role || 'Gardener'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Account Created</p>
              <p className="font-semibold">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email Verified</p>
              <p className="font-semibold">
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-600 dark:border-red-400">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers including:
                  <ul className="list-disc list-inside mt-2">
                    <li>All your seeds</li>
                    <li>Exchange history</li>
                    <li>Community posts</li>
                    <li>Marketplace orders</li>
                    <li>Profile information</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, delete my account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
