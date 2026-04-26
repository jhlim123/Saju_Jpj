import { useRef, useEffect, useMemo } from 'react';
import { calculateSewun, calculateWolun, getTenGods, getTwelveStages, getShensha, getElementClass, getElementColor } from '../utils/sajuLogic';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, translateTenGods, translateTwelveStages } from '../utils/translations';
import { determineGyeok, analyzeGyeokSungPae, determineYongshin, analyzeLuckAndGyeok } from '../utils/jpjLogic';

// 성패 배지 색상
const EFFECT_BADGE = {
  '대길(大吉)': { bg: '#1b5e20', color: '#fff', short: '대길' },
  '길(吉)':     { bg: '#0d47a1', color: '#fff', short: '길'   },
  '평(平)':     { bg: '#757575', color: '#fff', short: '평'   },
  '흉(凶)':     { bg: '#b71c1c', color: '#fff', short: '흉'   },
};

const EffectBadge = ({ effect }) => {
  if (!effect) return null;
  const s = EFFECT_BADGE[effect] || EFFECT_BADGE['평(平)'];
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px',
      borderRadius: '6px', fontSize: '0.68rem', fontWeight: '700',
      background: s.bg, color: s.color, marginTop: '2px', letterSpacing: '0.3px'
    }}>{s.short}</span>
  );
};

