import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface ProfilePanelProps {
  profile: any | null
  isSaving: boolean
  isAuthenticated?: boolean
  loading?: boolean
  onChange: (field: string, value: string) => void
  onSave: () => void
  onBack: () => void
}

const fields: Array<{ key: string; label: string; colSpan?: number }> = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address', colSpan: 2 },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
]

function ProfilePanelComponent({ profile, isSaving, loading, isAuthenticated, onChange, onSave, onBack }: ProfilePanelProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm">Update your account information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back to Selected Services</Button>
        </div>
      </div>
      {loading && (
        <Card className="bg-white">
          <CardContent className="p-4 text-sm text-gray-500">Loading profile…</CardContent>
        </Card>
      )}
      {!loading && !profile && (
        <Card className="bg-white">
          <CardContent className="p-4 text-sm text-gray-500">{isAuthenticated ? 'No profile data found. Use the form below to create it.' : 'Sign in to view your profile.'}</CardContent>
        </Card>
      )}
      {profile && !loading && (
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.key} className={f.colSpan === 2 ? 'md:col-span-2' : undefined}>
                  <Label className="text-sm">{f.label}</Label>
                  <Input
                    value={profile[f.key] ?? ''}
                    onChange={e => onChange(f.key, (e.target as HTMLInputElement).value)}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

const ProfilePanel = React.memo(ProfilePanelComponent)
export default ProfilePanel
