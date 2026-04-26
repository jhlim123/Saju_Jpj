// ================================================================
// 자평진전(子平真詮) 핵심 명리학 로직
// 장간 투출 격국 판단 · 성패(成敗) 분석 · 용신/희신/기신 파악
// 행운(대운/세운)과 격국 관계 분석
// ================================================================
import { getTenGods } from './sajuLogic';

// ===== 천간 기본 정보 =====
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const YANG_STEMS = ['甲','丙','戊','庚','壬'];
const YIN_STEMS  = ['乙','丁','己','辛','癸'];

// 천간의 오행
const STEM_ELEMENT = {
  '甲':'木','乙':'木','丙':'火','丁':'火',
  '戊':'土','己':'土','庚':'金','辛':'金',
  '壬':'水','癸':'水'
};

// 지지의 오행
const BRANCH_ELEMENT = {
  '子':'水','丑':'土','寅':'木','卯':'木',
  '辰':'土','巳':'火','午':'火','未':'土',
  '申':'金','酉':'金','戌':'土','亥':'水'
};

// ===== 장간(藏干) 테이블 =====
// 각 지지별 [정기, 중기, 여기] — 자평진전 기준
export const HIDDEN_STEMS = {
  '子': [{ stem: '癸', type: '정기', ratio: 100 }],
  '丑': [{ stem: '己', type: '정기', ratio: 60 }, { stem: '癸', type: '중기', ratio: 20 }, { stem: '辛', type: '여기', ratio: 20 }],
  '寅': [{ stem: '甲', type: '정기', ratio: 60 }, { stem: '丙', type: '중기', ratio: 30 }, { stem: '戊', type: '여기', ratio: 10 }],
  '卯': [{ stem: '乙', type: '정기', ratio: 100 }],
  '辰': [{ stem: '戊', type: '정기', ratio: 60 }, { stem: '乙', type: '중기', ratio: 20 }, { stem: '癸', type: '여기', ratio: 20 }],
  '巳': [{ stem: '丙', type: '정기', ratio: 60 }, { stem: '庚', type: '중기', ratio: 30 }, { stem: '戊', type: '여기', ratio: 10 }],
  '午': [{ stem: '丁', type: '정기', ratio: 70 }, { stem: '己', type: '중기', ratio: 30 }],
  '未': [{ stem: '己', type: '정기', ratio: 60 }, { stem: '丁', type: '중기', ratio: 20 }, { stem: '乙', type: '여기', ratio: 20 }],
  '申': [{ stem: '庚', type: '정기', ratio: 60 }, { stem: '壬', type: '중기', ratio: 30 }, { stem: '戊', type: '여기', ratio: 10 }],
  '酉': [{ stem: '辛', type: '정기', ratio: 100 }],
  '戌': [{ stem: '戊', type: '정기', ratio: 60 }, { stem: '辛', type: '중기', ratio: 20 }, { stem: '丁', type: '여기', ratio: 20 }],
  '亥': [{ stem: '壬', type: '정기', ratio: 70 }, { stem: '甲', type: '중기', ratio: 30 }],
};

// ===== 오행 상생·상극 관계 =====
// 상생: 木→火→土→金→水→木
const GENERATES = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
// 상극: 木→土, 火→金, 土→水, 金→木, 水→火
const CONTROLS  = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
// 역극(내가 극하는 것이 날 극하러 오면): 土→木 등
const CONTROLLED_BY = { '木':'金','火':'水','土':'木','金':'火','水':'土' };

// ===== 천간합(天干合) =====
const STEM_COMBO = {
  '甲': { with:'己', into:'土' },
  '己': { with:'甲', into:'土' },
  '乙': { with:'庚', into:'金' },
  '庚': { with:'乙', into:'金' },
  '丙': { with:'辛', into:'水' },
  '辛': { with:'丙', into:'水' },
  '丁': { with:'壬', into:'木' },
  '壬': { with:'丁', into:'木' },
  '戊': { with:'癸', into:'火' },
  '癸': { with:'戊', into:'火' },
};

// ===== 지지합·충·형·해 =====
const BRANCH_COMBO_3 = [
  { branches:['申','子','辰'], into:'水' },
  { branches:['寅','午','戌'], into:'火' },
  { branches:['巳','酉','丑'], into:'金' },
  { branches:['亥','卯','未'], into:'木' },
];
const BRANCH_COMBO_6 = [
  { b1:'子', b2:'丑', into:'土' },
  { b1:'寅', b2:'亥', into:'木' },
  { b1:'卯', b2:'戌', into:'火' },
  { b1:'辰', b2:'酉', into:'金' },
  { b1:'巳', b2:'申', into:'水' },
  { b1:'午', b2:'未', into:'火' },
];
const BRANCH_CHUNG = [
  ['子','午'],['丑','未'],['寅','申'],
  ['卯','酉'],['辰','戌'],['巳','亥']
];

// ===== 지지 형(刑) =====
const BRANCH_HYUNG = [
  ['寅','巳','申'], // 삼형
  ['丑','戌','未'], // 삼형
  ['子','卯'],      // 이형 (자묘형)
  ['辰','辰'],      // 자형
  ['午','午'],
  ['酉','酉'],
  ['亥','亥'],
];

