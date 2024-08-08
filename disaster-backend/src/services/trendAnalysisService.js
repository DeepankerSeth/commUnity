import IncidentReport from '../models/incidentReport.js';
import { OpenAI } from '@langchain/openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeTrends() {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const incidents = await IncidentReport.find({
    createdAt: { $gte: lastMonth }
  }).sort({ createdAt: 1 });

  const incidentSummary = incidents.map(incident => ({
    type: incident.type,
    severity: incident.severity,
    date: incident.createdAt.toISOString().split('T')[0],
    location: incident.metadata.placeOfImpact
  }));

  const prompt = `
    Analyze the following incident data from the last month:
    ${JSON.stringify(incidentSummary)}

    Provide insights on:
    1. Trends in incident types and severities
    2. Geographical patterns
    3. Potential correlations with external factors (e.g., weather, events)
    4. Predictions for the next month
    5. Recommended preventive measures

    Format your response as JSON with the following structure:
    {
      "trends": [
        { "description": "string", "significance": "number 1-10" }
      ],
      "geographicalPatterns": [
        { "location": "string", "pattern": "string" }
      ],
      "correlations": [
        { "factor": "string", "impact": "string" }
      ],
      "predictions": [
        { "prediction": "string", "confidence": "number 0-1" }
      ],
      "preventiveMeasures": [
        { "measure": "string", "expectedImpact": "string" }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a disaster analysis AI assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function getPredictiveModel() {
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const incidents = await IncidentReport.find({
    createdAt: { $gte: lastYear }
  }).sort({ createdAt: 1 });

  const incidentData = incidents.map(incident => ({
    type: incident.type,
    severity: incident.severity,
    date: incident.createdAt.toISOString().split('T')[0],
    location: incident.metadata.placeOfImpact,
    impactRadius: incident.impactRadius
  }));

  const prompt = `
    Based on the following historical incident data:
    ${JSON.stringify(incidentData)}

    Create a predictive model that estimates the likelihood and potential severity of incidents for the next month.
    Provide your response as a JSON object with the following structure:
    {
      "model": [
        {
          "incidentType": "string",
          "location": "string",
          "likelihood": "number 0-1",
          "potentialSeverity": "number 1-10",
          "factors": ["string"]
        }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a disaster prediction AI assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0].message.content);
}
