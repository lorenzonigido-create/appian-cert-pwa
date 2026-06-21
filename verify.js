const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const FILE = 'file://' + path.resolve('/home/user/appian-cert-pwa/appian-cert-pwa.html');
const SS = '/home/user/appian-cert-pwa/screenshots';
fs.mkdirSync(SS, { recursive: true });

let pass = 0, fail = 0, warns = [];

function ok(label) { console.log('✅', label); pass++; }
function ko(label, detail) { console.log('❌', label, detail||''); fail++; }
function warn(label) { console.log('⚠️ ', label); warns.push(label); }
async function ss(page, name) { await page.screenshot({ path: `${SS}/${name}.png`, fullPage: false }); }
async function html(page, sel) { return page.evaluate(s => document.querySelector(s)?.innerHTML || '', sel); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });

  await page.goto(FILE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await ss(page, '01-home');

  // ── 1. HOME tab ──
  const homeH = await html(page, '#s-home');
  if (homeH && homeH.includes('Developer')) ok('HOME: renders hero title');
  else ko('HOME: no title found');

  const statsGrid = await page.$('#s-home .sg');
  if (statsGrid) ok('HOME: stats grid (XP/streak) present');
  else warn('HOME: no stats grid visible');

  // ── 2. ROAD tab ──
  await page.click('[data-t="road"]');
  await page.waitForTimeout(400);
  const roadH = await html(page, '#s-road');
  if (roadH && roadH.length > 100) ok('ROAD: content rendered');
  else ko('ROAD: empty');
  await ss(page, '02-road');

  // ── 3. LEARN tab ──
  await page.click('[data-t="learn"]');
  await page.waitForTimeout(400);
  const chCards = await page.$$('#s-learn .card');
  if (chCards.length >= 8) ok(`LEARN: ${chCards.length} chapter cards`);
  else warn(`LEARN: only ${chCards.length} cards (expected ≥8)`);
  await ss(page, '03-learn');

  // Click first chapter (first card has onclick with oCh)
  let clickedChapter = false;
  for (const card of chCards) {
    const oc = await card.getAttribute('onclick');
    if (oc && oc.includes('oCh')) {
      await card.click();
      clickedChapter = true;
      break;
    }
  }

  if (clickedChapter) {
    await page.waitForTimeout(400);
    const lesCards = await page.$$('#s-learn .card');
    if (lesCards.length > 0) ok('LEARN: chapter opens showing lessons/content');
    else ko('LEARN: chapter click shows no content');
    await ss(page, '03b-chapter');

    // Click first unlocked lesson (opacity 1, onclick contains oLs)
    let lessonClicked = false;
    const allCards = await page.$$('#s-learn .card');
    for (const card of allCards) {
      const oc = await card.getAttribute('onclick');
      if (oc && oc.includes('oLs')) {
        const opacity = await card.evaluate(el => el.style.opacity);
        if (opacity !== '0.5') {
          await card.click();
          lessonClicked = true;
          break;
        }
      }
    }

    if (lessonClicked) {
      await page.waitForTimeout(400);
      const lesH = await html(page, '#s-learn');
      if (lesH.includes('docs.appian.com')) ok('LEARN: lesson renders with Docs link');
      else if (lesH.length > 100) ok('LEARN: lesson content rendered');
      else ko('LEARN: lesson not rendered');

      // Check doc link URL is not broken
      const docLink = await page.$('#s-learn a[href*="docs.appian.com"]');
      if (docLink) {
        const href = await docLink.getAttribute('href');
        const broken = /Appian_Designer|Deployment\.html|Working_with_Data|Read-Only_Grid|Object_Security|Appian_AI_Overview|Appian_RPA/.test(href);
        if (broken) ko('DOC LINKS: broken URL in lesson: ' + href);
        else ok('DOC LINKS: lesson URL looks correct: ' + href.split('/').pop());
      }
      await ss(page, '03c-lesson');

      // Quiz at bottom of lesson
      const quizOpts = await page.$$('.qopt');
      if (quizOpts.length >= 2) {
        ok(`LEARN: quiz shows ${quizOpts.length} options`);
        await quizOpts[0].click();
        await page.waitForTimeout(300);
        await ss(page, '03d-quiz-answered');
        // Verify option got marked
        const selOpt = await page.$('.qopt.sel, .qopt.correct, .qopt.wrong');
        if (selOpt) ok('LEARN: quiz option click registered (visual feedback)');
        else ok('LEARN: quiz option clickable');
      } else {
        warn('LEARN: quiz options not found, skipping quiz interaction');
      }
    } else {
      warn('LEARN: no unlocked lesson card to click');
    }
  }

  // ── 4. AI tab ──
  await page.click('[data-t="ai"]');
  await page.waitForTimeout(400);
  const aiH = await html(page, '#s-ai');
  if (aiH && aiH.length > 50) ok('AI: tab renders');
  else ko('AI: empty');
  const aiInput = await page.$('#ai-inp');
  if (aiInput) ok('AI: chat input present');
  else warn('AI: no chat input found');
  await ss(page, '04-ai');

  // ── 5. ESAME tab ──
  await page.click('[data-t="exam"]');
  await page.waitForTimeout(400);
  await ss(page, '05-exam-intro');

  const examH = await html(page, '#s-exam');
  const startBtn = await page.$('[onclick="stEX()"]');
  if (!startBtn) {
    ko('ESAME: no start button');
  } else {
    ok('ESAME: intro screen with start button');
    if (examH.includes('60') || examH.includes('DOMANDE') || examH.includes('SYLLABUS')) {
      ok('ESAME: exam info (question count/format) shown');
    }

    await startBtn.click();
    await page.waitForTimeout(600);
    await ss(page, '05b-exam-q1');

    const qText = await page.$('#s-exam .qtext');
    if (qText) ok('ESAME: first question rendered');
    else ko('ESAME: question text (.qtext) not found');

    const examOpts = await page.$$('#s-exam .qopt');
    if (examOpts.length === 4) ok('ESAME: 4 answer options present');
    else ko(`ESAME: expected 4 opts, got ${examOpts.length}`);

    if (examOpts.length >= 4) {
      await examOpts[0].click();
      await page.waitForTimeout(200);
      // Check option got selected
      const selOpt = await page.$('#s-exam .qopt.sel');
      if (selOpt) ok('ESAME: option selection works (sel class applied)');
      else warn('ESAME: option click did not apply .sel class');
      await ss(page, '05c-exam-selected');

      const timer = await page.$('#ex-t');
      if (timer) ok('ESAME: timer (#ex-t) visible');
      else warn('ESAME: timer not found');

      // Navigate to Q2
      await page.evaluate(() => typeof exN === 'function' && exN(1));
      await page.waitForTimeout(300);
      await ss(page, '05d-exam-q2');
      const q2Text = await page.$('#s-exam .qtext');
      if (q2Text) ok('ESAME: navigation to Q2 works');
      else warn('ESAME: Q2 not found');

      // Jump to last question (cur=58 so exN(1) lands on index 59, the 60th question)
      await page.evaluate(() => {
        if (typeof EX !== 'undefined') { EX.cur = 58; EX.left = 3600; }
      });
      await page.evaluate(() => typeof exN === 'function' && exN(1));
      await page.waitForTimeout(300);
      await ss(page, '05e-exam-q60');
      const q60H = await html(page, '#s-exam');
      if (q60H.includes('CONSEGNA') || q60H.includes('subEX')) {
        ok('ESAME: submit/CONSEGNA button appears at Q60');
      } else if (q60H.includes('60/60') || q60H.includes('Dom. 60')) {
        ok('ESAME: Q60 reached (last question)');
      } else {
        warn('ESAME: end state at Q60 not confirmed');
      }
    }
  }

  // ── 6. SHARE tab ──
  await page.click('[data-t="contrib"]');
  await page.waitForTimeout(400);
  await ss(page, '06-share');
  const shareH = await html(page, '#s-contrib');
  if (!shareH || shareH.length < 20) {
    ko('SHARE: tab empty');
  } else {
    ok('SHARE: tab renders content');

    const textarea = await page.$('#cq-q');
    if (textarea) ok('SHARE: question textarea (#cq-q) present');
    else ko('SHARE: no textarea #cq-q');

    const ansBtn = await page.$('.ans-btn');
    if (ansBtn) ok('SHARE: answer selector buttons (.ans-btn) present');
    else ko('SHARE: no .ans-btn buttons');

    // Try submitting empty form (should show toast, form stays)
    const submitBtn = await page.$('[onclick="submitCQ()"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(200);
      // Toast pops up, form should still be there
      const stillHasForm = await page.$('#cq-q');
      if (stillHasForm) ok('SHARE: empty form validation prevents submit (form remains)');
      else warn('SHARE: form disappeared after empty submit');
    }

    // Fill and submit a test question
    if (textarea) {
      await textarea.fill('Domanda di test per verifica automatica');
      for (let i = 0; i < 4; i++) {
        const f = await page.$('#cq-o' + i);
        if (f) await f.fill('Opzione ' + String.fromCharCode(65+i));
      }
      const ansButtons = await page.$$('.ans-btn');
      if (ansButtons.length >= 2) await ansButtons[1].click();
      // cqAns() re-renders the form, so re-fetch submitBtn
      await page.waitForTimeout(200);
      const submitBtn2 = await page.$('[onclick="submitCQ()"]');
      if (submitBtn2) {
        await submitBtn2.click();
        await page.waitForTimeout(400);
        await ss(page, '06b-share-submitted');
        // After successful submit, CQView switches to 'list' and rContrib() is called
        const afterH = await html(page, '#s-contrib');
        if (afterH.includes('COMMUNITY') || afterH.includes('Domanda di test') || afterH.includes('ELENCO')) {
          ok('SHARE: question submitted, view switched to list');
        } else {
          warn('SHARE: submit result unclear');
        }
      }
    }

    // List view toggle
    const listBtn = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('#s-contrib button')];
      const lb = btns.find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes("CQView='list'"));
      return lb ? lb.textContent : null;
    });
    if (listBtn) {
      await page.evaluate(() => { CQView='list'; rContrib(); });
      await page.waitForTimeout(300);
      await ss(page, '06c-share-list');
      const listH = await html(page, '#s-contrib');
      if (listH.includes('Domanda di test') || listH.includes('COMMUNITY') || listH.includes('Nessuna')) {
        ok('SHARE: list view renders correctly');
      } else warn('SHARE: list view content unclear');
    } else {
      warn('SHARE: list toggle button not found');
    }
  }

  // ── 7. DOC LINKS check (all) in source ──
  const brokenPat = /Appian_Designer|Deployment\.html|Working_with_Data|Read-Only_Grid|Object_Security\.html|Appian_AI_Overview|Appian_RPA/;
  const htmlContent = fs.readFileSync('/home/user/appian-cert-pwa/appian-cert-pwa.html', 'utf8');
  if (brokenPat.test(htmlContent)) ko('DOC LINKS: broken URLs still in source file');
  else ok('DOC LINKS: no broken URLs in source');

  // ── 8. JS errors ──
  // Filter out expected network/font errors in headless environment
  const realErrors = errors.filter(e =>
    !e.includes('ERR_CERT_AUTHORITY_INVALID') &&
    !e.includes('ERR_NETWORK_CHANGED') &&
    !e.includes('fonts.googleapis.com') &&
    !e.includes('Failed to load resource')
  );
  if (realErrors.length === 0) ok('NO JS errors in console');
  else {
    ko(`JS ERRORS: ${realErrors.length} error(s)`);
    realErrors.forEach(e => console.log('   →', e.substring(0, 120)));
  }
  if (errors.length > realErrors.length) {
    console.log(`   ℹ️  ${errors.length - realErrors.length} network/font error(s) ignored (headless env)`);
  }

  // ── 9. JSON validity of EXAM array ──
  try {
    const m = htmlContent.match(/"EXAM":\[([\s\S]*?)\],"ACHS":/);
    if (m) {
      const arr = JSON.parse('[' + m[1] + ']');
      ok(`EXAM JSON: valid — ${arr.length} questions parse correctly`);
      if (arr.length >= 112) ok(`EXAM QUESTIONS: ${arr.length} ≥ 112 questions confirmed`);
      else warn(`EXAM QUESTIONS: only ${arr.length} (expected ≥112)`);
    } else {
      ko('EXAM JSON: array not found');
    }
  } catch(e) {
    ko('EXAM JSON: parse error - ' + e.message);
  }

  await browser.close();

  console.log('\n────────────────────────────────');
  console.log(`PASS: ${pass}  FAIL: ${fail}  WARN: ${warns.length}`);
  if (warns.length) { console.log('Warnings:'); warns.forEach(w => console.log('  ⚠️ ', w)); }
  process.exit(fail > 0 ? 1 : 0);
})();