// ===== 일간 강약(强弱) 판단 =====
/**
 * 일간의 월지 득령(得令) 여부
 * 일간이 월지의 장간에 통근(通根)하면 득령
 */
const getDeLing = (dayStem, monthBranch) => {
  const hidden = HIDDEN_STEMS[monthBranch] || [];
  const dayEl = STEM_ELEMENT[dayStem];
  return hidden.some(h => STEM_ELEMENT[h.stem] === dayEl || h.stem === dayStem);
};

/**
 * 일간에 뿌리(통근)가 있는 지지 목록
 */
const getRoots = (dayStem, branches) => {
  const dayEl = STEM_ELEMENT[dayStem];
  return branches.filter(b => {
    const hidden = HIDDEN_STEMS[b] || [];
    return hidden.some(h => STEM_ELEMENT[h.stem] === dayEl || h.stem === dayStem);
  });
};

/**
 * 일간 강약 판단 (신강/신약)
 * 득령 여부 + 득지(得地) + 득세(得勢) 종합
 */
export const getDayMasterStrength = (sajuData) => {
  const ds = sajuData.dayPillarHanja?.[0];
  const db = sajuData.dayPillarHanja?.[1];
  const yS = sajuData.yearPillarHanja?.[0];
  const yB = sajuData.yearPillarHanja?.[1];
  const mS = sajuData.monthPillarHanja?.[0];
  const mB = sajuData.monthPillarHanja?.[1];
  const hS = sajuData.hourPillarHanja?.[0];
  const hB = sajuData.hourPillarHanja?.[1];
  if (!ds) return { strong: false, score: 0, details: '' };

  const dayEl = STEM_ELEMENT[ds];
  let score = 0;

  // 득령(得令): 월지에 통근 +30
  const deLing = getDeLing(ds, mB);
  if (deLing) score += 30;

  // 비겁·인성이 도와주는 천간 계산
  const allStems = [yS, mS, hS].filter(Boolean);
  allStems.forEach(s => {
    const god = getTenGods(ds, s);
    if (['비견','겁재'].includes(god)) score += 15;
    if (['정인','편인'].includes(god)) score += 10;
    if (['식신','상관'].includes(god)) score -= 8;
    if (['정재','편재'].includes(god)) score -= 8;
    if (['정관','편관'].includes(god)) score -= 10;
  });

  // 지지 통근 계산
  const allBranches = [yB, mB, db, hB].filter(Boolean);
  const roots = getRoots(ds, allBranches);
  score += roots.length * 8;

  const strong = score >= 20;
  const label = score >= 40 ? '신강(强)' : score >= 20 ? '중화(中和)에 가까운 신강' : score >= 0 ? '중화(中和)에 가까운 신약' : '신약(弱)';

  return {
    strong,
    score,
    label,
    deLing,
    roots,
    details: `득령: ${deLing ? '○' : '×'}, 통근 지지: ${roots.length}개, 종합점수: ${score}`
  };
};


// ===== 격국(格局) 판단 =====

/**
 * 월령 장간 투출 분석
 * 월지의 장간이 연간·월간·시간에 투출되어 있는지 확인
 */
export const analyzeMonthlyHidden = (sajuData) => {
  const mB = sajuData.monthPillarHanja?.[1];
  const ds = sajuData.dayPillarHanja?.[0];
  const yS = sajuData.yearPillarHanja?.[0];
  const mS = sajuData.monthPillarHanja?.[0];
  const hS = sajuData.hourPillarHanja?.[0];

  const hidden = HIDDEN_STEMS[mB] || [];
  const heavenlyStems = [yS, mS, hS].filter(Boolean);

  const results = hidden.map(h => {
    const isTransparent = heavenlyStems.includes(h.stem);
    const transparentPos = isTransparent
      ? (heavenlyStems.indexOf(h.stem) === 0 ? '연간' : heavenlyStems.indexOf(h.stem) === 1 ? '월간' : '시간')
      : null;
    const god = h.stem !== ds ? getTenGods(ds, h.stem) : '비견(일간)';
    return { ...h, isTransparent, transparentPos, god };
  });

  return { monthBranch: mB, hidden: results };
};

/**
 * 내격(內格) 8격 판단
 * 자평진전 기준: 월지 장간 투출 우선, 정기→중기→여기 순
 */
