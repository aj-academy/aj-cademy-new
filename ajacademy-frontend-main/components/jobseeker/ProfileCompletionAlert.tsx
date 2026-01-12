import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  resume?: string;
  skills?: string[];
  education?: any[];
  experience?: any[];
}

interface ProfileCompletionAlertProps {
  profileData: ProfileData | null;
  isLoading?: boolean;
}

const ProfileCompletionAlert = ({ profileData, isLoading = false }: ProfileCompletionAlertProps) => {
  const router = useRouter();
  
  if (isLoading) {
    return null; // Don't show while loading
  }
  
  if (!profileData) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Profile Required</AlertTitle>
        <AlertDescription>
          Please complete your profile to apply for jobs.
          <Button 
            variant="destructive" 
            size="sm" 
            className="ml-2"
            onClick={() => router.push('/jobseeker/dashboard')}
          >
            Complete Profile
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Calculate profile completion percentage
  const requiredFields = [
    !!profileData.firstName,
    !!profileData.lastName, 
    !!profileData.email,
    !!profileData.phone,
    !!profileData.resume,
    !!(profileData.skills && profileData.skills.length > 0),
    !!(profileData.education && profileData.education.length > 0),
    !!(profileData.experience && profileData.experience.length > 0)
  ];
  
  const completedFields = requiredFields.filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
  const isComplete = completionPercentage === 100;
  
  // Create a list of incomplete items
  const incompleteItems = [];
  if (!profileData.phone) incompleteItems.push('Phone number');
  if (!profileData.resume) incompleteItems.push('Resume');
  if (!profileData.skills || profileData.skills.length === 0) incompleteItems.push('Skills');
  if (!profileData.education || profileData.education.length === 0) incompleteItems.push('Education');
  if (!profileData.experience || profileData.experience.length === 0) incompleteItems.push('Experience');
  
  if (isComplete) {
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Profile Complete</AlertTitle>
        <AlertDescription className="text-green-700">
          Your profile is complete. You can now apply for jobs.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Complete Your Profile</AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="mt-2 mb-3">
          <div className="flex justify-between mb-1 text-sm">
            <span>Profile completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        {incompleteItems.length > 0 && (
          <div className="mt-1 text-sm">
            Please complete the following: {incompleteItems.join(', ')}
          </div>
        )}
        
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
            onClick={() => router.push('/jobseeker/dashboard')}
          >
            Update Profile
          </Button>
          {profileData.resume ? null : (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
              onClick={() => router.push('/jobseeker/dashboard/resume')}
            >
              Upload Resume
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileCompletionAlert; 