import { schemes, proactiveEntitlements, grievances, applications } from '../data/mockData';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => 300 + Math.floor(Math.random() * 200);
const randomId = (prefix) => `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

export const getGatewayConfig = (apiMode) => {
  const mockBaseUrl = import.meta.env.VITE_MOCK_API_BASE_URL || 'http://localhost:5000';
  const prodBaseUrl = import.meta.env.VITE_PROD_API_BASE_URL || 'https://api.mahadbt.gov.in';
  const useMock = apiMode === 'mock';
  return {
    useMock,
    baseUrl: useMock ? mockBaseUrl : prodBaseUrl,
    statusLabel: useMock ? '✅ Connected to Mock MahaDBT API' : '✅ Ready for Production APIs',
  };
};

export const mockApi = {
  async getMahaDbtSchemes() {
    await wait(randomDelay());
    return {
      schemes: schemes.map((s) => ({
        id: s.id,
        name: s.name,
        eligibility: {
          maxLand: s.maxLand ?? null,
          farmerType: s.id === 'pmkisan' ? 'marginal/small' : 'all',
        },
        benefit: s.id === 'pmkisan' ? '₹6000/year' : s.id === 'pmfby' ? 'Insurance cover' : 'Subsidy/credit support',
      })),
    };
  },

  async submitMahaDbtApplication(payload = {}) {
    await wait(randomDelay());
    return {
      status: 'success',
      applicationId: payload.applicationId || randomId('APP'),
      message: 'Application submitted for disbursement.',
    };
  },

  async getLandRecord(farmerId = 'FARMER-001') {
    await wait(randomDelay());
    const app = applications.find((a) => a.id === farmerId || a.aadhaar === farmerId) || applications[0];
    return {
      farmerName: app.farmerNameEn || app.farmerName,
      landParcelId: 'MH12/123/456',
      areaAcres: app.landArea || 3.5,
      cropType: app.cropType || 'Sugarcane',
      ownershipVerified: true,
    };
  },

  async verifyLandRecord() {
    await wait(randomDelay());
    return { isValid: true, matchConfidence: 0.96, discrepancies: [] };
  },

  async submitGrievance(payload = {}) {
    await wait(randomDelay());
    return {
      status: 'submitted',
      trackingId: payload.trackingId || randomId('GRV'),
      message: 'Grievance lodged. Resolution expected in 48 hours.',
    };
  },

  async getGrievanceStatus(trackingId = 'GRV-2026-1001') {
    await wait(randomDelay());
    return { status: 'in-progress', assignedTo: 'Insurance Cell', lastUpdated: '2026-04-05', trackingId };
  },

  async getEntitlementCandidates() {
    await wait(randomDelay());
    return {
      farmers: proactiveEntitlements,
    };
  },

  async sendEntitlementSms(farmer) {
    await wait(randomDelay());
    return {
      status: 'sent',
      to: farmer.mobile,
      message: 'आपण PM-KISAN साठी पात्र आहात. अर्ज करा.',
    };
  },
};