const getInnerGyeok = (sajuData) => {
  const ds = sajuData.dayPillarHanja?.[0];
  const mB = sajuData.monthPillarHanja?.[1];
  const yS = sajuData.yearPillarHanja?.[0];
  const mS = sajuData.monthPillarHanja?.[0];
  const hS = sajuData.hourPillarHanja?.[0];
  const heavenlyStems = [yS, mS, hS].filter(Boolean);

  const hidden = HIDDEN_STEMS[mB] || [];

  // 월지 정기의 십성이 비겁이면 건록격·양인격
  const junggi = hidden.find(h => h.type === '정기');
  if (junggi) {
    const god = getTenGods(ds, junggi.stem);
    if (god === '비견') {
      return { gyeok: '건록격', gyeokStem: junggi.stem, type: 'inner', god: '비견', source: '정기', memo: '월지 정기가 일간과 같아 건록격이 성립합니다.' };
    }
    if (god === '겁재') {
      // 양인격: 양간 + 겁재
      if (YANG_STEMS.includes(ds)) {
        return { gyeok: '양인격', gyeokStem: junggi.stem, type: 'inner', god: '겁재', source: '정기', memo: '양간 일주의 월지 정기가 겁재로 양인격이 성립합니다.' };
      } else {
        return { gyeok: '월겁격', gyeokStem: junggi.stem, type: 'inner', god: '겁재', source: '정기', memo: '월지 정기가 겁재로 월겁격이 성립합니다.' };
      }
    }
  }

  // 투출된 장간 중 격국이 되는 것을 정기→중기→여기 순으로 탐색
  for (const h of hidden) {
    if (h.stem === ds) continue; // 일간 자신은 격국 천간 아님
    if (heavenlyStems.includes(h.stem)) {
      const god = getTenGods(ds, h.stem);
      if (!god) continue;
      return {
        gyeok: god + '격',
        gyeokStem: h.stem,
        type: 'inner',
        god,
        source: h.type,
        memo: `월지 ${mB}의 ${h.type} ${h.stem}(${god})이 천간에 투출하여 ${god}격이 성립합니다.`
      };
    }
  }

  // 투출 없으면 월지 정기의 십성으로 격국 결정 (취용)
  if (junggi && junggi.stem !== ds) {
    const god = getTenGods(ds, junggi.stem);
    if (god) {
      return {
        gyeok: god + '격',
        gyeokStem: junggi.stem,
        type: 'inner',
        god,
        source: '정기(미투출)',
        memo: `월지 ${mB}의 정기 ${junggi.stem}(${god})이 천간에 투출하지 않았으나, 정기 취용으로 ${god}격을 취합니다.`
      };
    }
  }

  return { gyeok: '잡격', type: 'inner', god: '', source: '', memo: '격국 성립이 불분명한 잡격입니다.' };
};

/**
 * 외격(外格) 판단
 * 종격(從格) · 전왕격(專旺格) · 화격(化格)
 */
const getOuterGyeok = (sajuData, dmStrength) => {
  const ds = sajuData.dayPillarHanja?.[0];
  const db = sajuData.dayPillarHanja?.[1];
  const yS = sajuData.yearPillarHanja?.[0];
  const yB = sajuData.yearPillarHanja?.[1];
  const mS = sajuData.monthPillarHanja?.[0];
  const mB = sajuData.monthPillarHanja?.[1];
  const hS = sajuData.hourPillarHanja?.[0];
  const hB = sajuData.hourPillarHanja?.[1];

  const allStems = [yS, mS, hS].filter(Boolean);
  const allBranches = [yB, mB, db, hB].filter(Boolean);
  const dayEl = STEM_ELEMENT[ds];

  // 오행 분포 계산
  const elCount = { '木':0,'火':0,'土':0,'金':0,'水':0 };
  [...allStems, ds].forEach(s => { if (STEM_ELEMENT[s]) elCount[STEM_ELEMENT[s]]++; });
  [...allBranches].forEach(b => {
    (HIDDEN_STEMS[b] || []).forEach(h => {
      const el = STEM_ELEMENT[h.stem];
      if (el) elCount[el] += h.ratio / 100;
    });
  });

  const totalScore = Object.values(elCount).reduce((a,b)=>a+b,0);

  // 전왕격 판단: 일간 오행이 압도적(70% 이상)
  if (elCount[dayEl] / totalScore >= 0.65) {
    const wanggyeokMap = {
      '木': '곡직격(曲直格)', '火': '염상격(炎上格)',
      '土': '가색격(稼穡格)', '金': '종혁격(從革格)', '水': '윤하격(潤下格)'
    };
    return {
      gyeok: wanggyeokMap[dayEl] || '전왕격',
      type: 'outer',
      god: '',
      memo: `일간 ${ds}의 오행 ${dayEl}이 사주 전체에 압도적으로 강하여 ${wanggyeokMap[dayEl]}이 성립합니다. 일간과 같은 오행을 돕는 용신이 필요합니다.`
    };
  }

  // 종격 판단: 일간이 극약하고 사주 전체가 한 오행으로 치우침
  if (!dmStrength.strong && dmStrength.score < 0) {
    // 어느 오행이 지배적인지 찾기
    const sorted = Object.entries(elCount).sort((a,b)=>b[1]-a[1]);
    const dominant = sorted[0];
    if (dominant[1] / totalScore >= 0.60 && dominant[0] !== dayEl) {
      const godMap = {
        '식신':'종아격(從兒格)', '상관':'종아격(從兒格)',
        '정재':'종재격(從財格)', '편재':'종재격(從財格)',
        '정관':'종살격(從殺格)', '편관':'종살격(從殺格)',
      };
      const dominantEl = dominant[0];
      // 지배적 오행과 일간의 관계
      const testStems = { '木':'甲','火':'丙','土':'戊','金':'庚','水':'壬' };
      const god = getTenGods(ds, testStems[dominantEl]);
      const gyeok = godMap[god] || '종격';
      return {
        gyeok,
        type: 'outer',
        god,
        memo: `일간이 극약하고 ${dominantEl} 기운이 사주를 지배하여 ${gyeok}이 성립합니다. 일간을 돕는 운을 꺼리고 종하는 오행의 운을 반깁니다.`
      };
    }
  }

  // 화격(化格): 일간이 인접 천간과 합화
  const mStem = mS;
  if (STEM_COMBO[ds] && STEM_COMBO[ds].with === mStem) {
    const intoEl = STEM_COMBO[ds].into;
    // 화격 성립 조건: 월지가 화하는 오행의 기운
    const mBEl = BRANCH_ELEMENT[mB];
    if (mBEl === intoEl) {
      return {
        gyeok: `화${intoEl}격(化${intoEl}格)`,
        type: 'outer',
        god: '',
        memo: `일간 ${ds}과 월간 ${mStem}이 합하여 ${intoEl}으로 화하는 화격이 성립합니다.`
      };
    }
  }

  return null;
};

