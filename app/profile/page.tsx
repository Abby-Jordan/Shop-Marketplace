"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProfileForm from "@/components/profile/ProfileForm"
import ChangePasswordForm from "@/components/auth/ChangePasswordForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMutation, useQuery } from "@apollo/client"
import { CHANGE_PASSWORD, UPDATE_PROFILE } from "@/graphql/mutation"
import { GET_PROFILE } from "@/graphql/queries"
import { ChangePasswordFormData, ProfileFormData } from "@/lib/validations"
import { useToast } from "@/hooks/use-toast"
import { client } from "@/lib/apollo-client"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [changePassword] = useMutation(CHANGE_PASSWORD)
  const [updateProfile] = useMutation(UPDATE_PROFILE)
  const { data: profileData, loading: profileLoading, refetch } = useQuery(GET_PROFILE, {
    fetchPolicy: 'cache-and-network',
  })

  const handleSubmitChangePassword = async (data: ChangePasswordFormData, reset: () => void, setIsLoading: (isLoading: boolean) => void) => {
    setIsLoading(true)

    try {
      await changePassword({
        variables: { oldPassword: data.currentPassword, newPassword: data.newPassword },
      })

      toast({ title: "Password Updated Successfully" })
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : error?.graphQLErrors?.[0]?.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitProfile = async (data: ProfileFormData, imageFile: File | null) => {
    setIsLoading(true)
    try {
      let profileImage = profileData?.me?.profileImage

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const response = await fetch('/api/profile/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: { 'Old-Image-Url': profileImage || '' },
        })

        if (!response.ok) throw new Error('Image upload failed')
        const { imageUrl } = await response.json()
        profileImage = imageUrl
      }

      await updateProfile({
        variables: {
          input: {
            name: data.name,
            phoneNumber: data.phoneNumber,
            profileImage,
            address: {
              street: data.address.street,
              city: data.address.city,
              state: data.address.state,
              zipCode: data.address.zipCode,
            },
          },
        },
      })

      // Refetch profile data after update
      await refetch()

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                {profileData?.me && (
                  <ProfileForm 
                    onSubmit={handleSubmitProfile}
                    isLoading={isLoading}
                    initialData={profileData.me}
                  />
                )}
              </TabsContent>
              <TabsContent value="password">
                <ChangePasswordForm onSubmit={handleSubmitChangePassword} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 