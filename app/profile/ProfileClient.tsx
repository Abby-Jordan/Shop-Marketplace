'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROFILE } from '@/graphql/queries';
import { UPDATE_PROFILE } from '@/graphql/mutation';
import { Role } from '@prisma/client';
import { client } from '@/lib/apollo-client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  profileImage: string | null;
  phoneNumber: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  } | null;
  bio: string | null;
  preferences: Record<string, any> | null;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
}

export default function ProfileClient() {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_PROFILE);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const profile = data?.me;

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    bio: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        country: profile.address?.country || '',
        zipCode: profile.address?.zipCode || '',
      });
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {
      const { data: profileData } = await client.query({ query: GET_PROFILE });
      const oldImageUrl = profileData.me?.profileImage || '';

      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formDataFile,
        credentials: 'include',
        headers: { 'Old-Image-Url': oldImageUrl },
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      await updateProfile({
        variables: {
          input: { profileImage: data.imageUrl },
        },
        refetchQueries: [{ query: GET_PROFILE }],
      });

      toast.success('Profile image updated successfully');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        variables: {
          input: {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            bio: formData.bio,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              country: formData.country,
              zipCode: formData.zipCode,
            },
          },
        },
        refetchQueries: [{ query: GET_PROFILE }],
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <Button onClick={() => router.push('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={profile.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('profile-image')?.click()}
                  className="w-full"
                >
                  Change Profile Image
                </Button>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputGroup label="Name" id="name" value={formData.name} onChange={handleChange} />
                  <InputGroup label="Phone Number" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['street', 'city', 'state', 'country', 'zipCode'].map((field) => (
                      <InputGroup
                        key={field}
                        id={field}
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field as keyof typeof formData]}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <DisplayField label="Name" value={profile.name} />
                  <DisplayField label="Email" value={profile.email} />
                  <DisplayField label="Phone Number" value={profile.phoneNumber || 'Not provided'} />
                  <DisplayField label="Bio" value={profile.bio || 'Not provided'} multiline />
                  {profile.address && (
                    <DisplayField
                      label="Address"
                      value={`${profile.address.street}, ${profile.address.city}, ${profile.address.state}, ${profile.address.country} ${profile.address.zipCode}`}
                    />
                  )}
                  <div className="flex justify-end mt-6">
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper input group component
const InputGroup = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (field: string, value: string) => void;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
    />
  </div>
);

// Helper display component
const DisplayField = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) => (
  <div>
    <Label>{label}</Label>
    <p className={`text-lg ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value}</p>
  </div>
);
