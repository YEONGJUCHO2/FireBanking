import { BrandLockup, Button, Card, FireHeroCard, MetricCard, MoneyInputRow, PageCanvas, StateMetricExamples, StatusPill, TextField } from '@/components/fire-banking'
import { Icon, type IconName } from '@/components/fire-banking/icons'

const keywords: Array<{ label: string; icon: IconName }> = [
  { label: '차분함', icon: 'leaf' },
  { label: '신뢰감', icon: 'shield' },
  { label: '함께 보는 숫자', icon: 'users' },
  { label: '월간 리추얼', icon: 'calendar' },
  { label: '장기적 관점', icon: 'mountain' },
  { label: '부담 없는 참여', icon: 'heart' },
]

const colors = [
  ['주요 그린', '#1E5B4A', 'bg-fb-green'],
  ['딥 포레스트', '#123D33', 'bg-fb-green-900'],
  ['세이지', '#A8BFAF', 'bg-fb-sage'],
  ['샌드', '#F2E9DC', 'bg-fb-sand'],
  ['스톤', '#E7E2D8', 'bg-fb-stone'],
  ['슬레이트', '#3E4752', 'bg-fb-slate'],
  ['블루 그레이', '#6B7C93', 'bg-fb-bluegray'],
  ['배경', '#FBF8F4', 'bg-fb-bg'],
]

export default function DesignSystemPage() {
  return (
    <PageCanvas className="max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><BrandLockup tagline={false} /><p className="mt-3 text-sm text-fb-muted">부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱</p></div>
        <Button href="/showcase" variant="secondary">화면 쇼케이스 보기</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        <Card className="p-6">
          <h2 className="text-lg font-bold tracking-normal">1. 브랜드 무드 / 키워드</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {keywords.map((keyword) => <div key={keyword.label} className="flex items-center gap-3 rounded-soft border border-fb-line bg-fb-surface p-4 text-sm font-bold"><Icon name={keyword.icon} className="size-5 text-fb-green" />{keyword.label}</div>)}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold tracking-normal">2. 컬러 팔레트</h2>
          <div className="mt-5 grid grid-cols-4 gap-4">
            {colors.map(([label, hex, cls]) => <div key={label}><div className={`${cls} h-16 rounded-soft border border-fb-line`} /><p className="mt-2 text-xs font-bold">{label}</p><p className="text-[11px] text-fb-muted">{hex}</p></div>)}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold tracking-normal">3. 타이포그래피</h2>
          <div className="mt-5 space-y-4">
            <div><p className="text-xs text-fb-muted">Headline</p><p className="text-4xl font-bold tracking-normal">2042년 8월</p></div>
            <div><p className="text-xs text-fb-muted">Section title</p><p className="text-xl font-bold tracking-normal">FIRE 계산 순자산</p></div>
            <div><p className="text-xs text-fb-muted">Body</p><p className="text-sm leading-6">우리가 함께 가는 경제적 자유</p></div>
            <div className="rounded-soft bg-fb-sand/70 p-4 text-sm text-fb-muted">Noto Sans KR / Pretendard 사용 권장</div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <h2 className="text-lg font-bold tracking-normal">4. 핵심 컴포넌트</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Button className="w-full">저장하기</Button><Button variant="secondary" className="w-full">취소</Button><Button variant="soft" className="w-full">지난달과 같아요</Button></div>
            <div className="space-y-4"><TextField label="텍스트 필드" placeholder="항목명을 입력하세요" /><MoneyInputRow label="숫자 입력" value={12345} /></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2"><StatusPill label="정상" status="positive" /><StatusPill label="주의" status="caution" /><StatusPill label="계산 불가" status="unavailable" /></div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold tracking-normal">5. 수치 표현 계층</h2>
          <div className="mt-5 space-y-4"><FireHeroCard dateLabel="2042년 8월" distanceLabel="17년 3개월 후" compact /><StateMetricExamples /><div className="rounded-soft bg-fb-stone/60 p-4 text-sm leading-6 text-fb-muted">현재 입력 기준으로는 목표 도달 시점을 계산하기 어려워요.</div></div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6"><h2 className="text-lg font-bold">6. Admin 모드</h2><p className="mt-2 text-sm leading-6 text-fb-muted">더 많은 항목과 세부 입력 제공. 정확한 수치를 기반으로 한 분석 제공.</p><div className="mt-5 grid grid-cols-2 gap-3"><MetricCard title="총 자산" value="4억 9,200만원" /><MetricCard title="저축률" value="36%" variant="positive" delta="전월 대비 +4%p" /></div></Card>
        <Card className="p-6"><h2 className="text-lg font-bold">Lite 모드</h2><p className="mt-2 text-sm leading-6 text-fb-muted">간단한 입력만으로 참여. 부담 없는 질문과 안심 문구 중심.</p><div className="mt-5 space-y-3"><MoneyInputRow label="내 세후 월수입" value={300} soft /><Button className="w-full" variant="soft">정확하지 않아도 괜찮아요</Button></div></Card>
      </div>
    </PageCanvas>
  )
}
