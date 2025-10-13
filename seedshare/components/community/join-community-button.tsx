'use client'

import { Button } from '@/components/ui/button'
import { joinCommunity, leaveCommunity } from '@/app/community/actions'
import { useState } from 'react'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface JoinCommunityButtonProps {
  communityId: string
  isMember: boolean
  size?: 'default' | 'sm' | 'lg'
}

export function JoinCommunityButton({ communityId, isMember, size = 'default' }: JoinCommunityButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [memberStatus, setMemberStatus] = useState(isMember)

  async function handleClick() {
    setIsLoading(true)
    
    if (memberStatus) {
      const result = await leaveCommunity(communityId)
      if (result.success) {
        setMemberStatus(false)
      }
    } else {
      const result = await joinCommunity(communityId)
      if (result.success) {
        setMemberStatus(true)
      }
    }
    
    setIsLoading(false)
  }

  return (
    <Button
      variant={memberStatus ? 'outline' : 'default'}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {memberStatus ? 'Leaving...' : 'Joining...'}
        </>
      ) : (
        <>
          {memberStatus ? (
            <>
              <UserMinus className="h-4 w-4 mr-2" />
              Leave
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Join
            </>
          )}
        </>
      )}
    </Button>
  )
}
