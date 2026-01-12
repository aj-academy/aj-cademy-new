import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { toast } from '../ui/use-toast';
import axios from 'axios';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type CourseFormData = {
  title: string;
  description: string;
  instructorName: string;
  thumbnailUrl: string;
  status: 'draft' | 'published';
  category: string;
  regularPrice: number;
  salePrice?: number;
  saleEndDate?: Date;
  slug?: string;
};

interface CourseFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    instructorName?: string;
    thumbnailUrl?: string;
    status?: 'draft' | 'published';
    category?: string;
    regularPrice?: number;
    salePrice?: number;
    saleEndDate?: string;
    slug?: string;
  };
  onSuccess?: (courseId: string) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cyber Security',
  'Business',
  'Design',
  'Marketing',
  'Other'
];

const CourseForm: React.FC<CourseFormProps> = ({ 
  initialData, 
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CourseFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      instructorName: initialData?.instructorName || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      status: initialData?.status || 'draft',
      category: initialData?.category || 'Other',
      regularPrice: initialData?.regularPrice || 0,
      salePrice: initialData?.salePrice,
      saleEndDate: initialData?.saleEndDate ? new Date(initialData.saleEndDate) : undefined,
      slug: initialData?.slug || '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchSalePrice = watch('salePrice');
  
  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsSubmitting(true);
      
      // Format data for API
      const courseData = {
        ...data,
        regularPrice: Number(data.regularPrice),
        salePrice: data.salePrice ? Number(data.salePrice) : undefined
      };
      // If slug is empty string, delete it so backend can auto-generate
      if (!courseData.slug) delete courseData.slug;
      
      let response;
      
      // Include admin auth token if present
      let headers: Record<string, string> | undefined = undefined;
      if (typeof window !== 'undefined') {
        try {
          const adminAuthStr = localStorage.getItem('adminAuth');
          if (adminAuthStr) {
            const adminAuth = JSON.parse(adminAuthStr);
            if (adminAuth?.token) {
              headers = { Authorization: `Bearer ${adminAuth.token}` };
            }
          }
        } catch {}
      }

      if (initialData?._id) {
        // Update existing course
        response = await axios.put(`/api/courses/${initialData._id}`, courseData, { headers });
        toast({
          title: 'Course updated',
          description: 'The course has been updated successfully.',
        });
      } else {
        // Create new course
        response = await axios.post('/api/courses', courseData, { headers });
        toast({
          title: 'Course created',
          description: 'The course has been created successfully.',
        });
      }
      
      // Support both wrapped and direct data shapes
      const createdId = response?.data?._id || response?.data?.data?._id;
      if (onSuccess && createdId) {
        onSuccess(createdId);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData?._id ? 'Edit Course' : 'Create Course'}</CardTitle>
        <CardDescription>
          {initialData?._id 
            ? 'Update your course information'
            : 'Add a new course to your platform'
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input 
                  id="title"
                  placeholder="Enter course title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Custom Slug (optional)</Label>
                <Input
                  id="slug"
                  placeholder="e.g. mern-stack"
                  {...register('slug')}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, the slug will be auto-generated from the title.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe your course"
                  rows={5}
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="instructorName">Instructor Name</Label>
                <Input 
                  id="instructorName"
                  placeholder="Enter instructor name"
                  {...register('instructorName', { required: 'Instructor name is required' })}
                />
                {errors.instructorName && (
                  <p className="text-sm text-red-500">{errors.instructorName.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="thumbnailUrl">Thumbnail Image URL</Label>
                <Input 
                  id="thumbnailUrl"
                  placeholder="https://example.com/image.jpg"
                  {...register('thumbnailUrl', { required: 'Thumbnail URL is required' })}
                />
                {errors.thumbnailUrl && (
                  <p className="text-sm text-red-500">{errors.thumbnailUrl.message}</p>
                )}
                {watch('thumbnailUrl') && (
                  <div className="mt-2">
                    <img 
                      src={watch('thumbnailUrl')} 
                      alt="Thumbnail preview" 
                      className="h-40 object-cover rounded-md"
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status and Category */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Status & Category</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  defaultValue={watch('status')}
                  onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  defaultValue={watch('category')}
                  onValueChange={(value) => setValue('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Pricing */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Pricing</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="regularPrice">Regular Price (₹)</Label>
                <Input 
                  id="regularPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register('regularPrice', { 
                    required: 'Regular price is required',
                    min: {
                      value: 0,
                      message: 'Price cannot be negative'
                    }
                  })}
                />
                {errors.regularPrice && (
                  <p className="text-sm text-red-500">{errors.regularPrice.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="salePrice">Sale Price (₹) (Optional)</Label>
                <Input 
                  id="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register('salePrice')}
                />
              </div>
            </div>
            
            {/* Sale End Date - Only show if sale price is set */}
            {watchSalePrice && Number(watchSalePrice) > 0 && (
              <div className="grid gap-2 mt-4">
                <Label htmlFor="saleEndDate">Sale End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('saleEndDate') ? (
                        format(watch('saleEndDate') as Date, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('saleEndDate') as Date}
                      onSelect={(date) => setValue('saleEndDate', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData?._id ? 'Update Course' : 'Create Course'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CourseForm; 