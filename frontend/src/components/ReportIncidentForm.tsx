import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import useErrorHandler from '@/hooks/useErrorHandler';
import { reportIncident } from '@/lib/api';

export default function ReportIncidentForm() {
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { handleError } = useErrorHandler();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    if (media) formData.append('media', media);
    if (file) formData.append('file', file);

    try {
      const res = await reportIncident(formData);
      alert('Incident reported successfully!');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <h2 className="text-2xl font-bold mb-4">Report an Incident</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident"
              className="w-full border rounded-lg p-2"
              required
            />
            <Button variant="secondary" size="icon" className="ml-4">
              <MicIcon className="w-6 h-6" />
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Photos, Videos</label>
            <input
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Any other files</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}

function MicIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
