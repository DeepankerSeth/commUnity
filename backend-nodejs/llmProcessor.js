mongodb+srv://iamdseth:<password>@community-test.aty6ni6.mongodb.net/?retryWrites=true&w=majority&appName=commUnity-test

const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

/**
 * Processes an incident report using the LLM (e.g., GPT-4)
 * @param {Object} incident - The incident report to process
 * @returns {Promise<string>} - The analysis provided by the LLM
 */
async function processIncident(incident) {
  const { description, photo, video, file } = incident;

  // Construct prompt for LLM
  const prompt = `
Incident Description: ${description}
${photo ? `Photo: [attached]` : ''}
${video ? `Video: [attached]` : ''}
${file ? `File: [attached]` : ''}
Analyze this incident report and provide a detailed picture of the incident including any connections or relevant context.
  `;

  // Get analysis from OpenAI
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 500,
  });

  return response.data.choices[0].text;
}

/**
 * Updates an incident report with new information
 * @param {string} incidentId - The ID of the incident to update
 * @param {Object} newReport - The new report containing additional information
 * @returns {Promise<Object>} - The updated incident
 */
async function updateIncident(incidentId, newReport) {
  // Fetch existing incident
  const { data: existingIncident, error: fetchError } = await supabase
    .from('incidents')
    .select()
    .eq('id', incidentId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Combine existing description with new report
  const combinedDescription = `${existingIncident.description}\n\n${newReport.description}`;
  const prompt = `
Incident Description: ${combinedDescription}
Analyze the combined reports and provide a comprehensive update on the incident.
  `;

  // Get updated analysis from OpenAI
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 500,
  });

  const updatedAnalysis = response.data.choices[0].text;

  // Update incident in Supabase
  const { data, error } = await supabase
    .from('incidents')
    .update({ description: combinedDescription, analysis: updatedAnalysis })
    .eq('id', incidentId);

  if (error) {
    throw error;
  }
  return data;
}

module.exports = { processIncident, updateIncident };