export default function DaewunSewunDisplay({ sajuData, userInfo, selectedDaewunAge, selectedSewunYear, onSelectSewun }) {
  const { language } = useLanguage();
  const t = translations[language];
  const monthEn = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  const sewunRef = useRef(null);
  const wolunRef = useRef(null);

  useEffect(() => {
    if (sewunRef.current) {
      sewunRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDaewunAge, selectedSewunYear]);

  useEffect(() => {
    if (wolunRef.current) {
      wolunRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedSewunYear]);

  // 자평진전 기반 성패 계산 — hooks는 early return 전에 선언
  const jpjBase = useMemo(() => {
    if (!sajuData?.dayPillarHanja?.[0]) return null;
    try {
      const gyeokInfo = { ...determineGyeok(sajuData), gyeokStatus: '' };
      const sungPae = analyzeGyeokSungPae(sajuData, gyeokInfo);
      gyeokInfo.gyeokStatus = sungPae.status;
      const yongshinInfo = determineYongshin(sajuData, gyeokInfo, sungPae);
      return { gyeokInfo, yongshinInfo };
    } catch { return null; }
  }, [sajuData]);

  const getEffect = (pillar, type) => {
    if (!jpjBase || !pillar || pillar.length < 2) return null;
    try {
      return analyzeLuckAndGyeok(sajuData, jpjBase.gyeokInfo, jpjBase.yongshinInfo, pillar, type);
    } catch { return null; }
  };

  if (!sajuData || !userInfo) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const birthYear = parseInt(userInfo.birthDate.substring(0, 4)) || currentYear;
  
  // 대운이 선택되었을 때 보여줄 세운 리스트의 기준년도
  const sewunStartYear = selectedDaewunAge ? (birthYear + selectedDaewunAge) : (currentYear - 3);
  const sewunList = calculateSewun(sewunStartYear);
  
  // 선택된 세운 연도의 천간 찾기
  const targetSewun = sewunList.find(sw => sw.year === selectedSewunYear) || sewunList[sewunList.length - 1];
  const wolunList = [...calculateWolun(targetSewun?.stem || '甲')].reverse(); 
  
  const dayStem = sajuData.dayPillarHanja?.[0] || '';
  const targetBranch = targetSewun?.branch || '';
  const yearStem = sajuData.yearPillarHanja?.[0] || '';
  const birthYearBranch = sajuData.yearPillarHanja?.[1] || '';

  return (
    <div style={{ padding: '0 5px' }}>
      {/* Sewun Section */}
      <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', margin: '20px 0 15px' }}>
        {t.sewunTitle} ({selectedDaewunAge ? `${selectedDaewunAge}${t.ageSuffix} ${t.daewunTitle}` : (language === 'ko' ? '현재' : 'Current')})
      </div>
      <div className="horizontal-scroll" style={{ paddingBottom: '10px' }}>
        <table className="saju-table" style={{ minWidth: '650px', border: 'none' }}>
          <thead>
            <tr style={{ fontSize: '0.9rem' }}>
              {sewunList.map((sw, i) => {
                const isCurrent = sw.year === currentYear;
                const isSelected = sw.year === selectedSewunYear;
                return (
                  <th key={i} 
                      onClick={() => onSelectSewun(sw.year)}
                      ref={selectedSewunYear === sw.year ? sewunRef : (sw.year === currentYear && !selectedSewunYear ? sewunRef : null)}
                      className={`${isSelected ? 'luck-item-selected' : ''} ${isCurrent ? 'luck-item-current' : ''}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                    {isCurrent ? (
                      <span className="current-luck-tag">{language === 'ko' ? '현재' : 'Now'}</span>
                    ) : isSelected ? (
                      <span className="selected-luck-tag">{language === 'ko' ? '선택' : 'Select'}</span>
                    ) : null}
                    {sw.year}<br/>
                    <EffectBadge effect={getEffect(`${sw.stem}${sw.branch}`, '세운')?.effect} /><br/>
                    <span style={{ color: getElementColor(sw.stem), fontSize: '0.8rem', fontWeight: '700' }}>
                      {getTenGods(dayStem, sw.stem)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {sewunList.map((sw, i) => {
                const isCurrent = sw.year === currentYear;
                const isSelected = sw.year === selectedSewunYear;
                return (
                  <td key={i} 
                      onClick={() => onSelectSewun(sw.year)}
                      className={`${isSelected ? 'luck-item-selected' : ''} ${isCurrent ? 'luck-item-current' : ''}`}
                      style={{ cursor: 'pointer' }}>
                    <div className={`saju-box ${getElementClass(sw.stem)}`}>{sw.stem}</div>
                  </td>
                );
              })}
            </tr>
            <tr>
              {sewunList.map((sw, i) => {
                const isCurrent = sw.year === currentYear;
                const isSelected = sw.year === selectedSewunYear;
                return (
                  <td key={i} 
                      onClick={() => onSelectSewun(sw.year)}
                      className={`${isSelected ? 'luck-item-selected' : ''} ${isCurrent ? 'luck-item-current' : ''}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div className={`saju-box ${getElementClass(sw.branch)}`}>{sw.branch}</div>
                  </td>
                );
              })}
            </tr>
            <tr style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4' }}>
              {sewunList.map((sw, i) => {
                const ss = getShensha(dayStem, sw.stem, sw.branch, birthYearBranch);
                const isCurrent = sw.year === currentYear;
                const isSelected = sw.year === selectedSewunYear;
                return (
                  <td key={i} 
                      onClick={() => onSelectSewun(sw.year)}
                      className={`${isSelected ? 'luck-item-selected' : ''} ${isCurrent ? 'luck-item-current' : ''}`}
                      style={{ paddingTop: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ color: getElementColor(sw.branch), fontWeight: '700' }}>
                      {getTenGods(dayStem, sw.branch)}
                    </span><br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{getTwelveStages(dayStem, sw.branch)}</span><br/>
                    {ss.length > 0 ? ss.map((s, idx) => <div key={idx} style={{fontSize: '0.75rem', color: '#6366f1'}}>{s}</div>) : '-'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <hr style={{ margin: '30px 20px', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      {/* Wolun Section */}
      <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', margin: '20px 0 15px' }}>
        {language === 'ko' ? `${selectedSewunYear}년 월운` : `${selectedSewunYear} ${t.wolunTitle}`}
      </div>
      <div className="horizontal-scroll" style={{ paddingBottom: '10px' }}>
        <table className="saju-table" style={{ minWidth: '950px', border: 'none' }}>
          <thead>
            <tr style={{ fontSize: '0.85rem' }}>
              {wolunList.map((ww, i) => {
                const isCurrent = selectedSewunYear === currentYear && ww.month === currentMonth;
                return (
                  <th key={i} ref={isCurrent ? wolunRef : null}
                      className={isCurrent ? 'luck-item-current' : ''}>
                    {isCurrent && <span className="current-luck-tag">{language === 'ko' ? '현재' : 'Now'}</span>}
                    {language === 'ko' ? `${ww.month}월(${ww.jeolgi})` : `${monthEn[ww.month]}(${ww.jeolgi})`}<br/>
                    <EffectBadge effect={getEffect(`${ww.stem}${ww.branch}`, '절운')?.effect} /><br/>
                    <span style={{ color: getElementColor(ww.stem), fontSize: '0.8rem', fontWeight: '700' }}>
                      {getTenGods(dayStem, ww.stem)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {wolunList.map((ww, i) => {
                const isCurrent = selectedSewunYear === currentYear && ww.month === currentMonth;
                return (
                  <td key={i} className={isCurrent ? 'luck-item-current' : ''}>
                    <div className={`saju-box ${getElementClass(ww.stem)}`}>{ww.stem}</div>
                  </td>
                );
              })}
            </tr>
            <tr>
              {wolunList.map((ww, i) => {
                const isCurrent = selectedSewunYear === currentYear && ww.month === currentMonth;
                return (
                  <td key={i} className={isCurrent ? 'luck-item-current' : ''}>
                    <div className={`saju-box ${getElementClass(ww.branch)}`}>{ww.branch}</div>
                  </td>
                );
              })}
            </tr>
            <tr style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.4' }}>
              {wolunList.map((ww, i) => {
                const ss = getShensha(dayStem, ww.stem, ww.branch, birthYearBranch);
                const isCurrent = selectedSewunYear === currentYear && ww.month === currentMonth;
                return (
                  <td key={i} style={{ paddingTop: '8px' }} className={isCurrent ? 'luck-item-current' : ''}>
                    <span style={{ color: getElementColor(ww.branch), fontWeight: '700' }}>
                      {getTenGods(dayStem, ww.branch)}
                    </span><br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{getTwelveStages(dayStem, ww.branch)}</span><br/>
                    {ss.length > 0 ? ss.map((s, idx) => <div key={idx} style={{fontSize: '0.7rem', color: '#6366f1'}}>{s}</div>) : '-'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
