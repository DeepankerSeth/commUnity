import IncidentReport from '../models/incidentReport.js';

export async function getHeatmapData() {
  const incidents = await IncidentReport.find({}, 'location severity');
  return incidents.map(incident => ({
    lat: incident.location.coordinates[1],
    lng: incident.location.coordinates[0],
    weight: incident.severity
  }));
}

export async function getTimeSeriesData() {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const incidents = await IncidentReport.find({
    createdAt: { $gte: lastMonth }
  }, 'type severity createdAt');

  const timeSeriesData = {};
  incidents.forEach(incident => {
    const date = incident.createdAt.toISOString().split('T')[0];
    if (!timeSeriesData[date]) {
      timeSeriesData[date] = { total: 0 };
    }
    if (!timeSeriesData[date][incident.type]) {
      timeSeriesData[date][incident.type] = 0;
    }
    timeSeriesData[date][incident.type] += 1;
    timeSeriesData[date].total += 1;
  });

  return Object.entries(timeSeriesData).map(([date, data]) => ({
    date,
    ...data
  }));
}
