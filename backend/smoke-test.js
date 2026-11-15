// End-to-end check of every API call the frontend makes.
// Usage: start the API (npm run dev), then: node smoke-test.js [baseUrl]
const assert = require('node:assert/strict');

const BASE = (process.argv[2] || 'http://localhost:4000') + '/api';
let token = '';

async function call(path, method = 'GET', body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, ...(await res.json()) };
}

async function main() {
  const email = `smoke${Date.now()}@iitbhilai.ac.in`;
  let r = await call('/auth/register', 'POST', { name: 'Smoke', email, password: 'password123' });
  assert.equal(r.status, 201, r.message);
  r = await call('/auth/login', 'POST', { email, password: 'password123' });
  assert.equal(r.status, 200, r.message);
  token = r.data.token;
  assert.equal(r.data.user.semester, 1);

  r = await call('/auth/me', 'PATCH', { semester: 3 });
  assert.equal(r.data.semester, 3);

  r = await call('/courses', 'POST', { name: 'Data Structures', code: 'CS201', credits: 4 });
  assert.equal(r.status, 201, r.message);
  assert.equal(r.data.credits, 4);
  const course = r.data;
  r = await call(`/courses/${course.id}`, 'PUT', { name: 'DSA', code: 'CS201', credits: 5 });
  assert.equal(r.data.credits, 5);

  r = await call('/timetable', 'PUT', { slots: [{ course_id: course.id, weekday: 'Monday', start_time: '09:00' }] });
  assert.equal(r.status, 200, r.message);
  r = await call('/timetable');
  assert.deepEqual(r.data.map((s) => [s.course_id, s.weekday, s.start_time]), [[course.id, 'Monday', '09:00']]);
  r = await call('/timetable', 'PUT', { slots: [{ course_id: 999999, weekday: 'Monday', start_time: '09:00' }] });
  assert.equal(r.status, 404, 'cannot use another user\'s course');

  r = await call(`/courses/${course.id}/attendance`, 'POST', { class_date: '2026-11-09', status: 'present' });
  assert.equal(r.status, 201, r.message);
  const rec = r.data;
  await call(`/courses/${course.id}/attendance`, 'POST', { class_date: '2026-11-10', status: 'absent' });
  r = await call(`/attendance/${rec.id}`, 'PUT', { status: 'cancelled' });
  assert.equal(r.data.status, 'cancelled');
  r = await call('/attendance?date=2026-11-09');
  assert.equal(r.data.length, 1);
  r = await call('/attendance/summary');
  assert.deepEqual(
    [r.data[0].attended, r.data[0].total_classes, r.data[0].cancelled],
    [0, 1, 1],
    'cancelled classes are excluded from totals'
  );

  r = await call('/assignments', 'POST', {
    course_id: course.id, title: 'Mid-sem', type: 'Exam', due_at: '2026-11-20T18:29:00.000Z',
  });
  assert.equal(r.status, 201, r.message);
  assert.equal(r.data.type, 'Exam');
  const assignment = r.data;
  r = await call('/assignments');
  assert.equal(r.data.length, 1);
  r = await call(`/assignments/${assignment.id}`, 'DELETE');
  assert.equal(r.status, 200);

  r = await call(`/courses/${course.id}`, 'DELETE');
  assert.equal(r.status, 200);

  r = await call('/does-not-exist');
  assert.equal(r.status, 404, 'unknown routes return 404, not 401');

  token = '';
  let last;
  for (let i = 0; i < 25; i++) last = await call('/auth/login', 'POST', { email, password: 'wrong-pass' });
  assert.equal(last.status, 429, 'login is rate limited');

  console.log('smoke test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
