import app from './src/index';
import http from 'http';

const PORT = 5097;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let server: http.Server;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<{ status: number; ok: boolean; data: any }> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting GigNova SmartMatch Integration Verification Suite...\n');

  server = app.listen(PORT, '127.0.0.1');
  await sleep(1000);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Business Login
    const bizLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo-biz-cloud@demo.gignova.com',
        password: 'Demo@12345',
      }),
    });
    assert(bizLogin.status === 200, '1. Business authenticates with demo credentials');
    const bizToken = bizLogin.data.token;

    // 2. Retrieve SmartMatch ranked applicants
    const matchRes = await apiRequest('/smartmatch/gig/demo-gig-01-fullstack', {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    assert(matchRes.status === 200, '2. Retrieve SmartMatch results for gig listing');
    assert(matchRes.data.stats.total >= 5, '3. Total applications counted correctly');
    assert(matchRes.data.stats.eligible >= 1, '4. Eligible applicants identified');
    assert(matchRes.data.stats.highestScore >= 80, '5. Highest compatibility score computed');

    // 3. Verify rank ordering
    const applicants = matchRes.data.applicants;
    let orderValid = true;
    for (let i = 0; i < applicants.length - 1; i++) {
      if (applicants[i].smartMatchScore.isEligible && applicants[i + 1].smartMatchScore.isEligible) {
        if (applicants[i].smartMatchScore.totalScore < applicants[i + 1].smartMatchScore.totalScore) {
          orderValid = false;
        }
      }
    }
    assert(orderValid, '6. Applicants correctly ranked by totalScore descending');

    // 4. Detailed Applicant Compatibility Report
    const topApplicant = applicants[0];
    const reportRes = await apiRequest(
      `/smartmatch/gig/demo-gig-01-fullstack/applicant/${topApplicant.application.id}`,
      { headers: { Authorization: `Bearer ${bizToken}` } }
    );
    assert(reportRes.status === 200, '7. Retrieve detailed applicant compatibility report');
    const score = reportRes.data.report.smartMatchScore;
    assert(
      score.skillScore >= 0 &&
      score.experienceScore >= 0 &&
      score.availabilityScore >= 0 &&
      score.workModeScore >= 0 &&
      score.assessmentScore >= 0,
      '8. 5-factor scoring engine provides complete score breakdown'
    );
    assert(score.explanation.summary.length > 10, '9. Natural language explanation generated');

    // 5. Shortlist toggling
    const shortlistRes = await apiRequest(
      `/smartmatch/application/${topApplicant.application.id}/shortlist`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${bizToken}` },
        body: JSON.stringify({ shortlisted: true }),
      }
    );
    assert(shortlistRes.data.isShortlisted === true, '10. Candidate successfully shortlisted');

    // 6. Bulk Shortlisting
    const bulkRes = await apiRequest('/smartmatch/gig/demo-gig-01-fullstack/bulk-shortlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({ count: 2 }),
    });
    assert(bulkRes.data.shortlisted >= 1, '11. Bulk shortlisting top candidates succeeds');

    // 7. Force Score Recalculation
    const recalcRes = await apiRequest('/smartmatch/gig/demo-gig-01-fullstack/recalculate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    assert(recalcRes.status === 200, '12. Force score recalculation endpoint succeeds');

  } catch (err: any) {
    console.error('Test suite error:', err.message);
    failed++;
  } finally {
    server.close();
    console.log(`\n=============================================`);
    console.log(`🏁 SmartMatch Verification: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
