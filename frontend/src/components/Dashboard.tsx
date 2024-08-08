import React, { useState, useEffect } from 'react';
import { getTrendAnalysis, getPredictions, getVisualizationData } from '@/lib/disasterAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heatmap } from '@/components/Heatmap';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';

// Add this type definition at the top of the file
type TrendAnalysis = {
  trends: Array<{ description: string; significance: string }>;
  geographicalPatterns: Array<{ location: string; pattern: string }>;
  correlations: Array<{ factor: string; impact: string }>;
  preventiveMeasures: Array<{ measure: string; expectedImpact: string }>;
};

type VisualizationData = {
  heatmapData: any; // Replace 'any' with the actual type of heatmapData
  timeSeriesData: any; // Replace 'any' with the actual type of timeSeriesData
};

// Add this type definition near the top of the file
type Prediction = {
  incidentType: string;
  location: string;
  likelihood: number;
  potentialSeverity: string;
};

type Predictions = {
  model: Prediction[];
};

export function Dashboard() {
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [analysisData, predictionsData, visData] = await Promise.all([
        getTrendAnalysis(),
        getPredictions(),
        getVisualizationData()
      ]);
      setTrendAnalysis(analysisData);
      setPredictions(predictionsData);
      setVisualizationData(visData);
    };
    fetchData();
  }, []);

  if (!trendAnalysis || !predictions || !visualizationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Incident Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <Heatmap data={visualizationData.heatmapData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incident Time Series</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart data={visualizationData.timeSeriesData} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Trends</h3>
          <ul className="list-disc pl-5 mb-4">
            {trendAnalysis.trends.map((trend, index) => (
              <li key={index}>{trend.description} (Significance: {trend.significance})</li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">Geographical Patterns</h3>
          <ul className="list-disc pl-5 mb-4">
            {trendAnalysis.geographicalPatterns.map((pattern, index) => (
              <li key={index}>{pattern.location}: {pattern.pattern}</li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">Correlations</h3>
          <ul className="list-disc pl-5 mb-4">
            {trendAnalysis.correlations.map((correlation, index) => (
              <li key={index}>{correlation.factor}: {correlation.impact}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Predictions and Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Predictions</h3>
          <ul className="list-disc pl-5 mb-4">
            {predictions.model.map((prediction, index) => (
              <li key={index}>
                {prediction.incidentType} in {prediction.location}: 
                Likelihood {(prediction.likelihood * 100).toFixed(2)}%, 
                Potential Severity {prediction.potentialSeverity}
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">Preventive Measures</h3>
          <ul className="list-disc pl-5">
            {trendAnalysis.preventiveMeasures.map((measure, index) => (
              <li key={index}>{measure.measure} (Expected Impact: {measure.expectedImpact})</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}