import React from 'react';
import { useIncidentData } from '@/hooks/useIncidentData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DisasterIcon from '@/components/ui/icons';

interface IncidentDetailsProps {
  incidentId: string;
}

interface TimelineEntry {
  update: string;
  severity: number;
  impactRadius: number;
  timestamp: string;
}

interface RelatedIncident {
  id: string;
  type: string;
  description: string;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incidentId }) => {
  const { incident, relatedIncidents, loading, error, handleUserFeedback } = useIncidentData(incidentId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!incident) return <div>No incident found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              <DisasterIcon type={incident.type} className="inline-block mr-2 w-6 h-6" />
              {incident.type} Incident
            </CardTitle>
            <Badge variant={incident.status === 'active' ? 'solid' : 'outline'}>
              {incident.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p>{incident.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <ul className="list-disc list-inside">
                <li>Severity: {incident.severity}/10</li>
                <li>Impact Radius: {incident.impactRadius} miles</li>
                <li>Verification Status: {incident.verificationStatus}</li>
                <li>Verification Score: {incident.verificationScore.toFixed(2)}</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Timeline</h3>
            {incident.timeline.map((entry: TimelineEntry, index: number) => (
              <Card key={index} className="mb-2">
                <CardContent className="py-2">
                  <p>{entry.update}</p>
                  <p className="text-sm text-gray-500">
                    Severity: {entry.severity} | Impact Radius: {entry.impactRadius} miles | 
                    Time: {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Related Incidents</h3>
            {relatedIncidents.map((relatedIncident: RelatedIncident) => (
              <Card key={relatedIncident.id} className="mb-2">
                <CardContent className="py-2">
                  <p>{relatedIncident.type}: {relatedIncident.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Provide Feedback</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const accuracy = parseInt((e.target as HTMLFormElement).accuracy.value);
              const usefulness = parseInt((e.target as HTMLFormElement).usefulness.value);
              handleUserFeedback(accuracy, usefulness);
            }}>
              <div className="flex flex-col space-y-2">
                <label>
                  Accuracy (1-5):
                  <input type="number" name="accuracy" min="1" max="5" required className="ml-2 p-1 border rounded" />
                </label>
                <label>
                  Usefulness (1-5):
                  <input type="number" name="usefulness" min="1" max="5" required className="ml-2 p-1 border rounded" />
                </label>
              </div>
              <Button type="submit" className="mt-2">Submit Feedback</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentDetails;