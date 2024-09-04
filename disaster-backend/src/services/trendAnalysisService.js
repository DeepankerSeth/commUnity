console.log('Loading trendAnalysisService.js');
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { Calculator } from "@langchain/community/tools/calculator";

export async function analyzeTrends() {
  const model = new ChatOpenAI({ temperature: 0 });
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY),
    new Calculator()
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const incidents = await IncidentReport.find({
    createdAt: { $gte: lastMonth }
  }).lean();

  const result = await executor.call({
    input: `Analyze the following incident data from the last month and provide insights:
    ${JSON.stringify(incidents)}
    
    Provide insights on:
    1. Trends in incident types and severities
    2. Geographical patterns
    3. Potential correlations with external factors (e.g., weather, events)
    4. Predictions for the next month
    5. Recommended preventive measures

    Format your response as a JSON object with the following structure:
    {
      "trends": [{ "description": "string", "significance": number 1-10}],
      "geographicalPatterns": [{ "location": "string", "pattern": "string" }],
      "correlations": [{ "factor": "string", "impact": "string" }],
      "predictions": [{ "prediction": "string", "confidence": number 1-10}],
      "preventiveMeasures": [{ "measure": "string", "expectedImpact": "string" }]
    }`
  });

  return JSON.parse(result.output);
}

export async function getPredictiveModel() {
  const model = new ChatOpenAI({ temperature: 0 });
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY),
    new Calculator()
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const incidents = await IncidentReport.find({
    createdAt: { $gte: lastYear }
  }).lean();

  const result = await executor.call({
    input: `Based on the following historical incident data, create a predictive model for the next month:
    ${JSON.stringify(incidents)}
    
    Provide your response as a JSON object with the following structure:
    {
      "model": [
        {
          "incidentType": "string",
          "location": "string",
          "likelihood": number,
          "potentialSeverity": number,
          "factors": ["string"]
        }
      ]
    }`
  });

  return JSON.parse(result.output);
}
