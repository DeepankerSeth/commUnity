'use client';

import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reportIncident } from '@/lib/disasterAPI';
import { useToast } from "@/components/ui/use-toast";
import { useGeolocation } from '../hooks/useGeoLocation';
export default function ReportIncidentForm() {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  const incidentTypes = [
    "Fire", "Flood", "Earthquake", "Hurricane", "Tornado", "Landslide", "Tsunami",
    "Volcanic Eruption", "Wildfire", "Blizzard", "Drought", "Heatwave", "Shooting", "Chemical Spill",
    "Nuclear Incident", "Terrorist Attack", "Civil Unrest", "Pandemic", "Infrastructure Failure",
    "Transportation Accident", "Other"
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (latitude === null || longitude === null) {
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please enable location services and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!incidentType) {
      toast({
        title: "Form Error",
        description: "Please select an incident type.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('type', incidentType);
    formData.append('description', description);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('mediaFiles', files[i]);
      }
    }

    try {
      await reportIncident(formData);
      toast({
        title: "Success",
        description: "Incident reported successfully!",
      });
      setDescription('');
      setIncidentType('');
      setFiles(null);
    } catch (error) {
      console.error('Error reporting incident:', error);
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
        {locationLoading && <p>Getting your location...</p>}
        {locationError && <p className="text-red-500">Error: {locationError}</p>}
        {(latitude === null || longitude === null) && !locationLoading && !locationError && (
          <div className="text-sm text-yellow-600">
            Location data is not available. Your report will be submitted without location information.
          </div>
        )}
        <Button type="submit" disabled={isSubmitting || (latitude === null && longitude === null) || locationLoading}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
}