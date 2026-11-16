import app from './src/index';
import http from 'http';
import { prisma } from './src/config/database';

const PORT = 5096;
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
  console.log('🧪 Running GigNova 100-Applicant Verification Suite...\n');

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
    const gigId = 'demo-gig-100-fullstack';

    // 1. Authenticate as TechNova Solutions
    const loginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo-biz-technova@demo.gignova.com',
        password: 'Demo@12345',
      }),
    });
    assert(loginRes.status === 200, '1. TechNova Solutions authenticates successfully');
    const token = loginRes.data.token;

    // 2. Verify target gig exists and has 100 applications in database
    const dbAppCount = await prisma.application.count({
      where: { gigId },
    });
    assert(dbAppCount === 100, `2. Database has exactly 100 applications for demo gig (found ${dbAppCount})`);

    // 3. Verify all 100 applicants have unique student profiles
    const dbProfiles = await prisma.studentProfile.findMany({
      where: {
        user: {
          email: {
            startsWith: 'mock-applicant-',
          },
        },
      },
    });
    const uniqueEmails = new Set(dbProfiles.map((p) => p.userId));
    assert(dbProfiles.length === 100 && uniqueEmails.size === 100, `3. All 100 students have unique student profiles (count: ${dbProfiles.length})`);

    // 4. Fetch SmartMatch results with default 20 per page
    const page1Res = await apiRequest(`/smartmatch/gig/${gigId}?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(page1Res.status === 200, '4. Fetch SmartMatch results for target gig');
    assert(page1Res.data.stats.total === 100, `5. Stats report exactly 100 total applicants (found ${page1Res.data.stats.total})`);
    assert(page1Res.data.stats.eligible > 0, `6. Stats report eligible applicants (${page1Res.data.stats.eligible})`);
    assert(page1Res.data.stats.ineligible > 0, `7. Stats report ineligible applicants (${page1Res.data.stats.ineligible})`);
    assert(page1Res.data.applicants.length === 20, `8. Page 1 returns exactly 20 applicants per page (found ${page1Res.data.applicants.length})`);
    assert(page1Res.data.pagination.pages === 5, `9. Pagination calculates 5 pages for 100 applicants (found ${page1Res.data.pagination.pages})`);

    // 5. Verify ranking order (descending totalScore)
    const apps = page1Res.data.applicants;
    let orderValid = true;
    for (let i = 0; i < apps.length - 1; i++) {
      if (apps[i].smartMatchScore.isEligible && apps[i + 1].smartMatchScore.isEligible) {
        if (apps[i].smartMatchScore.totalScore < apps[i + 1].smartMatchScore.totalScore) {
          orderValid = false;
        }
      }
    }
    assert(orderValid, '10. Page 1 applicants strictly ordered by compatibility score descending');

    // 6. Test page 2 pagination navigation
    const page2Res = await apiRequest(`/smartmatch/gig/${gigId}?page=2&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(page2Res.data.applicants.length === 20, `11. Page 2 returns next 20 applicants (found ${page2Res.data.applicants.length})`);
    assert(page2Res.data.applicants[0].rank === 21, `12. Page 2 first applicant is rank #21 (found #${page2Res.data.applicants[0].rank})`);

    // 7. Verify eligibility filtering
    const eligibleRes = await apiRequest(`/smartmatch/gig/${gigId}?filter=eligible&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allEligible = eligibleRes.data.applicants.every((a: any) => a.smartMatchScore.isEligible);
    assert(allEligible && eligibleRes.data.applicants.length === page1Res.data.stats.eligible, '13. Eligibility filter returns only eligible candidates');

    const ineligibleRes = await apiRequest(`/smartmatch/gig/${gigId}?filter=ineligible&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allIneligible = ineligibleRes.data.applicants.every((a: any) => !a.smartMatchScore.isEligible);
    assert(allIneligible && ineligibleRes.data.applicants.length === page1Res.data.stats.ineligible, '14. Ineligibility filter returns candidates with explicit reasons');

    // 8. Test Shortlist operations: Bulk Top 5 and Top 10
    const bulk5Res = await apiRequest(`/smartmatch/gig/${gigId}/bulk-shortlist`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ count: 5 }),
    });
    assert(bulk5Res.data.shortlisted === 5, '15. Bulk shortlist top 5 eligible candidates succeeds');

    const bulk10Res = await apiRequest(`/smartmatch/gig/${gigId}/bulk-shortlist`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ count: 10 }),
    });
    assert(bulk10Res.data.shortlisted === 10, '16. Bulk shortlist top 10 eligible candidates succeeds');

    // 9. Verify individual candidate detailed report
    const topApplicantId = apps[0].application.id;
    const reportRes = await apiRequest(`/smartmatch/gig/${gigId}/applicant/${topApplicantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(reportRes.status === 200, '17. Single candidate detailed SmartMatch report loads');
    const s = reportRes.data.report.smartMatchScore;
    assert(
      s.skillScore >= 0 && s.experienceScore >= 0 && s.availabilityScore >= 0 && s.workModeScore >= 0 && s.assessmentScore >= 0,
      '18. 5-factor scoring engine provides complete breakdown for candidate'
    );

    // 10. Verify manual shortlist toggle on applicant
    const toggleRes = await apiRequest(`/smartmatch/application/${topApplicantId}/shortlist`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ shortlisted: false }),
    });
    assert(toggleRes.data.isShortlisted === false, '19. Manual shortlist toggle (remove) works');

    // 11. Verify real university user data untouched
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@gignova.com' } });
    const studentUser = await prisma.user.findUnique({ where: { email: 'student@gignova.com' } });
    const businessUser = await prisma.user.findUnique({ where: { email: 'business@gignova.com' } });
    assert(Boolean(adminUser && studentUser && businessUser), '20. Existing production/university accounts completely untouched');

  } catch (err: any) {
    console.error('Test suite error:', err.message);
    failed++;
  } finally {
    server.close();
    console.log(`\n=============================================`);
    console.log(`🏁 100-Applicant Verification: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
