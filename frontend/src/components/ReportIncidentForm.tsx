'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reportIncident } from '@/lib/disasterAPI';
import useErrorHandler from '@/hooks/useErrorHandler';

export default function ReportIncidentForm() {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }

    try {
      await reportIncident(formData);
      alert('Incident reported successfully!');
      setDescription('');
      setFiles(null);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Report an Incident</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
          Submit Report
        </Button>
      </form>
    </div>
  );
}