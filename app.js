// ===================== STATE =====================
const appState = {
  currentScreen: 'home',
  user: null, // { name, handle, avatar, provider }
  checklist: {
    groups: [
      { title: '📄 기본 서류', items: [
        { text: '여권 유효기간 확인', sub: '체류 기간 + 최소 6개월 이상', status: 'unchecked', tag: '필수' },
        { text: '여권 규격 사진 준비', sub: '흰 배경 규격 사진 6~10장', status: 'unchecked', tag: '필수' },
        { text: '주민등록등본 (영문) 발급', sub: '정부24 또는 주민센터 발급', status: 'unchecked', tag: '필수' },
        { text: '범죄경력증명서 (영문)', sub: '경찰청 발급 · 아포스티유 인증 필요한 경우 있음', status: 'unchecked', tag: '필수' },
      ]},
      { title: '💰 재정 서류', items: [
        { text: '잔액증명서 준비', sub: 'USD $3,000~$5,000 이상 (국가별 상이)', status: 'unchecked', tag: '필수' },
        { text: '영문 은행 거래내역서', sub: '최근 3~6개월, 영문 발급', status: 'unchecked', tag: '필수' },
        { text: '국제 신용/체크카드 발급', sub: 'VISA 또는 Mastercard, 해외 결제 가능 확인', status: 'unchecked', tag: '선택' },
      ]},
      { title: '🏥 건강 서류', items: [
        { text: '건강검진 예약', sub: '호주·캐나다·미국 영주권은 지정 병원 신체검사 필수', status: 'unchecked', tag: '필수' },
        { text: '여행자 보험 가입', sub: '의료비 USD $50,000 이상 커버 권장', status: 'unchecked', tag: '필수' },
        { text: '예방접종 기록 확인', sub: '홍역·풍진 등 일부 국가 MMR 접종 요구', status: 'unchecked', tag: '선택' },
      ]},
      { title: '✈️ 출발 전 준비', items: [
        { text: '항공권 예약', sub: '편도 또는 왕복 (국가별 입국 조건 확인)', status: 'unchecked', tag: '필수' },
        { text: '현지 숙소 예약 (초기)', sub: '입국 시 주소 제시 필요, 2~4주 분 준비 권장', status: 'unchecked', tag: '필수' },
      ]},
    ]
  }
};

// ===================== ONBOARDING =====================
let obCurrent = 0;
const OB_TOTAL = 3;

