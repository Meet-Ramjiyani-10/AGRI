// INTEGRATION ADDITION
// Synthetic mock integrations for hackathon demo.
// Replace these with real fetch calls in production.

const withDelay = (payload) =>
  new Promise((resolve) => setTimeout(() => resolve(payload), 300));

export const mockMahaDBT = {
  // Get all active schemes
  getSchemes: () =>
    withDelay([
      { id: 'pmkisan', name: 'PM-KISAN', benefit: '₹6000/year', eligibility: { maxLand: 5 } },
      { id: 'pmfby', name: 'PMFBY', benefit: 'Crop insurance', eligibility: { cropTypes: ['wheat', 'rice', 'sugarcane'] } },
      { id: 'kcc', name: 'KCC', benefit: 'Loan at 4%', eligibility: { landOwnership: true } },
      { id: 'solar', name: 'सोलर पंप', benefit: '₹90,000 subsidy', eligibility: { land: 2 } },
    ]),

  // Submit approved application for disbursement
  submitApplication: (appData) =>
    withDelay({
      status: 'success',
      applicationId: appData?.applicationId || `APP-${Date.now()}`,
      message: 'Application submitted to MahaDBT for disbursement',
    }),
};

export const mockMahabhulekh = {
  // Verify land record by survey number / farmer name
  verifyLand: (landId, farmerName) => {
    if (landId === 'MH12/456') {
      return withDelay({ isValid: false, reason: 'Land record not found', confidence: 0 });
    }
    return withDelay({
      isValid: true,
      ownerName: farmerName || 'Vishal Pawar',
      landArea: 3.5,
      cropType: 'Sugarcane',
      confidence: 0.96,
      discrepancies: [],
    });
  },
};

export const mockAapleSarkar = {
  // Submit grievance to official portal
  submitGrievance: (complaintText, farmerId) =>
    withDelay({
      status: 'submitted',
      trackingId: `GRV-${Date.now()}`,
      message: 'Grievance lodged. Resolution expected in 48 hours.',
      farmerId,
      complaintText,
    }),

  // Get grievance status
  getStatus: (trackingId) =>
    withDelay({
      status: 'in-progress',
      assignedTo: 'Insurance Cell',
      lastUpdated: new Date().toISOString(),
      trackingId,
    }),
};
