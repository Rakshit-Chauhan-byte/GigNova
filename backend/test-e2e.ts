import app from './src/index';
import http from 'http';

const PORT = 5099;
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
  console.log('🧪 Starting GigNova End-to-End Integration Verification Suite...\n');

  // Start test server on 127.0.0.1 explicitly
  server = app.listen(PORT, '127.0.0.1');
  await sleep(1000);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await apiRequest('/health');
    assert(health.data.status === 'ok', '1. Backend API health check');

    // 2. Student Registration
    const timestamp = Date.now();
    const testStudentEmail = `test.student.${timestamp}@sharda.ac.in`;
    const studentReg = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'Password@123',
        role: 'STUDENT',
        fullName: 'Test Student Sharda',
      }),
    });
    assert(studentReg.status === 201 && !!studentReg.data.token, '2. Student registration with profile creation');
    const studentToken = studentReg.data.token;

    // 3. Duplicate Email Prevention
    const dupRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'Password@123',
        role: 'STUDENT',
      }),
    });
    assert(dupRes.status === 409, '3. Duplicate email registration rejected with 409');

    // 4. Student Login
    const studentLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'Password@123',
      }),
    });
    assert(studentLogin.data.user?.role === 'STUDENT', '4. Student login returns valid session');

    // 5. Business Registration
    const testBusinessEmail = `test.biz.${timestamp}@company.com`;
    const bizReg = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testBusinessEmail,
        password: 'Password@123',
        role: 'BUSINESS',
        businessName: 'Apex Robotics Labs',
      }),
    });
    assert(bizReg.status === 201 && !!bizReg.data.token, '5. Business registration with profile initialization');
    const bizToken = bizReg.data.token;

    // 6. Business Login
    const bizLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testBusinessEmail,
        password: 'Password@123',
      }),
    });
    assert(bizLogin.data.user?.role === 'BUSINESS', '6. Business login returns valid session');

    // 7. Student Profile Editing & Skills Update
    const profileUpdate = await apiRequest('/student/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        college: 'Sharda University - School of Engineering',
        degree: 'B.Tech CS',
        yearOfStudy: '3rd Year',
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        preferredWorkType: 'remote',
        availability: { days: ['Monday', 'Tuesday', 'Wednesday'], hours: '4-6 hours/day' },
        bio: 'Enthusiastic student developer eager to work on impactful web gigs.',
      }),
    });
    assert(
      profileUpdate.data.profile?.skills?.includes('React') &&
        profileUpdate.data.profile?.college?.includes('Sharda'),
      '7. Student profile update with JSON array skills & availability'
    );

    // 8. Student Dashboard Data Fetch
    const studentDash = await apiRequest('/student/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      studentDash.data.stats !== undefined && studentDash.data.profile !== undefined,
      '8. Student dashboard statistics database retrieval'
    );

    // 9. Business Profile Update
    const bizUpdate = await apiRequest('/business/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({
        industry: 'Robotics & Automation',
        website: 'https://apexrobotics.example.com',
        location: 'Noida, UP',
        description: 'Pioneering student-led robotics innovations.',
      }),
    });
    assert(bizUpdate.data.profile?.industry === 'Robotics & Automation', '9. Business profile update');

    // 10. Business Verification Request Submission
    const verifSub = await apiRequest('/business/verification', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({
        taxId: '07AAACA1234Q1Z5',
        registrationNo: 'U72900UP2024PTC987654',
        additionalInfo: 'Registered with Ministry of Corporate Affairs.',
      }),
    });
    assert(verifSub.status === 200, '10. Business verification request submission');

    // 11. Admin Login
    const adminLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@gignova.com',
        password: 'Admin@123456',
      }),
    });
    assert(adminLogin.data.user?.role === 'ADMIN', '11. Admin login with seeded credentials');
    const adminToken = adminLogin.data.token;

    // 12. Admin Verification Review (Approval)
    const verifList = await apiRequest('/admin/verifications', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingReq = verifList.data.requests?.find((r: any) => r.taxId === '07AAACA1234Q1Z5');
    assert(!!pendingReq, '12. Admin retrieves pending verification requests');

    if (pendingReq) {
      const reviewRes = await apiRequest(`/admin/verifications/${pendingReq.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          action: 'APPROVED',
          adminNote: 'Tax ID verified successfully.',
        }),
      });
      assert(
        reviewRes.data.message?.includes('approved'),
        '13. Admin approves business verification and awards verified badge'
      );
    }

    // 14. Business Creates a Gig
    const gigCreate = await apiRequest('/gigs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({
        title: 'Full Stack React & Node Developer for Automation Tool',
        category: 'Freelance',
        description:
          'Build a full stack web dashboard for controlling industrial robotic units using React and Node.js.',
        requiredSkills: ['React', 'Node.js', 'TypeScript'],
        compensation: '18000',
        compensationType: 'fixed',
        workType: 'remote',
        duration: '1 month',
        openings: 2,
        requiredAvailability: 'Flexible',
      }),
    });
    assert(
      gigCreate.status === 201 && !!gigCreate.data.gig?.id,
      '14. Employer publishes a new gig listing'
    );
    const createdGigId = gigCreate.data.gig?.id;

    // 15. Gig Search & Filtering
    const gigSearch = await apiRequest('/gigs?search=Robotic&category=Freelance', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      gigSearch.data.gigs?.some((g: any) => g.id === createdGigId),
      '15. Gig search by query string & category filtering'
    );

    // 16. Deterministic Compatibility Match Engine
    const matchScoreRes = await apiRequest(`/match/score/${createdGigId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      matchScoreRes.data.score >= 80 && matchScoreRes.data.matchingSkills?.includes('react'),
      `16. Deterministic skill match score calculation (${matchScoreRes.data.score}% match)`
    );

    // 17. Recommended Gigs Endpoint
    const recGigs = await apiRequest('/match/recommendations', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      Array.isArray(recGigs.data.recommendations) && recGigs.data.recommendations.length > 0,
      '17. Personalized gig recommendations endpoint'
    );

    // 18. Student Submits Application
    const appSubmit = await apiRequest('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        gigId: createdGigId,
        coverLetter: 'I have experience building real-time dashboard applications with React and Node.js.',
      }),
    });
    assert(
      appSubmit.status === 201 && !!appSubmit.data.application?.id,
      '18. Student applies for gig with cover letter'
    );
    const applicationId = appSubmit.data.application?.id;

    // 19. Duplicate Application Prevention
    const dupAppRes = await apiRequest('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ gigId: createdGigId }),
    });
    assert(dupAppRes.status === 409, '19. Duplicate application prevention prevents double apply');

    // 20. Recruiter Views Applications for Gig
    const gigApps = await apiRequest(`/gigs/${createdGigId}/applications`, {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    assert(
      gigApps.data.applications?.some((a: any) => a.id === applicationId),
      '20. Employer views received applicants'
    );

    // 21. Recruiter Moves Application Status to UNDER_REVIEW
    const underReviewRes = await apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({
        status: 'UNDER_REVIEW',
        providerNote: 'Reviewing GitHub profile.',
      }),
    });
    assert(
      underReviewRes.data.application?.status === 'UNDER_REVIEW',
      '21. Application moved to UNDER_REVIEW'
    );

    // 22. Recruiter Accepts Student Application
    const acceptRes = await apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({
        status: 'ACCEPTED',
        providerNote: 'Welcome to the team! Slack invite sent to email.',
      }),
    });
    assert(
      acceptRes.data.application?.status === 'ACCEPTED',
      '22. Application status updated to ACCEPTED'
    );

    // 23. Student Views Updated Application Status
    const myApps = await apiRequest('/applications/mine', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const myApp = myApps.data.applications?.find((a: any) => a.id === applicationId);
    assert(
      myApp?.status === 'ACCEPTED',
      '23. Real-time application status synchronization on student side'
    );

    // 24. Recruiter Marks Completed Work
    const completeRes = await apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${bizToken}` },
      body: JSON.stringify({
        status: 'COMPLETED',
        providerNote: 'Outstanding work delivered on time.',
      }),
    });
    assert(
      completeRes.data.application?.status === 'COMPLETED',
      '24. Work marked COMPLETED'
    );

    // 25. User Submits Safety Report
    const reportRes = await apiRequest('/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        reportedGigId: createdGigId,
        reason: 'Other policy violation',
        description: 'Test moderation verification report.',
      }),
    });
    assert(reportRes.status === 201, '25. Safety report submission against listing');

    // 26. Admin Receives Safety Report
    const adminReports = await apiRequest('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const foundReport = adminReports.data.reports?.find((r: any) => r.id === reportRes.data.report?.id);
    assert(!!foundReport, '26. Admin receives safety report in moderation queue');

    // 27. Admin Resolves Report
    if (foundReport) {
      const resolveReport = await apiRequest(`/admin/reports/${foundReport.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          action: 'RESOLVED',
          adminNote: 'Report investigated and resolved.',
        }),
      });
      assert(resolveReport.data.message?.includes('updated'), '27. Admin marks report RESOLVED');
    }

    // 28. Admin Moderation - Suspend User
    const suspendRes = await apiRequest(`/admin/users/${studentLogin.data.user.id}/suspend`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ suspend: true }),
    });
    assert(suspendRes.data.message?.includes('suspended'), '28. Admin suspends user account');

    // 29. Suspended User Blocked
    const suspendedLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'Password@123',
      }),
    });
    assert(suspendedLogin.status === 403, '29. Suspended user blocked from accessing platform (403)');

    // 30. Admin Reactivates User
    const reactivateRes = await apiRequest(`/admin/users/${studentLogin.data.user.id}/suspend`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ suspend: false }),
    });
    assert(reactivateRes.data.message?.includes('reactivated'), '30. Admin reactivates user account');

  } catch (err: any) {
    console.error('Test suite runtime error:', err.message);
    failed++;
  } finally {
    server.close();
    console.log(`\n=============================================`);
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