/**
 * 격국 최종 판단
 * 외격 우선 검토 → 없으면 내격
 */
export const determineGyeok = (sajuData) => {
  const dmStrength = getDayMasterStrength(sajuData);

  // 일간이 극약할 때 외격 먼저 검토
  if (!dmStrength.strong || dmStrength.score < -10) {
    const outer = getOuterGyeok(sajuData, dmStrength);
    if (outer) return { ...outer, dmStrength };
  }

  // 내격 판단
  const inner = getInnerGyeok(sajuData);

  // 내격이 잡격이면 외격도 한번 더 체크
  if (inner.gyeok === '잡격') {
    const outer = getOuterGyeok(sajuData, dmStrength);
    if (outer) return { ...outer, dmStrength };
  }

  return { ...inner, dmStrength };
};


// ===== 격국 성패(成敗) 분석 =====

/**
 * 격국별 성격(成格) 조건과 패격(敗格) 조건 정의
 * 자평진전 기준
 */
const GYEOK_CONDITIONS = {
  '정관격': {
    sung: [
      { god: '정재', desc: '재성이 관을 생하여 재생관(財生官)으로 성격됩니다.' },
      { god: '정인', desc: '인성이 관을 화하여 관인상생(官印相生)으로 성격됩니다.' },
    ],
    pae: [
      { god: '상관', desc: '상관이 관을 극하여 상관견관(傷官見官)으로 패격이 됩니다.' },
      { god: '편관', desc: '편관이 혼잡하여 관살혼잡(官殺混雜)으로 격이 탁해집니다.' },
    ],
    yongshin: '재성(정관을 생하는 재성) 또는 인성(관을 보호하는 인성)',
  },
  '편관격': {
    sung: [
      { god: '식신', desc: '식신이 편관을 제하여 식신제살(食神制殺)로 성격됩니다.' },
      { god: '정인', desc: '인성이 편관을 화하여 인수화살(印綬化殺)로 성격됩니다.' },
      { god: '편인', desc: '편인이 편관을 화하여 편인화살(偏印化殺)로 성격됩니다.' },
    ],
    pae: [
      { god: '재성', desc: '재성이 편관을 생하여 재자약살(財滋弱殺)로 살이 더욱 강해집니다.' },
      { god: '상관', desc: '상관이 편관을 제하나 인성이 있으면 상관이 제거되어 살이 통제 불능이 됩니다.' },
    ],
    yongshin: '식신(제살용) 또는 인성(화살용)',
  },
  '식신격': {
    sung: [
      { god: '편재', desc: '식신이 재를 생하여 식신생재(食神生財)로 성격됩니다.' },
      { god: '정재', desc: '식신이 정재를 생하여 안정적인 재물 흐름으로 성격됩니다.' },
    ],
    pae: [
      { god: '편인', desc: '편인이 식신을 탈기하여 효신탈식(梟神奪食)·도식(倒食)으로 패격됩니다.' },
      { god: '편관', desc: '편관이 있고 식신이 제살하나, 인성이 있어 식신을 제거하면 살이 발동합니다.' },
    ],
    yongshin: '재성(식신생재) — 편인이 없어야 성격이 완전합니다.',
  },
  '상관격': {
    sung: [
      { god: '편재', desc: '상관이 재를 생하여 상관생재(傷官生財)로 성격됩니다.' },
      { god: '정재', desc: '상관이 재를 생하여 상관생재(傷官生財)로 성격됩니다.' },
      { god: '편인', desc: '인성이 상관을 화하여 상관패인(傷官佩印)으로 성격됩니다.' },
      { god: '정인', desc: '인성이 상관을 화하여 상관패인(傷官佩印)으로 성격됩니다.' },
    ],
    pae: [
      { god: '정관', desc: '상관이 관을 극하여 상관견관(傷官見官)으로 패격됩니다.' },
    ],
    yongshin: '재성(상관생재) 또는 인성(상관패인)',
  },
  '정재격': {
    sung: [
      { god: '식신', desc: '식상이 재를 생하여 재기유출(財氣流出)로 성격됩니다.' },
      { god: '상관', desc: '식상이 재를 생하여 재기유출(財氣流出)로 성격됩니다.' },
      { god: '정관', desc: '재가 관을 생하여 재관상생(財官相生)으로 성격됩니다.' },
    ],
    pae: [
      { god: '겁재', desc: '겁재가 재를 극하여 겁재쟁재(劫財爭財)로 패격됩니다.' },
      { god: '비견', desc: '비견이 많으면 재를 나눠가져 패격됩니다.' },
    ],
    yongshin: '식상(재기유출) 또는 관성(재생관)',
  },
  '편재격': {
    sung: [
      { god: '식신', desc: '식상이 편재를 생하여 재기유출(財氣流出)로 성격됩니다.' },
      { god: '상관', desc: '식상이 편재를 생하여 재기유출(財氣流出)로 성격됩니다.' },
      { god: '편관', desc: '편재가 편관을 생하여 재생살격이 되어 권세를 얻습니다.' },
    ],
    pae: [
      { god: '겁재', desc: '겁재가 편재를 극하여 겁재쟁재(劫財爭財)로 패격됩니다.' },
      { god: '비견', desc: '비견이 많으면 편재를 나눠가져 패격됩니다.' },
    ],
    yongshin: '식상(재기유출) — 비겁이 없어야 성격이 완전합니다.',
  },
  '정인격': {
    sung: [
      { god: '정관', desc: '관이 인을 생하여 관인상생(官印相生)으로 성격됩니다.' },
      { god: '편관', desc: '관이 인을 생하여 관인상생(官印相生)으로 성격됩니다.' },
    ],
    pae: [
      { god: '정재', desc: '재성이 인을 극하여 재파인(財破印)으로 패격됩니다.' },
      { god: '편재', desc: '재성이 인을 극하여 재파인(財破印)으로 패격됩니다.' },
      { god: '식신', desc: '식신이 인을 탈기하여 인수의 힘이 소모됩니다.' },
    ],
    yongshin: '관성(관인상생) — 재성이 없어야 성격이 완전합니다.',
  },
  '편인격': {
    sung: [
      { god: '편관', desc: '편관이 편인을 생하여 살인상생(殺印相生)으로 성격됩니다.' },
      { god: '정재', desc: '재성이 편인을 제하여 사주가 균형을 이룹니다.' },
    ],
    pae: [
      { god: '식신', desc: '편인이 식신을 탈기하는 효신탈식(梟神奪食)으로 패격됩니다.' },
      { god: '정재', desc: '재성이 편인을 극하면 편인의 힘이 소진됩니다.' },
    ],
    yongshin: '편관(살인상생) 또는 재성(편인 제어)',
  },
  '건록격': {
    sung: [
      { god: '정관', desc: '관성이 일간을 제어하여 건록용관격(建祿用官格)으로 성격됩니다.' },
      { god: '편관', desc: '식신이 편관을 제하거나 인수가 화하여 성격됩니다.' },
      { god: '정재', desc: '재성이 있어 건록용재격(建祿用財格)으로 성격됩니다.' },
    ],
    pae: [
      { god: '겁재', desc: '겁재가 재성을 극하여 패격됩니다.' },
    ],
    yongshin: '관성(건록용관) 또는 재성(건록용재)',
  },
  '양인격': {
    sung: [
      { god: '편관', desc: '편관이 양인을 제하여 양인가살격(羊刃駕殺格)으로 성격됩니다.' },
      { god: '정관', desc: '정관이 양인을 제하여 양인용관격으로 성격됩니다.' },
    ],
    pae: [
      { god: '정재', desc: '재성이 강하면 양인이 겁재 역할을 하여 재를 극합니다.' },
    ],
    yongshin: '관살(양인 제어)',
  },
  '월겁격': {
    sung: [
      { god: '정관', desc: '관성이 겁재를 제하여 월겁용관격(月劫用官格)으로 성격됩니다.' },
      { god: '정재', desc: '재성이 있고 식상이 재를 생하면 성격됩니다.' },
    ],
    pae: [
      { god: '편재', desc: '편재가 있고 겁재가 극하면 패격됩니다.' },
    ],
    yongshin: '관성 또는 식상',
  },
};

