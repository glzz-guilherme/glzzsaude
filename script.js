// Navegação mobile
const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');
menuBtn?.addEventListener('click', ()=>{
  const open = mainNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

// Acessibilidade
const root = document.documentElement;
const fsLabel = document.getElementById('fontSizeLabel');
let fs = 100;
function updateFS(){ root.style.setProperty('--fs', fs+'%'); if(fsLabel) fsLabel.textContent = fs+'%'; }
document.getElementById('fontInc')?.addEventListener('click', ()=>{ fs = Math.min(130, fs+10); updateFS(); });
document.getElementById('fontDec')?.addEventListener('click', ()=>{ fs = Math.max(80, fs-10); updateFS(); });
document.getElementById('contrastToggle')?.addEventListener('click', (e)=>{
  document.body.classList.toggle('contrast');
  const pressed = document.body.classList.contains('contrast');
  e.currentTarget.setAttribute('aria-pressed', String(pressed));
});

// Nav ativa
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });
})();

// Checklist (localStorage)
const chkForm = document.getElementById('chkForm');
const chkProgress = document.getElementById('chkProgress');
const chkPercent = document.getElementById('chkPercent');
const chkDoneTag = document.getElementById('chkDoneTag');
const chkPercentText = document.getElementById('chkPercentText');
const STORAGE_KEY = 'gestante_checklist_v1';

function readChecklist(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY))||{} }catch{return {}} }
function writeChecklist(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function updateProgress(){
  if(!chkForm) return;
  const checks = [...chkForm.querySelectorAll('input[type="checkbox"]')];
  const total = checks.length || 1;
  const done = checks.filter(c=>c.checked).length;
  const pct = Math.round((done/total)*100);
  if(chkProgress) chkProgress.value = pct;
  if(chkPercent) chkPercent.textContent = pct+'%';
  if(chkPercentText) chkPercentText.textContent = pct+'%';
  if(chkDoneTag) chkDoneTag.hidden = false;
}
function loadChecklist(){
  if(!chkForm) return;
  const state = readChecklist();
  [...chkForm.querySelectorAll('input[type="checkbox"]')].forEach(c=>{
    c.checked = Boolean(state[c.value]);
    c.addEventListener('change', updateProgress);
  });
  updateProgress();
}
document.getElementById('saveChecklist')?.addEventListener('click', ()=>{
  const state = {};
  [...chkForm.querySelectorAll('input[type="checkbox"]')].forEach(c=>state[c.value]=c.checked);
  writeChecklist(state);
  alert('Checklist salvo neste dispositivo.');
});
document.getElementById('clearChecklist')?.addEventListener('click', ()=>{
  localStorage.removeItem(STORAGE_KEY);
  [...chkForm.querySelectorAll('input[type="checkbox"]')].forEach(c=>c.checked=false);
  updateProgress();
});
loadChecklist();

// Alertas
const alertForm = document.getElementById('alertForm');
const alertOut = document.getElementById('alertOutput');
document.getElementById('checkAlerts')?.addEventListener('click', ()=>{
  if(!alertForm || !alertOut) return;
  const flagged = [...alertForm.querySelectorAll('input[type="checkbox"]')].some(c=>c.checked);
  if(flagged){
    alertOut.innerHTML = '<div class="alert-box"><strong>Atenção:</strong> procure avaliação em um serviço de saúde. Em urgência, ligue <strong>192</strong>.</div>';
  }else{
    alertOut.innerHTML = '<div class="ok-box"><strong>Sem sinais graves agora.</strong> Mantenha hidratação, descanso e acompanhamento pré-natal.</div>';
  }
});

// Quiz (multi-blocos)
const QUIZ_KEY = 'quiz_scores_v1';
function saveScore(id,score,total){
  let data = {};
  try{ data = JSON.parse(localStorage.getItem(QUIZ_KEY))||{} }catch{}
  const prev = data[id]?.best||0;
  data[id] = { best: Math.max(prev, score), last: score, total };
  localStorage.setItem(QUIZ_KEY, JSON.stringify(data));
}
function handleQuiz(btnId, formId, outId, quizId, answers){
  const btn = document.getElementById(btnId);
  btn?.addEventListener('click', ()=>{
    const fd = new FormData(document.getElementById(formId));
    let score = 0;
    answers.forEach(([name,correct])=>{
      if((fd.get(name)||'')===correct) score++;
    });
    const out = document.getElementById(outId);
    out.textContent = `Você acertou ${score}/${answers.length}.`;
    saveScore(quizId, score, answers.length);
  });
}

// Instancia quizzes se existirem
handleQuiz('quizBtn1','quizForm1','quizOut1','quiz_basico_1', [['q1','b'],['q2','a'],['q3','a']]);
handleQuiz('quizBtn2','quizForm2','quizOut2','quiz_nutricao_1', [['q4','c'],['q5','b'],['q6','a']]);