function obNext() {
  const btn = document.getElementById('obNextBtn');
  if (obCurrent < OB_TOTAL - 1) {
    // slide out current
    const cur = document.getElementById('obSlide' + obCurrent);
    cur.classList.remove('active');
    cur.classList.add('out');
    obCurrent++;
    // slide in next
    const next = document.getElementById('obSlide' + obCurrent);
    next.classList.add('active');
    // update dots
    document.querySelectorAll('.ob-dot').forEach((d,i) => d.classList.toggle('active', i === obCurrent));
    // last slide
    if (obCurrent === OB_TOTAL - 1) btn.textContent = '로그인하러 가기';
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('onboardingView').style.display = 'none';
  document.getElementById('loginView').style.display = 'flex';
}

// ===================== LOGIN =====================
const LOGIN_PROFILES = {
  kakao:  { name: '카카오 사용자', handle: '@kakao_user', avatar: '🐱', status: '비자 준비 중' },
  google: { name: 'Google 사용자', handle: '@google_user', avatar: '🔵', status: '비자 준비 중' },
  apple:  { name: 'Apple 사용자', handle: '@apple_user', avatar: '🍎', status: '비자 준비 중' },
  guest:  { name: '비회원', handle: '@guest', avatar: '👤', status: '비회원으로 둘러보는 중' },
};

function doLogin(provider) {
  appState.user = LOGIN_PROFILES[provider];
  document.getElementById('loginView').style.display = 'none';
  const main = document.getElementById('mainApp');
  main.classList.add('visible');
  // update profile
  updateProfileUI();
  // init screens
  initHome();
  initCountry();
  renderChecklist();
  // greeting
  const greeting = provider === 'guest'
    ? '안녕하세요 👋'
    : `안녕하세요, ${appState.user.name.split(' ')[0]}님 👋`;
  document.getElementById('heroGreeting').textContent = greeting;
}

function updateProfileUI() {
  const u = appState.user;
  if (!u) return;
  const avatar = document.getElementById('profileAvatar');
  const name = document.getElementById('profileName');
  const handle = document.getElementById('profileHandle');
  const status = document.getElementById('profileStatus');
  if (avatar) avatar.textContent = u.avatar;
  if (name) name.textContent = u.name;
  if (handle) handle.textContent = u.handle;
  if (status) status.textContent = u.status;
}

function logoutUser() {
  if (confirm('로그아웃 하시겠습니까?')) {
    appState.user = null;
    document.getElementById('mainApp').classList.remove('visible');
    document.getElementById('loginView').style.display = 'flex';
  }
}

// ===================== COUNTRY DATA =====================
const VL = { wh:'워킹홀리데이', work:'취업비자', pr:'영주권', student:'학생비자' };
const VTC = { wh:'tag-badge--wh', work:'tag-badge--work', pr:'tag-badge--pr', student:'tag-badge--student' };
const POPULAR_IDS = ['australia','usa','japan','china','canada'];

// Symbolic icons for each country (landmark / cultural symbol)
const COUNTRY_SYMBOLS = {
  australia: { icon: '🦘', cls: 'sym--au', label: '캥거루' },
  usa:       { icon: '🗽', cls: 'sym--us', label: '자유의 여신상' },
  japan:     { icon: '🗼', cls: 'sym--jp', label: '도쿄타워' },
  china:     { icon: '🐉', cls: 'sym--cn', label: '용' },
  canada:    { icon: '🍁', cls: 'sym--ca', label: '단풍잎' },
  newzealand:{ icon: '🥝', cls: 'sym--nz', label: '키위' },
  germany:   { icon: '🏰', cls: 'sym--de', label: '성' },
  uk:        { icon: '🎡', cls: 'sym--gb', label: '런던아이' },
  ireland:   { icon: '🍀', cls: 'sym--ie', label: '클로버' },
  singapore: { icon: '🦁', cls: 'sym--sg', label: '멀라이언' },
  france:    { icon: '🗼', cls: 'sym--fr', label: '에펠탑' },
};

const COUNTRIES = [
  { id:'australia', flag:'🇦🇺', flagBg:'#00205B', name:'호주', nameEn:'Australia', region:'oceania', popular:true, capital:'캔버라', currency:'AUD', language:'영어', visaTypes:['wh','work','pr'], popularity:98,
    visas:[
      { name:'워킹홀리데이 (서브클래스 417)', status:'active', type:'wh', desc:'18~35세 한국 국적자 신청 가능. 오픈워크퍼밋. 지역 지정 사업장 취업 시 2·3차 비자 연장.', age:'18~35세', duration:'최대 3년', fee:'AUD 635', processing:'2~4주',
        reqs:[{icon:'🎂',text:'<strong>연령:</strong> 18세 이상 35세 이하'},{icon:'💰',text:'<strong>잔액증명:</strong> AUD 5,000 이상'},{icon:'🏥',text:'<strong>의료보험:</strong> OSHC 또는 여행자보험'},{icon:'📋',text:'<strong>범죄경력:</strong> 무범죄 증명서'}],
        warning:'1회만 신청 가능. 지역 농장·수산업·광업 88일 이상 근무 시 2차 비자 자격. 공식: immi.homeaffairs.gov.au' },
      { name:'임시 기술 취업비자 (482)', status:'active', type:'work', desc:'고용주 스폰서 기술 취업비자. 직종이 SOL·MLTSSL에 포함되어야 함.', age:'제한 없음', duration:'2~4년', fee:'AUD 3,115~', processing:'1~4개월',
        reqs:[{icon:'🏢',text:'<strong>스폰서:</strong> 인증 고용주(SMSF) 필요'},{icon:'📜',text:'<strong>기술 심사:</strong> 직종별 인증기관'},{icon:'🗣️',text:'<strong>영어:</strong> IELTS 5.0 이상'}],
        warning:'MLTSSL 직종은 186 영주비자 연계 가능.' },
      { name:'고용주 후원 영주비자 (186)', status:'active', type:'pr', desc:'고용주 후원 ENS 영주비자. Direct Entry 및 Transition 스트림.', age:'45세 미만', duration:'영구', fee:'AUD 4,640', processing:'6~12개월+',
        reqs:[{icon:'🏢',text:'<strong>고용주 후원</strong>'},{icon:'📜',text:'<strong>기술 심사</strong>'},{icon:'🗣️',text:'<strong>영어:</strong> IELTS 6.0 이상'},{icon:'💼',text:'<strong>경력:</strong> 3년 이상'}],
        warning:'Transition 스트림: 482 비자로 3년 근무 후 신청. 영주권 취득 후 4년 내 귀화 가능.' },
    ]
  },
  { id:'usa', flag:'🇺🇸', flagBg:'#003087', name:'미국', nameEn:'United States', region:'america', popular:true, capital:'워싱턴 D.C.', currency:'USD', language:'영어', visaTypes:['work','pr'], popularity:94,
    visas:[
      { name:'H-1B 전문직 취업비자', status:'limited', type:'work', desc:'학사 이상 전문직 취업비자. 연 1회(4월) 추첨. 연간 쿼터 65,000개.', age:'제한 없음', duration:'3년 (최대 6년)', fee:'USD 730~2,460', processing:'3~6개월',
        reqs:[{icon:'🎓',text:'<strong>학력:</strong> 학사 이상'},{icon:'🏢',text:'<strong>스폰서:</strong> 미국 내 고용주 필수'},{icon:'🎲',text:'<strong>추첨:</strong> 연 1회 CAP 추첨'}],
        warning:'추첨제로 선발 보장 없음. 공식: uscis.gov' },
      { name:'O-1 특기자 비자', status:'active', type:'work', desc:'비범한 능력 인정자. 추첨 없이 신청 가능. H-1B 탈락자에게 대안.', age:'제한 없음', duration:'최대 3년', fee:'USD 730', processing:'1~3개월',
        reqs:[{icon:'🏆',text:'<strong>능력 입증:</strong> 수상, 저명한 역할, 고임금 등'},{icon:'🏢',text:'<strong>스폰서:</strong> 고용주 또는 에이전트'}],
        warning:'이민 변호사와 함께 준비 권장.' },
      { name:'취업이민 영주권 (EB-2/EB-3)', status:'limited', type:'pr', desc:'취업 기반 영주권. 한국 국적자 대기기간 짧은 편.', age:'제한 없음', duration:'영구', fee:'USD 1,440~', processing:'1~3년+',
        reqs:[{icon:'🏢',text:'<strong>고용주 후원:</strong> PERM 노동인증'},{icon:'🎓',text:'<strong>학력:</strong> EB-2 석사 이상 / EB-3 학사 이상'}],
        warning:'Visa Bulletin 우선순위 날짜 확인 필수.' },
    ]
  },
  { id:'japan', flag:'🇯🇵', flagBg:'#bc002d', name:'일본', nameEn:'Japan', region:'asia', popular:true, capital:'도쿄', currency:'JPY', language:'일본어', visaTypes:['wh','work','pr'], popularity:91,
    visas:[
      { name:'워킹홀리데이 비자', status:'limited', type:'wh', desc:'18~30세 한국인 대상, 연간 10,000명 한도(선착순). 1년 체류.', age:'18~30세', duration:'1년 (최대 2년)', fee:'무료', processing:'2~4주',
        reqs:[{icon:'🎂',text:'<strong>연령:</strong> 18~30세'},{icon:'💰',text:'<strong>잔액:</strong> 약 25만엔'},{icon:'📋',text:'<strong>범죄경력:</strong> 무범죄 증명서'}],
        warning:'매년 4월 1일 선착순. 발행 후 3개월 내 입국.' },
      { name:'고도전문직 비자 (포인트제)', status:'active', type:'work', desc:'학력·경력·연봉 포인트 70점 이상 취득. 재류기간 5년. 영주권 가속화.', age:'제한 없음', duration:'5년 (갱신)', fee:'무료', processing:'1~3개월',
        reqs:[{icon:'🏆',text:'<strong>포인트:</strong> 70점 이상'},{icon:'🏢',text:'<strong>고용주:</strong> 일본 내 내정 필요'},{icon:'💴',text:'<strong>연봉:</strong> 통상 300만엔+'}],
        warning:'3년 이상 취업 시 영주권(고도전문직 2호) 신청 가능. 포인트 계산기: moj.go.jp' },
      { name:'엔지니어·인문지식·국제업무 비자', status:'active', type:'work', desc:'일본 가장 일반적인 취업비자. IT·기술직, 통역·번역, 해외영업 등.', age:'제한 없음', duration:'1~5년 (갱신)', fee:'약 3,000~6,000엔', processing:'1~3개월',
        reqs:[{icon:'🎓',text:'<strong>학력:</strong> 대졸 이상 또는 실무 10년+'},{icon:'🏢',text:'<strong>COE:</strong> 고용주의 재류자격인정증명서 신청'}],
        warning:'자격외활동허가 시 주 28시간 내 아르바이트 가능.' },
    ]
  },
  { id:'china', flag:'🇨🇳', flagBg:'#de2910', name:'중국', nameEn:'China', region:'asia', popular:true, capital:'베이징', currency:'CNY', language:'중국어', visaTypes:['work','student'], popularity:82,
    visas:[
      { name:'Z 비자 (취업비자)', status:'active', type:'work', desc:'고용주가 인력자원사회보장부를 통해 취업허가증 발급. 입국 후 거류증 신청 필수.', age:'통상 18~60세', duration:'1~2년', fee:'USD 140 내외', processing:'2~8주',
        reqs:[{icon:'📜',text:'<strong>취업허가서:</strong> 고용주가 발급'},{icon:'🎓',text:'<strong>학력:</strong> 학사 이상 + 2년 경력'},{icon:'📋',text:'<strong>범죄경력:</strong> 아포스티유 공증'}],
        warning:'입국 후 15일 내 거류증 신청 필수.' },
      { name:'X1 학생비자 (장기)', status:'active', type:'student', desc:'6개월 초과 학위 과정. 입학허가서와 JW202 또는 JW201 양식 필요.', age:'제한 없음', duration:'재학 기간', fee:'USD 140 내외', processing:'2~4주',
        reqs:[{icon:'🎓',text:'<strong>입학허가서:</strong> 교육부 인가 대학 발급'},{icon:'📋',text:'<strong>JW양식:</strong> JW202 또는 JW201'}],
        warning:'입학 후 30일 내 거류증 신청. 장학금: csc.edu.cn' },
    ]
  },
  { id:'canada', flag:'🇨🇦', flagBg:'#d52b1e', name:'캐나다', nameEn:'Canada', region:'america', popular:true, capital:'오타와', currency:'CAD', language:'영어·프랑스어', visaTypes:['wh','work','pr'], popularity:89,
    visas:[
      { name:'IEC 워킹홀리데이', status:'limited', type:'wh', desc:'18~35세 대상. 오픈워크퍼밋 1년. 연간 쿼터 내 추첨(Pool)으로 선발.', age:'18~35세', duration:'1년', fee:'CAD 256', processing:'4~8주',
        reqs:[{icon:'🎲',text:'<strong>풀 등록:</strong> IRCC 사이트 Pool 등록 후 추첨'},{icon:'💰',text:'<strong>잔액:</strong> CAD 2,500 이상'}],
        warning:'공식: canada.ca/iec' },
      { name:'Express Entry (연방 기술이민)', status:'active', type:'pr', desc:'CRS 점수 기반 추첨. FSW·FST·CEC 세 가지 프로그램.', age:'제한 없음', duration:'영구', fee:'CAD 1,365', processing:'6개월 내',
        reqs:[{icon:'🗣️',text:'<strong>영어:</strong> IELTS CLB 7 이상 권장'},{icon:'💼',text:'<strong>경력:</strong> NOC 0/A/B급 1년 이상'},{icon:'🎓',text:'<strong>학력:</strong> ECA 해외학력 인증'}],
        warning:'PNP 노미니 획득 시 CRS +600점 보너스.' },
    ]
  },
  { id:'newzealand', flag:'🇳🇿', flagBg:'#00247d', name:'뉴질랜드', nameEn:'New Zealand', region:'oceania', popular:false, capital:'웰링턴', currency:'NZD', language:'영어', visaTypes:['wh','work'], popularity:78,
    visas:[
      { name:'워킹홀리데이 비자', status:'active', type:'wh', desc:'18~30세 대상, 23개월 체류. 동일 고용주 최대 12개월 근무.', age:'18~30세', duration:'23개월', fee:'NZD 210', processing:'1~2주',
        reqs:[{icon:'🎂',text:'<strong>연령:</strong> 18~30세'},{icon:'💰',text:'<strong>잔액:</strong> NZD 4,200 이상'}],
        warning:'공식: immigration.govt.nz' },
    ]
  },
  { id:'germany', flag:'🇩🇪', flagBg:'#1a1a1a', name:'독일', nameEn:'Germany', region:'europe', popular:false, capital:'베를린', currency:'EUR', language:'독일어', visaTypes:['work','student'], popularity:74,
    visas:[
      { name:'구직자 비자 (Jobseeker Visa)', status:'active', type:'work', desc:'독일 내 구직 활동. 학사 이상 학위 소지자. 최대 6개월.', age:'제한 없음', duration:'최대 6개월', fee:'EUR 75', processing:'4~12주',
        reqs:[{icon:'🎓',text:'<strong>학위 인증:</strong> anabin DB 확인'},{icon:'💰',text:'<strong>재정:</strong> 월 934유로 이상'}],
        warning:'취업 성공 시 취업비자로 전환 가능.' },
      { name:'숙련직 취업비자 (Skilled Worker)', status:'active', type:'work', desc:'2024년 개정 이민법으로 요건 완화. 고용주와 근로계약 체결 후 신청.', age:'제한 없음', duration:'최대 4년', fee:'EUR 75', processing:'1~3개월',
        reqs:[{icon:'📜',text:'<strong>고용계약:</strong> 독일 고용주 서명 계약서'},{icon:'🎓',text:'<strong>학력/자격:</strong> 독일 인정 학위'}],
        warning:'학위 없이도 5년 경력+EUR 43,992 이상 연봉으로 신청 가능 (Experience Card).' },
    ]
  },
  { id:'uk', flag:'🇬🇧', flagBg:'#012169', name:'영국', nameEn:'United Kingdom', region:'europe', popular:false, capital:'런던', currency:'GBP', language:'영어', visaTypes:['work','student'], popularity:72,
    visas:[
      { name:'스킬드 워커 비자', status:'active', type:'work', desc:'허가 스폰서 고용주가 필요한 포인트 기반 취업비자.', age:'제한 없음', duration:'최대 5년', fee:'GBP 719~1,420', processing:'3주 (온라인)',
        reqs:[{icon:'🏢',text:'<strong>스폰서:</strong> Licensed Sponsor 고용주'},{icon:'🗣️',text:'<strong>영어:</strong> IELTS B1 이상'},{icon:'💷',text:'<strong>연봉:</strong> 최소 GBP 26,200'}],
        warning:'5년 거주 후 영주권(ILR) 신청 가능.' },
    ]
  },
  { id:'ireland', flag:'🇮🇪', flagBg:'#169b62', name:'아일랜드', nameEn:'Ireland', region:'europe', popular:false, capital:'더블린', currency:'EUR', language:'영어', visaTypes:['wh','work'], popularity:66,
    visas:[
      { name:'워킹홀리데이 비자', status:'active', type:'wh', desc:'18~30세 한국인. 12개월 체류. 한국-아일랜드 양국 협정 기반.', age:'18~30세', duration:'12개월', fee:'EUR 100', processing:'4~8주',
        reqs:[{icon:'🎂',text:'<strong>연령:</strong> 18~30세'},{icon:'💰',text:'<strong>잔액:</strong> EUR 3,000 이상'}],
        warning:'공식: irishimmigration.ie. 연간 한도 있음.' },
    ]
  },
  { id:'singapore', flag:'🇸🇬', flagBg:'#ef3340', name:'싱가포르', nameEn:'Singapore', region:'asia', popular:false, capital:'싱가포르', currency:'SGD', language:'영어', visaTypes:['work','pr'], popularity:70,
    visas:[
      { name:'Employment Pass (EP)', status:'active', type:'work', desc:'전문직·관리직 취업비자. 월 SGD 5,000+ (IT직 SGD 5,500+). COMPASS 점수제.', age:'제한 없음', duration:'최대 2년', fee:'SGD 105+225', processing:'3~8주',
        reqs:[{icon:'💶',text:'<strong>최저 임금:</strong> SGD 5,000~5,500+ (분야별)'},{icon:'📊',text:'<strong>COMPASS:</strong> 40점 이상'}],
        warning:'공식: mom.gov.sg' },
    ]
  },
  { id:'france', flag:'🇫🇷', flagBg:'#002395', name:'프랑스', nameEn:'France', region:'europe', popular:false, capital:'파리', currency:'EUR', language:'프랑스어', visaTypes:['wh','work','student'], popularity:64,
    visas:[
      { name:'워킹홀리데이 비자 (PVT)', status:'active', type:'wh', desc:'18~30세 대상, 최대 2년. 한국-프랑스 청년 교류 협약 기반.', age:'18~30세', duration:'최대 2년', fee:'EUR 50', processing:'2~6주',
        reqs:[{icon:'🎂',text:'<strong>연령:</strong> 18~30세'},{icon:'💰',text:'<strong>잔액:</strong> EUR 2,500 이상'}],
        warning:'공식: france-visas.gouv.fr' },
    ]
  },
];

// ===================== RENDER HELPERS =====================
function renderCountryCard(c) {
  const sym = COUNTRY_SYMBOLS[c.id] || { icon: c.flag, cls: '', label: '' };
  const badges = c.visaTypes.slice(0,2).map(v =>
    `<span class="country-card__badge ${VTC[v]||''}">${VL[v]||v}</span>`
  ).join('');
  return `
  <div class="country-card" onclick="openDetail('${c.id}')">
    <div class="country-card__flag">${c.flag}</div>
    <div class="country-card__symbol ${sym.cls}" title="${sym.label}">${sym.icon}</div>
    <div class="country-card__name">${c.name}</div>
    <div class="country-card__visa-wrap">${badges}</div>
  </div>`;
}

function renderRankItem(c, i) {
  const rc = i===1?'ranking-item__rank--gold':i===2?'ranking-item__rank--silver':i===3?'ranking-item__rank--bronze':'';
  const tags = c.visaTypes.map(v=>`<span class="tag-badge ${VTC[v]||''}">${VL[v]||v}</span>`).join('');
  return `<div class="ranking-item" onclick="openDetail('${c.id}')">
    <div class="ranking-item__rank ${rc}">${i}</div>
    <div class="ranking-item__flag">${c.flag}</div>
    <div class="ranking-item__info">
      <div class="ranking-item__header"><div class="ranking-item__name">${c.name}</div><div class="ranking-item__score">${c.popularity}점</div></div>
      <div class="ranking-item__bar-bg"><div class="ranking-item__bar-fill" style="width:${c.popularity}%"></div></div>
      <div class="ranking-item__tags">${tags}</div>
    </div>
  </div>`;
}

// ===================== INIT SCREENS =====================
function initHome(list) {
  list = list || COUNTRIES;
  const s = document.getElementById('homeScroll');
  if (s) s.innerHTML = list.filter(c=>c.popular).map(renderCountryCard).join('');
  const r = document.getElementById('homeRanking');
  if (r) r.innerHTML = [...list].sort((a,b)=>b.popularity-a.popularity).slice(0,8).map((c,i)=>renderRankItem(c,i+1)).join('');
}

function initCountry(list) {
  list = list || COUNTRIES;
  const pop = POPULAR_IDS;
  const sp = document.getElementById('cPopular');
  const so = document.getElementById('cOther');
  const sf = document.getElementById('cFull');
  if (sp) sp.innerHTML = list.filter(c=>pop.includes(c.id)).map(renderCountryCard).join('');
  if (so) so.innerHTML = list.filter(c=>!pop.includes(c.id)).map(renderCountryCard).join('');
  if (sf) sf.innerHTML = [...list].sort((a,b)=>b.popularity-a.popularity).map((c,i)=>renderRankItem(c,i+1)).join('');
}

// ===================== FILTERS =====================
function filterHomeVisa(t, el) {
  document.querySelectorAll('#homeFilters .filter-chip').forEach(c=>c.classList.remove('filter-chip--active'));
  el.classList.add('filter-chip--active');
  initHome(t==='all' ? COUNTRIES : COUNTRIES.filter(c=>c.visaTypes.includes(t)));
}
function filterHome(q) {
  const l = q ? COUNTRIES.filter(c=>c.name.includes(q)||c.nameEn.toLowerCase().includes(q.toLowerCase())) : COUNTRIES;
  initHome(l);
}
function filterCountry(q) {
  const l = q ? COUNTRIES.filter(c=>c.name.includes(q)||c.nameEn.toLowerCase().includes(q.toLowerCase())) : COUNTRIES;
  initCountry(l);
}
function filterRegion(r, el) {
  document.querySelectorAll('#countryFilters .filter-chip').forEach(c=>c.classList.remove('filter-chip--active'));
  el.classList.add('filter-chip--active');
  initCountry(r==='all' ? COUNTRIES : COUNTRIES.filter(c=>c.region===r));
}

// ===================== COUNTRY DETAIL =====================
function openDetail(id) {
  const c = COUNTRIES.find(x=>x.id===id); if (!c) return;
  document.getElementById('countryListView').style.display = 'none';
  document.getElementById('countryDetailView').style.display = 'block';
  switchTab('country');
  const grad = `linear-gradient(135deg, ${c.flagBg}ee, ${c.flagBg}88)`;
  const tabs = c.visas.map((v,i)=>
    `<div class="sticky-nav__item${i===0?' sticky-nav__item--active':''}" onclick="dTab(${i},this)">${v.name.split('(')[0].trim().split(' ').slice(0,3).join(' ')}</div>`
  ).join('');
  const panels = c.visas.map((v,i) => {
    const dc = v.type==='wh'?'dot--yellow':v.type==='pr'?'dot--green':v.type==='student'?'dot--mint':'dot--blue';
    const reqs = v.reqs.map(r=>`<div class="req-row"><span class="req-row__icon">${r.icon}</span><span class="req-row__text">${r.text}</span></div>`).join('');
    return `<div class="visa-detail-panel" id="vp${i}" style="${i?'display:none;':''}">
      <div style="padding:16px 24px 0;">
        <div class="visa-item">
          <div class="visa-item__header">
            <div class="visa-item__name"><div class="dot ${dc}"></div>${v.name}</div>
            <span class="visa-item__status ${v.status==='active'?'status--active':'status--limited'}">${v.status==='active'?'운영중':'제한적'}</span>
          </div>
          <p style="margin-top:6px;font-size:13px;color:var(--color-text-sub);line-height:1.5;">${v.desc}</p>
          <div class="visa-item__meta" style="margin-top:14px;">
            <div class="meta-box"><div class="meta-box__label">대상 연령</div><div class="meta-box__value">${v.age}</div></div>
            <div class="meta-box"><div class="meta-box__label">체류 기간</div><div class="meta-box__value">${v.duration}</div></div>
            <div class="meta-box"><div class="meta-box__label">신청 비용</div><div class="meta-box__value">${v.fee}</div></div>
            <div class="meta-box"><div class="meta-box__label">처리 기간</div><div class="meta-box__value">${v.processing}</div></div>
          </div>
          <button class="expand-btn" onclick="toggleR(this,'r${i}')">📋 신청 조건 보기 ▼</button>
          <div class="visa-reqs" id="r${i}">${reqs}<div class="warning-box"><span>⚠️</span><span>${v.warning}</span></div></div>
        </div>
      </div>
    </div>`;
  }).join('');
  const badges = c.visaTypes.map(v=>`<div class="pill">${VL[v]||v}</div>`).join('');
  const sym = COUNTRY_SYMBOLS[c.id] || { icon: c.flag };
  document.getElementById('countryDetailContent').innerHTML = `
    <div class="country-hero" style="background:${grad};">
      <button class="country-hero__back" onclick="closeDetail()">← 국가 목록으로</button>
      <div>
        <div class="country-hero__flag">${c.flag} <span style="font-size:36px;">${sym.icon}</span></div>
        <div class="country-hero__title">${c.name}</div>
        <div class="country-hero__sub">${c.nameEn}</div>
        <div class="country-hero__badges">${badges}</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-card"><div class="info-card__icon">🏙️</div><div class="info-card__label">수도</div><div class="info-card__value">${c.capital}</div></div>
      <div class="info-card"><div class="info-card__icon">💱</div><div class="info-card__label">통화</div><div class="info-card__value">${c.currency}</div></div>
      <div class="info-card info-card--wide"><div class="info-card__icon">🗣️</div><div class="info-card__label">공용어</div><div class="info-card__value" style="font-size:16px;">${c.language}</div></div>
    </div>
    <div style="padding:4px 24px 14px;"><div style="font-size:18px;font-weight:700;color:var(--color-text-main);">비자 종류</div></div>
    <div class="sticky-nav">${tabs}</div>
    ${panels}
    <button class="cta-button" onclick="alert('공식 이민청 사이트로 이동합니다 (준비중)')">🌐 공식 이민청 사이트 바로가기</button>
    <div style="height:16px;"></div>`;
  document.getElementById('screen-country').scrollTop = 0;
}

function closeDetail() {
  document.getElementById('countryListView').style.display = 'block';
  document.getElementById('countryDetailView').style.display = 'none';
  document.getElementById('screen-country').scrollTop = 0;
}

function dTab(idx, el) {
  document.querySelectorAll('.sticky-nav__item').forEach(t=>t.classList.remove('sticky-nav__item--active'));
  if (el) el.classList.add('sticky-nav__item--active');
  document.querySelectorAll('.visa-detail-panel').forEach((p,i)=>p.style.display=i===idx?'block':'none');
}

function toggleR(btn, id) {
  const b = document.getElementById(id); if (!b) return;
  b.classList.toggle('open');
  btn.textContent = b.classList.contains('open') ? '📋 신청 조건 닫기 ▲' : '📋 신청 조건 보기 ▼';
}

// ===================== CHECKLIST =====================
function renderChecklist() {
  const container = document.getElementById('checklistContent');
  if (!container) return;
  const groups = appState.checklist.groups;
  let total = 0, done = 0;
  groups.forEach(g => { g.items.forEach(it => { total++; if (it.status==='checked') done++; }); });
  const pct = total ? Math.round(done/total*100) : 0;
  const circ = 2 * Math.PI * 28;
  const offset = circ - (circ * pct / 100);

  const groupsHTML = groups.map((g, gi) => {
    const gDone = g.items.filter(it=>it.status==='checked').length;
    return `<div class="checklist-group">
      <div class="checklist-group__title">${g.title} (${gDone}/${g.items.length} 완료)</div>
      ${g.items.map((it, ii) => {
        const cls = it.status==='checked'?'check-item--checked':it.status==='partial'?'check-item--partial':'';
        const tagCls = it.tag==='필수'?'tag--required':it.tag==='긴급'?'tag--urgent':'tag--optional';
        return `<div class="check-item ${cls}" onclick="toggleCheckItem(${gi},${ii})">
          <div class="check-item__checkbox"></div>
          <div class="check-item__text-group">
            <div class="check-item__text">${it.text}</div>
            <div class="check-item__sub">${it.sub||''}</div>
          </div>
          <span class="check-item__tag ${tagCls}">${it.tag}</span>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="checklist-header animate-in">
      <h2 style="color:var(--color-text-main);">비자 준비 체크리스트</h2>
      <div class="add-btn">+</div>
    </div>
    <div class="progress-card animate-in">
      <div class="progress-ring">
        <svg class="progress-ring__circle" viewBox="0 0 70 70">
          <circle class="progress-ring__bg" cx="35" cy="35" r="28"/>
          <circle class="progress-ring__fill" cx="35" cy="35" r="28" style="stroke-dashoffset:${offset};"/>
        </svg>
        <div class="progress-ring__text">${pct}%</div>
      </div>
      <div class="progress-info">
        <div class="progress-info__title">${done}/${total}개 완료</div>
        <div class="progress-info__subtitle">${pct===100?'모든 준비 완료! 🎉':`${total-done}개 남았어요!`}</div>
      </div>
    </div>
    ${groupsHTML}
    <div style="height:8px;"></div>`;

  // update mypage stat
  const mpct = document.getElementById('myChecklistPct');
  if (mpct) mpct.textContent = pct + '%';
}

function toggleCheckItem(gi, ii) {
  const item = appState.checklist.groups[gi].items[ii];
  item.status = item.status === 'checked' ? 'unchecked' : 'checked';
  renderChecklist();
}

// ===================== TAB NAV =====================
function switchTab(name) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.tab-bar__item').forEach(t=>t.classList.remove('tab-bar__item--active'));
  const sc = document.getElementById('screen-'+name);
  const tb = document.getElementById('tab-'+name);
  if (sc) { sc.classList.add('active'); sc.closest('.screen-content').scrollTop = 0; }
  if (tb) tb.classList.add('tab-bar__item--active');
  appState.currentScreen = name;
  if (name === 'home') initHome();
  if (name === 'country') initCountry();
  if (name === 'checklist') renderChecklist();
}

// ===================== COMMUNITY TABS =====================
function commTab(t, el) {
  document.querySelectorAll('#commTabs .segment-tabs__item').forEach(x=>x.classList.remove('segment-tabs__item--active'));
  if (el) el.classList.add('segment-tabs__item--active');
  document.getElementById('commPosts').style.display = t==='posts'?'block':'none';
  document.getElementById('commQA').style.display = t==='qa'?'block':'none';
  document.getElementById('commNotice').style.display = t==='notice'?'block':'none';
}