/**
 * 격국 성패 분석
 */
export const analyzeGyeokSungPae = (sajuData, gyeokInfo) => {
  const ds = sajuData.dayPillarHanja?.[0];
  const yS = sajuData.yearPillarHanja?.[0];
  const yB = sajuData.yearPillarHanja?.[1];
  const mS = sajuData.monthPillarHanja?.[0];
  const mB = sajuData.monthPillarHanja?.[1];
  const hS = sajuData.hourPillarHanja?.[0];
  const hB = sajuData.hourPillarHanja?.[1];
  const db = sajuData.dayPillarHanja?.[1];

  const gyeokName = gyeokInfo.gyeok?.replace('격', '') + '격';
  const conditions = GYEOK_CONDITIONS[gyeokName] || GYEOK_CONDITIONS[gyeokInfo.gyeok];

  // 외격이거나 조건 없으면 기본 반환
  if (gyeokInfo.type === 'outer' || !conditions) {
    return {
      status: '외격',
      label: gyeokInfo.type === 'outer' ? '외격 성립' : '판단 불명',
      sungList: [],
      paeList: [],
      yongshin: '',
      summary: gyeokInfo.memo || ''
    };
  }

  const allStems = [yS, mS, hS].filter(Boolean);
  const allBranches = [yB, mB, db, hB].filter(Boolean);

  // 사주 내 모든 글자의 십성 분류
  const gods = new Set();
  allStems.forEach(s => { const g = getTenGods(ds, s); if (g) gods.add(g); });
  allBranches.forEach(b => {
    (HIDDEN_STEMS[b] || []).forEach(h => {
      if (h.stem !== ds) { const g = getTenGods(ds, h.stem); if (g) gods.add(g); }
    });
  });

  // 성격 조건 체크
  const sungList = conditions.sung.filter(c => gods.has(c.god));
  const paeList = conditions.pae.filter(c => gods.has(c.god));

  let status, label;
  if (sungList.length > 0 && paeList.length === 0) {
    status = '성격'; label = '成格 — 격국이 성립하여 귀한 명조입니다.';
  } else if (paeList.length > 0 && sungList.length === 0) {
    status = '패격'; label = '敗格 — 격국이 파괴되어 명조가 탁합니다.';
  } else if (sungList.length > 0 && paeList.length > 0) {
    status = '성패혼재'; label = '成敗混在 — 성격과 패격의 기운이 공존합니다. 행운(대운)의 흐름이 길흉을 결정합니다.';
  } else {
    status = '불명'; label = '格局 不明 — 성격/패격 기준이 불분명한 명조입니다.';
  }

  return { status, label, sungList, paeList, yongshin: conditions.yongshin || '', summary: '' };
};


