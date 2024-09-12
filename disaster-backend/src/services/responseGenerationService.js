import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export async function generateAutomatedResponse(incidentType) {
  const model = new ChatOpenAI();
  const template = `
  Given a {incidentType} incident, provide a detailed response plan for emergency services.
  Include the following sections:
  1. Immediate Actions
  2. Resource Allocation
  3. Communication Strategy
  4. Evacuation Procedures (if necessary)
  5. Long-term Recovery Plans

  Format your response as a JSON object with these sections as keys.
  `;
  const prompt = new PromptTemplate({ template, inputVariables: ["incidentType"] });

  const chain = new LLMChain({ llm: model, prompt });
  const response = await chain.call({ incidentType });

  return JSON.parse(response.text);
}
