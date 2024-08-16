'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reportIncident } from '@/lib/disasterAPI';
import useErrorHandler from '@/hooks/useErrorHandler';
import { useToast } from "@/components/ui/use-toast";
import { getSession } from '@auth0/nextjs-auth0';

export default function ReportIncidentForm() {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  const incidentTypes = [
    "Fire", "Flood", "Earthquake", "Hurricane", "Tornado", "Landslide", "Tsunami",
    "Volcanic Eruption", "Wildfire", "Blizzard", "Drought", "Heatwave", "Shooting", "Chemical Spill",
    "Nuclear Incident", "Terrorist Attack", "Civil Unrest", "Pandemic", "Infrastructure Failure",
    "Transportation Accident", "Other"
  ];

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }, (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please try again.",
          variant: "destructive",
        });
      });
    }
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('description', description);
    formData.append('incidentType', incidentType);
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('mediaFiles', files[i]);
      }
    }

    try {
      const session = await getSession();
      if (session?.user?.sub) {
        formData.append('userId', session.user.sub);
      }
      const response = await reportIncident(formData);
      toast({
        title: "Success",
        description: "Incident reported successfully!",
      });
      setDescription('');
      setIncidentType('');
      setFiles(null);
    } catch (error) {
      handleError(error);
      toast({
        title: "Error",
        description: "Failed to report incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Report an Incident</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Incident Type
          </label>
          <select
            id="type"
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select an incident type</option>
            {incidentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Describe the incident
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Please provide details about the incident..."
            required
          />
        </div>
        <div>
          <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
            Upload files (photos, videos, or other evidence)
          </label>
          <Input
            type="file"
            id="files"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
}