// ===== 용신(用神) · 희신(喜神) · 기신(忌神) 파악 =====

/**
 * 오행 간의 관계 분류
 */
const getElRelation = (dayEl, targetEl) => {
  if (dayEl === targetEl) return 'same';
  if (GENERATES[dayEl] === targetEl) return 'child';   // 일간이 생하는 것
  if (GENERATES[targetEl] === dayEl) return 'parent';  // 일간을 생하는 것
  if (CONTROLS[dayEl] === targetEl) return 'controls'; // 일간이 극하는 것
  if (CONTROLS[targetEl] === dayEl) return 'controlled'; // 일간을 극하는 것
  return 'neutral';
};

/**
 * 격국 기반 용신·희신·기신·한신·구신 파악
 * 자평진전 기준
 */
export const determineYongshin = (sajuData, gyeokInfo, sungPaeInfo) => {
  const ds = sajuData.dayPillarHanja?.[0];
  if (!ds) return null;

  const dayEl = STEM_ELEMENT[ds];
  const { strong } = gyeokInfo.dmStrength || {};
  const gyeok = gyeokInfo.gyeok;

  // 외격 처리
  if (gyeokInfo.type === 'outer') {
    return getOuterYongshin(gyeokInfo, dayEl);
  }

  // 격국별 용신 기본 방향 (자평진전 기준)
  const yongshinGuide = {
    '정관격': {
      yong: strong ? '정인(관을 생함)' : '정재(관을 생함)',
      hee: strong ? '정재' : '정관',
      gi: '상관(관을 파함)',
      han: '비겁',
      gu: '편관(혼잡)',
      desc: strong ? '신강 정관격은 인성으로 관을 보호하고 식상의 극을 막습니다.' : '신약 정관격은 재성이나 인성이 관을 도와야 성격됩니다.'
    },
    '편관격': {
      yong: '식신(편관을 제함)',
      hee: '인성(편관을 화함)',
      gi: '재성(편관을 도와 살이 더욱 강해짐)',
      han: '상관(식신을 대신하나 불안정)',
      gu: '비겁(재성을 극하여 편관 약화)',
      desc: '편관격은 식신으로 편관을 제하거나 인성으로 화하는 것이 최상의 구조입니다.'
    },
    '식신격': {
      yong: '편재(식신생재로 재물 유통)',
      hee: '정재',
      gi: '편인(식신을 탈기함—효신탈식)',
      han: '정인',
      gu: '편관(식신과 상충)',
      desc: '식신격은 재성으로 흘러 재물을 이루는 것이 이상적입니다. 편인을 가장 꺼립니다.'
    },
    '상관격': {
      yong: strong ? '편재(상관생재)' : '인성(상관패인)',
      hee: strong ? '정재' : '편인',
      gi: '정관(상관이 파함)',
      han: '편관',
      gu: '비겁(상관 혼잡 유발)',
      desc: '상관격은 재성이 있으면 상관생재로 성격되고, 인성이 있으면 상관패인으로 성격됩니다.'
    },
    '정재격': {
      yong: '식신(재기유출)',
      hee: '상관(재 생함), 정관(재생관)',
      gi: '겁재(재를 극함)',
      han: '비견',
      gu: '편관(재생살로 살이 강해짐)',
      desc: '정재격은 식상이 재를 생하거나 관성이 재를 이끌어야 성격됩니다.'
    },
    '편재격': {
      yong: '식신(재기유출)',
      hee: '상관, 편관',
      gi: '겁재(편재를 극함)',
      han: '비견',
      gu: '편인(식상 탈기)',
      desc: '편재격은 식상생재로 흐르거나 관성을 생하여 권위를 얻는 것이 이상적입니다.'
    },
    '정인격': {
      yong: '정관(관인상생)',
      hee: '편관',
      gi: '재성(인을 극함—재파인)',
      han: '식신',
      gu: '상관(인수 탈기)',
      desc: '정인격은 관성이 인을 생하여 관인상생이 되는 것이 이상적입니다. 재성을 매우 꺼립니다.'
    },
    '편인격': {
      yong: '편관(살인상생)',
      hee: '정관',
      gi: '재성(편인을 극함), 식신(편인이 탈기)',
      han: '상관',
      gu: '비겁',
      desc: '편인격은 편관과 함께 살인상생이 되거나 재성으로 편인을 제어하여 균형을 이룹니다.'
    },
    '건록격': {
      yong: strong ? '관성(일간 제어)' : '인성(일간 보조)',
      hee: '재성',
      gi: strong ? '비겁(일간 더욱 강화)' : '식상(일간 설기)',
      han: '편인',
      gu: '상관(관성 극함)',
      desc: '건록격은 관성이나 재성을 용신으로 삼아 성격됩니다.'
    },
    '양인격': {
      yong: '편관(양인 제어—양인가살)',
      hee: '정관',
      gi: '재성(양인이 재를 극함), 인성(양인 도움)',
      han: '식신',
      gu: '상관(관성 극함)',
      desc: '양인격은 관살이 양인을 제어하는 구조가 최상입니다.'
    },
    '월겁격': {
      yong: '관성(겁재 제어)',
      hee: '식상(재를 생함)',
      gi: '비겁(더욱 강해짐)',
      han: '인성(비겁 도움)',
      gu: '재성(겁재가 극함)',
      desc: '월겁격은 관성이 겁재를 제어하거나 식상이 재성을 생하는 구조가 이상적입니다.'
    },
  };

  const guide = yongshinGuide[gyeok];
  if (!guide) {
    return {
      yongshin: '판단 불명', heeishin: '—', gishin: '—',
      hanshin: '—', gushin: '—',
      desc: '격국이 불분명하여 용신을 단정하기 어렵습니다.',
      direction: '전문가의 상세 분석이 필요합니다.'
    };
  }

  // 성패에 따른 보정
  let extraDesc = '';
  if (sungPaeInfo.status === '성격') {
    extraDesc = '현재 명조는 성격(成格)으로 용신이 잘 작동하고 있습니다.';
  } else if (sungPaeInfo.status === '패격') {
    extraDesc = '현재 명조는 패격(敗格)으로 기신이 용신을 방해하고 있습니다. 행운에서 기신을 제어하는 운이 오면 발복합니다.';
  } else if (sungPaeInfo.status === '성패혼재') {
    extraDesc = '성격과 패격이 혼재합니다. 대운에서 패격 요소를 제거하는 운이 오면 크게 발복합니다.';
  }

  return {
    yongshin: guide.yong,
    heeishin: guide.hee,
    gishin: guide.gi,
    hanshin: guide.han,
    gushin: guide.gu,
    desc: guide.desc,
    direction: extraDesc
  };
};

