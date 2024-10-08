console.log('Loading feedbackService.js');
import Feedback from '../models/Feedback.js';
import { updateRiskScoring } from './riskScoringService.js';
import { updateIncidentBasedOnFeedback } from './incidentService.js';
// import { getUserFromAuth0, updateUserInAuth0 } from './auth0Service.js';

export async function processFeedback(feedbackData) {
  const feedback = new Feedback(feedbackData);
  await feedback.save();

  // Update user reputation
  await updateUserReputation(feedbackData.auth0Id, feedbackData.accuracy, feedbackData.usefulness);

  // Update risk scoring
  await updateRiskScoring(feedbackData.incidentId, feedbackData.accuracy);

  // Update incident based on feedback
  await updateIncidentBasedOnFeedback(feedbackData.incidentId, feedbackData.accuracy, feedbackData.usefulness);

  return feedback;
}

async function updateUserReputation(auth0Id, accuracy, usefulness) {
  const user = await getUserFromAuth0(auth0Id);
  if (!user) throw new Error('User not found');

  const reputationChange = calculateReputationChange(accuracy, usefulness);
  user.reputation = (user.reputation || 0) + reputationChange;
  user.reputation = Math.max(0, Math.min(100, user.reputation)); // Keep reputation between 0 and 100

  await updateUserInAuth0(auth0Id, { reputation: user.reputation });
}

function calculateReputationChange(accuracy, usefulness) {
  // Implement logic to calculate reputation change based on accuracy and usefulness
  // For now, we'll return a fixed value
  const averageRating = (accuracy + usefulness) / 2;
  return (averageRating - 3) * 2; // Range: -4 to +4
}

export async function getFeedbackStats(incidentId) {
  const feedbacks = await Feedback.find({ incidentId });
  const accuracySum = feedbacks.reduce((sum, feedback) => sum + feedback.accuracy, 0);
  const usefulnessSum = feedbacks.reduce((sum, feedback) => sum + feedback.usefulness, 0);

  return {
    averageAccuracy: accuracySum / feedbacks.length,
    averageUsefulness: usefulnessSum / feedbacks.length,
    totalFeedbacks: feedbacks.length
  };
}