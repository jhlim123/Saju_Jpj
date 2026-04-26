// ================================================================
// 자평진전(子平真詮) 분석 전용 UI 컴포넌트
// 격국 · 성패 · 용신/희신/기신 · 행운과 격국 관계
// ================================================================

const STATUS_COLOR = {
  '성격':   { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20', label: '成格 ✓' },
  '패격':   { bg: '#fce4ec', border: '#f44336', text: '#b71c1c', label: '敗格 ✗' },
  '성패혼재': { bg: '#fff8e1', border: '#ff9800', text: '#e65100', label: '成敗混在 △' },
  '불명':   { bg: '#f5f5f5', border: '#9e9e9e', text: '#424242', label: '不明 —' },
  '외격':   { bg: '#e8eaf6', border: '#3f51b5', text: '#1a237e', label: '外格 ◇' },
};

const EFFECT_COLOR = {
  '대길(大吉)': { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' },
  '길(吉)':     { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' },
  '평(平)':     { bg: '#f5f5f5', border: '#9e9e9e', text: '#424242' },
  '흉(凶)':     { bg: '#fce4ec', border: '#f44336', text: '#b71c1c' },
};

const Card = ({ children, style = {} }) => (
  <div style={{
    padding: '18px', backgroundColor: 'var(--surface-color)',
    borderRadius: '18px', border: '1px solid var(--border-color)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    marginBottom: '14px', ...style
  }}>
    {children}
  </div>
);

const SubTitle = ({ children }) => (
  <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
    {children}
  </div>
);

const Badge = ({ children, color = 'var(--text-primary)', bg = 'var(--bg-color)', border }) => (
  <span style={{
    padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem',
    fontWeight: '600', background: bg, color, display: 'inline-block',
    border: border ? `1px solid ${border}` : '1px solid var(--border-color)'
  }}>
    {children}
  </span>
);

export default function JpjSection({ jpjData }) {
  if (!jpjData) return null;

  const { dmStrength, monthlyHidden, gyeokInfo, sungPae, yongshin, daewunAnalysis, sewunAnalysis } = jpjData;

  const statusStyle = STATUS_COLOR[sungPae?.status] || STATUS_COLOR['불명'];

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* ─── 섹션 헤더 ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '16px', padding: '14px 18px',
        background: 'linear-gradient(135deg, #1a237e, #4a148c)',
        borderRadius: '18px', color: 'white'
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1.15rem', letterSpacing: '0.5px' }}>📖 자평진전(子平真詮) 격국 분석</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '3px' }}>월령 장간 투출 · 격국 성패 · 용신/희신/기신 · 행운 관계</div>
        </div>
      </div>

      {/* ─── ① 일간 강약 ─── */}
      <Card>
        <SubTitle>① 일간(日干) 강약(强弱) 판단</SubTitle>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
          <Badge
            bg={dmStrength?.strong ? '#e8f5e9' : '#fce4ec'}
            color={dmStrength?.strong ? '#1b5e20' : '#b71c1c'}
            border={dmStrength?.strong ? '#4caf50' : '#f44336'}
          >
            {dmStrength?.label || '—'}
          </Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {dmStrength?.details || ''}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'keep-all' }}>
          {dmStrength?.deLing
            ? '월지에서 득령(得令)하여 일간이 뿌리를 내리고 있습니다.'
            : '월지에서 득령(得令)하지 못하여 일간이 상대적으로 약합니다.'}
          {dmStrength?.roots?.length > 0
            ? ` 지지 ${dmStrength.roots.length}곳에 통근(通根)하고 있습니다.`
            : ' 지지에 통근이 부족합니다.'}
        </p>
      </Card>

      {/* ─── ② 월령 장간 투출 분석 ─── */}
      <Card>
        <SubTitle>② 월령(月令) 장간(藏干) 투출(透出) 분석</SubTitle>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          월지 <strong style={{ color: 'var(--text-primary)' }}>{monthlyHidden?.monthBranch}</strong>의 장간:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {monthlyHidden?.hidden?.map((h, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderRadius: '12px',
              background: h.isTransparent ? '#e8f5e9' : 'var(--bg-color)',
              border: h.isTransparent ? '1px solid #4caf50' : '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: '700', fontSize: '1.05rem', minWidth: '22px', color: 'var(--text-primary)' }}>{h.stem}</span>
              <Badge>{h.type}</Badge>
              <Badge>{h.god}</Badge>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>비율 {h.ratio}%</span>
              {h.isTransparent ? (
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: '600', color: '#2e7d32' }}>
                  ✓ {h.transparentPos}에 투출
                </span>
              ) : (
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#9e9e9e' }}>투출 없음</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ─── ③ 격국 판단 ─── */}
      <Card style={{ borderLeft: '5px solid #1a237e' }}>
        <SubTitle>③ 격국(格局) — {gyeokInfo?.gyeok || '—'}</SubTitle>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge bg='#1a237e' color='white' border='#1a237e'>
            {gyeokInfo?.type === 'outer' ? '외격(外格)' : '내격(內格)'}
          </Badge>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {gyeokInfo?.gyeok}
          </span>
          {gyeokInfo?.god && (
            <Badge>{gyeokInfo.god}</Badge>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7', wordBreak: 'keep-all' }}>
          {gyeokInfo?.memo}
        </p>
      </Card>

      {/* ─── ④ 격국 성패 ─── */}
      <Card style={{ borderLeft: `5px solid ${statusStyle.border}` }}>
        <SubTitle>④ 격국 성패(成敗) 분석</SubTitle>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '20px', marginBottom: '12px',
          background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
          color: statusStyle.text, fontWeight: '700', fontSize: '0.9rem'
        }}>
          {statusStyle.label} — {sungPae?.status}
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'keep-all' }}>
          {sungPae?.label}
        </p>

        {/* 성격 요인 */}
        {sungPae?.sungList?.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#2e7d32', marginBottom: '5px' }}>▶ 성격(成格) 요인</div>
            {sungPae.sungList.map((s, i) => (
              <div key={i} style={{ padding: '8px 12px', background: '#e8f5e9', borderRadius: '10px', marginBottom: '5px', fontSize: '0.88rem', color: '#1b5e20' }}>
                <strong>{s.god}</strong>: {s.desc}
              </div>
            ))}
          </div>
        )}

        {/* 패격 요인 */}
        {sungPae?.paeList?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#b71c1c', marginBottom: '5px' }}>▶ 패격(敗格) 요인</div>
            {sungPae.paeList.map((p, i) => (
              <div key={i} style={{ padding: '8px 12px', background: '#fce4ec', borderRadius: '10px', marginBottom: '5px', fontSize: '0.88rem', color: '#b71c1c' }}>
                <strong>{p.god}</strong>: {p.desc}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── ⑤ 용신·희신·기신 ─── */}
      {yongshin && (
        <Card>
          <SubTitle>⑤ 용신(用神) · 희신(喜神) · 기신(忌神)</SubTitle>
          <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'keep-all' }}>
            {yongshin.desc}
          </p>

          {/* 용신/희신/기신/한신/구신 표 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { label: '용신(用神)', value: yongshin.yongshin, bg: '#e3f2fd', color: '#0d47a1', border: '#2196f3', icon: '★' },
              { label: '희신(喜神)', value: yongshin.heeishin, bg: '#e8f5e9', color: '#1b5e20', border: '#4caf50', icon: '▲' },
              { label: '기신(忌神)', value: yongshin.gishin,   bg: '#fce4ec', color: '#b71c1c', border: '#f44336', icon: '✕' },
              { label: '한신(閑神)', value: yongshin.hanshin,  bg: '#f5f5f5', color: '#424242', border: '#9e9e9e', icon: '—' },
              { label: '구신(仇神)', value: yongshin.gushin,   bg: '#fff3e0', color: '#e65100', border: '#ff9800', icon: '△' },
            ].map((item, i) => (
              item.value && item.value !== '—' && (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '9px 12px', borderRadius: '12px',
                  background: item.bg, border: `1px solid ${item.border}`
                }}>
                  <span style={{ minWidth: '72px', fontWeight: '700', fontSize: '0.85rem', color: item.color, flexShrink: 0 }}>
                    {item.icon} {item.label}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', wordBreak: 'keep-all' }}>
                    {item.value}
                  </span>
                </div>
              )
            ))}
          </div>

          {yongshin.direction && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'keep-all' }}>
              💡 {yongshin.direction}
            </div>
          )}
        </Card>
      )}

      {/* ─── ⑥ 행운(行運)과 격국 관계 ─── */}
      {(daewunAnalysis || sewunAnalysis) && (
        <Card>
          <SubTitle>⑥ 행운(行運)과 격국 관계 — 자평진전 길흉 판단</SubTitle>

          {/* 대운 분석 */}
          {daewunAnalysis && (() => {
            const eff = EFFECT_COLOR[daewunAnalysis.effect] || EFFECT_COLOR['평(平)'];
            return (
              <div style={{ marginBottom: '12px', padding: '14px', borderRadius: '14px', background: eff.bg, border: `1px solid ${eff.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: eff.text }}>대운(大運)</span>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{daewunAnalysis.luckPillar}</span>
                  <Badge bg={eff.bg} color={eff.text} border={eff.border}>{daewunAnalysis.effect}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                  {daewunAnalysis.effectDesc}
                </p>
                {daewunAnalysis.additionalDesc && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.88rem', fontWeight: '600', color: eff.text, lineHeight: '1.5', wordBreak: 'keep-all' }}>
                    ※ {daewunAnalysis.additionalDesc}
                  </p>
                )}
              </div>
            );
          })()}

          {/* 세운 분석 */}
          {sewunAnalysis && (() => {
            const eff = EFFECT_COLOR[sewunAnalysis.effect] || EFFECT_COLOR['평(平)'];
            return (
              <div style={{ padding: '14px', borderRadius: '14px', background: eff.bg, border: `1px solid ${eff.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: eff.text }}>세운(歲運)</span>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{sewunAnalysis.luckPillar}</span>
                  <Badge bg={eff.bg} color={eff.text} border={eff.border}>{sewunAnalysis.effect}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                  {sewunAnalysis.effectDesc}
                </p>
                {sewunAnalysis.additionalDesc && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.88rem', fontWeight: '600', color: eff.text, lineHeight: '1.5', wordBreak: 'keep-all' }}>
                    ※ {sewunAnalysis.additionalDesc}
                  </p>
                )}
              </div>
            );
          })()}
        </Card>
      )}

      {/* ─── 하단 안내 ─── */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-color)', borderRadius: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <strong style={{ color: 'var(--text-primary)' }}>자평진전(子平真詮)</strong> 기준 분석 — 청나라 심효첨(沈孝瞻) 저술, 격국론의 정통 교범을 기반으로 합니다. 명리학은 참고 자료이며 인생의 최종 결정은 본인에게 있습니다.
      </div>
    </div>
  );
}