/**
 * 외격 용신
 */
const getOuterYongshin = (gyeokInfo, dayEl) => {
  const gyeok = gyeokInfo.gyeok;
  if (gyeok.includes('종재')) return { yongshin: '재성', heeishin: '식상', gishin: '비겁·인성', hanshin: '관성', gushin: '—', desc: '종재격은 재성 오행의 운이 길합니다.', direction: gyeokInfo.memo };
  if (gyeok.includes('종살')) return { yongshin: '관살', heeishin: '재성', gishin: '비겁·인성', hanshin: '식상', gushin: '—', desc: '종살격은 관살 오행의 운이 길합니다.', direction: gyeokInfo.memo };
  if (gyeok.includes('종아')) return { yongshin: '식상', heeishin: '재성', gishin: '인성·비겁', hanshin: '관살', gushin: '—', desc: '종아격은 식상 오행의 운이 길합니다.', direction: gyeokInfo.memo };
  // 전왕격
  const wangEl = { '곡직':'木', '염상':'火', '가색':'土', '종혁':'金', '윤하':'水' };
  for (const [k, v] of Object.entries(wangEl)) {
    if (gyeok.includes(k)) {
      return { yongshin: `${v} 오행`, heeishin: `${v}를 생하는 오행`, gishin: `${v}를 극하는 오행`, hanshin: '—', gushin: '—', desc: `${gyeok}은 ${v} 오행의 운에서 크게 발복합니다.`, direction: gyeokInfo.memo };
    }
  }
  return { yongshin: '판단 불명', heeishin: '—', gishin: '—', hanshin: '—', gushin: '—', desc: gyeokInfo.memo, direction: '' };
};


