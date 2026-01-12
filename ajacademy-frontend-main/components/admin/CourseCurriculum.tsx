import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { PlusCircle, Trash2, Edit, GripVertical, Video, Clock } from 'lucide-react';
import { toast } from '../ui/use-toast';
import axios from 'axios';
import { extractGoogleDriveFileId, formatDuration } from '@/lib/googleDriveUtils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Section {
  _id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

interface Video {
  _id: string;
  title: string;
  description: string;
  googleDriveId: string;
  duration: number;
  order: number;
}

interface CourseCurriculumProps {
  courseId: string;
  initialSections?: Section[];
}

interface SectionFormData {
  title: string;
  description: string;
}

interface VideoFormData {
  title: string;
  description: string;
  googleDriveId: string;
  duration: number;
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ 
  courseId, 
  initialSections = [] 
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [loading, setLoading] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  
  const sectionForm = useForm<SectionFormData>();
  const videoForm = useForm<VideoFormData>();
  
  // Load sections if not provided
  useEffect(() => {
    if (initialSections.length === 0) {
      fetchSections();
    }
  }, [courseId, initialSections]);
  
  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      setSections(response.data.sections || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load course sections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle section form submission
  const handleSectionSubmit = async (data: SectionFormData) => {
    try {
      setLoading(true);
      
      if (editingSectionId) {
        // Update existing section
        await axios.put(`/api/courses/${courseId}/sections/${editingSectionId}`, data);
        toast({ title: 'Section updated' });
      } else {
        // Create new section
        await axios.post(`/api/courses/${courseId}/sections`, data);
        toast({ title: 'Section added' });
      }
      
      // Reset form and refresh sections
      sectionForm.reset();
      setShowSectionForm(false);
      setEditingSectionId(null);
      await fetchSections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle video form submission
  const handleVideoSubmit = async (data: VideoFormData) => {
    try {
      setLoading(true);
      
      // Extract Google Drive ID if full URL was pasted
      const cleanedDriveId = extractGoogleDriveFileId(data.googleDriveId);
      const videoData = {
        ...data,
        googleDriveId: cleanedDriveId,
        duration: Number(data.duration) || 0
      };
      
      if (editingVideoId) {
        // Update existing video
        await axios.put(
          `/api/courses/${courseId}/sections/${currentSectionId}/videos/${editingVideoId}`,
          videoData
        );
        toast({ title: 'Video updated' });
      } else {
        // Create new video
        await axios.post(
          `/api/courses/${courseId}/sections/${currentSectionId}/videos`,
          videoData
        );
        toast({ title: 'Video added' });
      }
      
      // Reset form and refresh sections
      videoForm.reset();
      setShowVideoForm(false);
      setEditingVideoId(null);
      setCurrentSectionId(null);
      await fetchSections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Open the section form for editing
  const handleEditSection = (section: Section) => {
    sectionForm.setValue('title', section.title);
    sectionForm.setValue('description', section.description);
    setEditingSectionId(section._id);
    setShowSectionForm(true);
  };
  
  // Open the video form for editing
  const handleEditVideo = (sectionId: string, video: Video) => {
    videoForm.setValue('title', video.title);
    videoForm.setValue('description', video.description);
    videoForm.setValue('googleDriveId', video.googleDriveId);
    videoForm.setValue('duration', video.duration);
    setCurrentSectionId(sectionId);
    setEditingVideoId(video._id);
    setShowVideoForm(true);
  };
  
  // Open the video form for adding a new video
  const handleAddVideo = (sectionId: string) => {
    videoForm.reset();
    setCurrentSectionId(sectionId);
    setEditingVideoId(null);
    setShowVideoForm(true);
  };
  
  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section and all its videos?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/api/courses/${courseId}/sections/${sectionId}`);
      toast({ title: 'Section deleted' });
      await fetchSections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete section',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete video
  const handleDeleteVideo = async (sectionId: string, videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/api/courses/${courseId}/sections/${sectionId}/videos/${videoId}`);
      toast({ title: 'Video deleted' });
      await fetchSections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete video',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reordering of sections and videos via drag and drop
  const handleDragEnd = async (result: any) => {
    const { source, destination, type } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // No change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Handle section reorder
    if (type === 'section') {
      const reorderedSections = [...sections];
      const [removed] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, removed);
      
      // Update order property for each section
      const updatedSections = reorderedSections.map((section, index) => ({
        ...section,
        order: index + 1
      }));
      
      setSections(updatedSections);
      
      // Update in the database
      try {
        const movedSection = updatedSections[destination.index];
        await axios.put(`/api/courses/${courseId}/sections/${movedSection._id}`, {
          order: movedSection.order
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to update section order',
          variant: 'destructive',
        });
        fetchSections(); // Revert to original order on failure
      }
    }
    
    // Handle video reorder
    if (type === 'video') {
      const sectionId = source.droppableId;
      const sectionIndex = sections.findIndex(s => s._id === sectionId);
      
      if (sectionIndex === -1) return;
      
      // Clone sections
      const updatedSections = [...sections];
      
      // If moving within same section
      if (source.droppableId === destination.droppableId) {
        const videos = [...updatedSections[sectionIndex].videos];
        const [removed] = videos.splice(source.index, 1);
        videos.splice(destination.index, 0, removed);
        
        // Update order property
        const updatedVideos = videos.map((video, index) => ({
          ...video,
          order: index + 1
        }));
        
        updatedSections[sectionIndex].videos = updatedVideos;
        setSections(updatedSections);
        
        // Update in the database
        try {
          const movedVideo = updatedVideos[destination.index];
          await axios.put(
            `/api/courses/${courseId}/sections/${sectionId}/videos/${movedVideo._id}`,
            {
              order: movedVideo.order
            }
          );
        } catch (error: any) {
          toast({
            title: 'Error',
            description: 'Failed to update video order',
            variant: 'destructive',
          });
          fetchSections(); // Revert to original order on failure
        }
      } 
      // Moving between sections is not supported in this implementation
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Curriculum</h2>
        <Button 
          onClick={() => {
            sectionForm.reset();
            setEditingSectionId(null);
            setShowSectionForm(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>
      
      {/* Section Form Dialog */}
      <Dialog open={showSectionForm} onOpenChange={setShowSectionForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSectionId ? 'Edit Section' : 'Add Section'}</DialogTitle>
            <DialogDescription>
              {editingSectionId 
                ? 'Update the details of this section' 
                : 'Create a new section to organize your course content'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={sectionForm.handleSubmit(handleSectionSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input 
                  id="title"
                  placeholder="Enter section title"
                  className="col-span-3"
                  {...sectionForm.register('title', { required: true })}
                />
                {sectionForm.formState.errors.title && (
                  <p className="text-sm text-red-500 col-start-2 col-span-3">
                    Title is required
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea 
                  id="description"
                  placeholder="Enter section description"
                  className="col-span-3"
                  rows={3}
                  {...sectionForm.register('description')}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingSectionId ? 'Save Changes' : 'Add Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Video Form Dialog */}
      <Dialog open={showVideoForm} onOpenChange={setShowVideoForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVideoId ? 'Edit Video' : 'Add Video'}</DialogTitle>
            <DialogDescription>
              {editingVideoId 
                ? 'Update the details of this video'
                : 'Add a new video to this section'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={videoForm.handleSubmit(handleVideoSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  placeholder="Enter video title"
                  {...videoForm.register('title', { required: true })}
                />
                {videoForm.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    Title is required
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Enter video description"
                  rows={2}
                  {...videoForm.register('description')}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="googleDriveId">
                  Google Drive ID or URL
                </Label>
                <Input 
                  id="googleDriveId"
                  placeholder="Paste Google Drive URL or ID"
                  {...videoForm.register('googleDriveId', { required: true })}
                />
                {videoForm.formState.errors.googleDriveId && (
                  <p className="text-sm text-red-500">
                    Google Drive ID is required
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Paste the full URL (https://drive.google.com/file/d/XXXXX/view) or just the ID
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (in seconds)</Label>
                <Input 
                  id="duration"
                  type="number"
                  min="0"
                  placeholder="Enter video duration in seconds"
                  {...videoForm.register('duration', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Enter the duration to track progress accurately
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingVideoId ? 'Save Changes' : 'Add Video'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Sections and Videos List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div
              className="space-y-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {loading && sections.length === 0 && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Loading curriculum...
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {!loading && sections.length === 0 && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      No sections yet. Add a section to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {sections.sort((a, b) => a.order - b.order).map((section, index) => (
                <Draggable key={section._id} draggableId={section._id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border-2"
                    >
                      <CardHeader className="pb-2 flex flex-row justify-between items-center">
                        <div {...provided.dragHandleProps} className="flex items-center">
                          <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleAddVideo(section._id)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Video
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditSection(section)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteSection(section._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {section.description && (
                        <CardContent className="pt-0 pb-2 px-6">
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </CardContent>
                      )}
                      
                      <Droppable droppableId={section._id} type="video">
                        {(provided) => (
                          <CardContent 
                            className="pt-2 pb-3"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {section.videos.length === 0 && (
                              <p className="text-sm text-muted-foreground py-2">
                                No videos in this section yet.
                              </p>
                            )}
                            
                            {section.videos
                              .sort((a, b) => a.order - b.order)
                              .map((video, videoIndex) => (
                                <Draggable 
                                  key={video._id} 
                                  draggableId={video._id} 
                                  index={videoIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex justify-between items-center p-2 mb-2 bg-background rounded-md border"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-muted-foreground" />
                                        <span>{video.title}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        {video.duration > 0 && (
                                          <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{formatDuration(video.duration)}</span>
                                          </div>
                                        )}
                                        
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleEditVideo(section._id, video)}
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                        
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleDeleteVideo(section._id, video._id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                          <span className="sr-only">Delete</span>
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </CardContent>
                        )}
                      </Droppable>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CourseCurriculum; 