// ===== 행운(行運)과 격국 관계 분석 =====

/**
 * 대운/세운이 격국에 미치는 영향 분석
 */
export const analyzeLuckAndGyeok = (sajuData, gyeokInfo, yongshinInfo, luckPillar, luckType = '대운') => {
  const ds = sajuData.dayPillarHanja?.[0];
  if (!ds || !luckPillar) return null;

  const luckStem = luckPillar[0];
  const luckBranch = luckPillar[1];
  const luckStemGod = luckStem ? getTenGods(ds, luckStem) : '';
  const luckBranchGod = luckBranch ? getTenGods(ds, luckBranch) : '';
  const luckEl = STEM_ELEMENT[luckStem] || BRANCH_ELEMENT[luckBranch];

  if (!yongshinInfo) return null;

  // 용신·희신·기신 판별
  const yongshin = yongshinInfo.yongshin || '';
  const gishin = yongshinInfo.gishin || '';
  const heeishin = yongshinInfo.heeishin || '';

  // 행운의 십성이 용신/희신/기신에 해당하는지 분류
  const isYong = yongshin.includes(luckStemGod) || yongshin.includes(luckBranchGod);
  const isHee = heeishin.includes(luckStemGod) || heeishin.includes(luckBranchGod);
  const isGi = gishin.includes(luckStemGod) || gishin.includes(luckBranchGod);

  let effect, effectDesc;
  if (isYong) {
    effect = '대길(大吉)';
    effectDesc = `${luckType} ${luckPillar}(${luckStemGod}·${luckBranchGod}운)이 용신에 해당하여 격국을 강화합니다. 이 시기는 크게 발복하는 운입니다.`;
  } else if (isHee) {
    effect = '길(吉)';
    effectDesc = `${luckType} ${luckPillar}(${luckStemGod}·${luckBranchGod}운)이 희신에 해당하여 격국을 보조합니다. 안정적이고 좋은 운입니다.`;
  } else if (isGi) {
    effect = '흉(凶)';
    effectDesc = `${luckType} ${luckPillar}(${luckStemGod}·${luckBranchGod}운)이 기신에 해당하여 격국을 훼손합니다. 이 시기는 조심이 필요한 운입니다.`;
  } else {
    effect = '평(平)';
    effectDesc = `${luckType} ${luckPillar}(${luckStemGod}·${luckBranchGod}운)은 격국에 직접적인 영향이 크지 않은 중립적 운입니다.`;
  }

  // 성패와 교차 분석
  const gyeokStatus = gyeokInfo.gyeokStatus;
  let additionalDesc = '';
  if (gyeokStatus === '패격' && isGi) {
    additionalDesc = '패격인 명조에 기신운까지 겹쳐 각별한 주의가 필요한 시기입니다.';
  } else if (gyeokStatus === '패격' && isYong) {
    additionalDesc = '패격인 명조이지만 용신운이 들어와 패격 요소를 제어하여 발복의 기회가 됩니다.';
  } else if (gyeokStatus === '성격' && isYong) {
    additionalDesc = '성격(成格)인 명조에 용신운까지 겹쳐 인생 최고의 전성기를 맞이하는 운입니다.';
  }

  return {
    luckPillar,
    luckType,
    luckStemGod,
    luckBranchGod,
    effect,
    effectDesc,
    additionalDesc,
    isYong,
    isHee,
    isGi
  };
};


// ===== 종합 자평진전 분석 =====

/**
 * 자평진전 기준 전체 분석 통합 함수
 */
export const getJpjFullAnalysis = (sajuData, selectedDaewunPillar, selectedSewunPillar) => {
  if (!sajuData?.dayPillarHanja?.[0]) return null;

  try {
    // 1. 일간 강약
    const dmStrength = getDayMasterStrength(sajuData);

    // 2. 월령 장간 분석
    const monthlyHidden = analyzeMonthlyHidden(sajuData);

    // 3. 격국 판단
    const gyeokInfo = { ...determineGyeok(sajuData), gyeokStatus: '' };

    // 4. 격국 성패
    const sungPae = analyzeGyeokSungPae(sajuData, gyeokInfo);
    gyeokInfo.gyeokStatus = sungPae.status;

    // 5. 용신·희신·기신
    const yongshin = determineYongshin(sajuData, gyeokInfo, sungPae);

    // 6. 대운과 격국 관계
    const daewunAnalysis = selectedDaewunPillar
      ? analyzeLuckAndGyeok(sajuData, gyeokInfo, yongshin, selectedDaewunPillar, '대운')
      : null;

    // 7. 세운과 격국 관계
    const sewunAnalysis = selectedSewunPillar
      ? analyzeLuckAndGyeok(sajuData, gyeokInfo, yongshin, selectedSewunPillar, '세운')
      : null;

    return {
      dmStrength,
      monthlyHidden,
      gyeokInfo,
      sungPae,
      yongshin,
      daewunAnalysis,
      sewunAnalysis
    };
  } catch (e) {
    console.error('JPJ 분석 오류:', e);
    return null;
  }
};
