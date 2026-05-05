import {
  BrandLockup,
  Button,
  Card,
  FireHeroCard,
  MetricCard,
  MoneyInputRow,
  PageCanvas,
  StateMetricExamples,
  StatusPill,
  TextField,
} from '@/components/fire-banking'
import { Icon, type IconName } from '@/components/fire-banking/icons'

const keywords: Array<{ label: string; icon: IconName }> = [
  { label: '차분함', icon: 'leaf' },
  { label: '신뢰감', icon: 'shield' },
  { label: '함께 보는 숫자', icon: 'users' },
  { label: '월간 리추얼', icon: 'calendar' },
  { label: '장기적 관점', icon: 'mountain' },
  { label: '부담 없는 참여', icon: 'heart' },
]

const surfaces: Array<[string, string, string]> = [
  ['Page', '#FAFAFA', 'bg-fb-page'],
  ['Card', '#FFFFFF', 'bg-fb-card'],
  ['Card Alt', '#F7F7F8', 'bg-fb-card-alt'],
  ['Card Mute', '#F4F4F5', 'bg-fb-card-mute'],
]

const trust: Array<[string, string, string]> = [
  ['Trust', '#0066FF', 'bg-fb-trust'],
  ['Trust Strong', '#005EEB', 'bg-fb-trust-strong'],
  ['Trust Soft', '#EAF2FE', 'bg-fb-trust-soft'],
]

const status: Array<[string, string, string]> = [
  ['Positive', '#00A638', 'bg-fb-positive'],
  ['Cautionary', '#FF8A1F', 'bg-fb-cautionary'],
  ['Negative', '#FF4242', 'bg-fb-negative'],
]

export default function DesignSystemPage() {
  return (
    <div data-screen-label="design-system">
      <PageCanvas className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-od-id="design-system-header">
          <div>
            <BrandLockup tagline={false} />
            <p className="mt-3 text-sm text-fb-ink-2">부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱</p>
          </div>
          <Button href="/showcase" variant="secondary" data-od-id="cta-secondary">화면 쇼케이스 보기</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
          <Card className="p-6" data-od-id="ds-keywords">
            <h2 className="text-lg font-bold tracking-normal">1. 브랜드 무드 / 키워드</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {keywords.map((keyword) => (
                <div
                  key={keyword.label}
                  className="flex items-center gap-3 rounded-soft border border-fb-line bg-fb-card-alt p-4 text-sm font-bold"
                >
                  <Icon name={keyword.icon} className="size-5 text-fb-trust" />
                  {keyword.label}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" data-od-id="ds-palette">
            <h2 className="text-lg font-bold tracking-normal">2. 컬러 팔레트</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-fb-ink-2">Surface</p>
                <div className="mt-2 grid grid-cols-4 gap-3">
                  {surfaces.map(([label, hex, cls]) => (
                    <div key={label}>
                      <div className={`${cls} h-16 rounded-soft border border-fb-line`} />
                      <p className="mt-2 text-xs font-bold">{label}</p>
                      <p className="text-[11px] text-fb-ink-3">{hex}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-fb-ink-2">Trust (single accent)</p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {trust.map(([label, hex, cls]) => (
                    <div key={label}>
                      <div className={`${cls} h-16 rounded-soft border border-fb-line`} />
                      <p className="mt-2 text-xs font-bold">{label}</p>
                      <p className="text-[11px] text-fb-ink-3">{hex}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-fb-ink-2">Status (semantic only)</p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {status.map(([label, hex, cls]) => (
                    <div key={label}>
                      <div className={`${cls} h-16 rounded-soft border border-fb-line`} />
                      <p className="mt-2 text-xs font-bold">{label}</p>
                      <p className="text-[11px] text-fb-ink-3">{hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6" data-od-id="ds-typography">
            <h2 className="text-lg font-bold tracking-normal">3. 타이포그래피</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-fb-ink-3">Hero number</p>
                <p className="text-4xl font-black tracking-tight">2042년 8월</p>
              </div>
              <div>
                <p className="text-xs text-fb-ink-3">Section title</p>
                <p className="text-xl font-bold tracking-normal">FIRE 계산 순자산</p>
              </div>
              <div>
                <p className="text-xs text-fb-ink-3">Body</p>
                <p className="text-sm leading-6">우리가 함께 가는 경제적 자유</p>
              </div>
              <div className="rounded-soft bg-fb-card-alt p-4 text-sm text-fb-ink-2">
                Pretendard 100~900 weights · Korean 우선
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-6" data-od-id="ds-components">
            <h2 className="text-lg font-bold tracking-normal">4. 핵심 컴포넌트</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Button className="w-full">저장하기</Button>
                <Button variant="secondary" className="w-full">취소</Button>
                <Button variant="soft" className="w-full">지난달과 같아요</Button>
              </div>
              <div className="space-y-4">
                <TextField label="텍스트 필드" placeholder="항목명을 입력하세요" />
                <MoneyInputRow label="숫자 입력" value={12345} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusPill label="정상" status="positive" />
              <StatusPill label="주의" status="caution" />
              <StatusPill label="계산 불가" status="unavailable" />
            </div>
          </Card>

          <Card className="p-6" data-od-id="ds-numbers">
            <h2 className="text-lg font-bold tracking-normal">5. 수치 표현 계층</h2>
            <div className="mt-5 space-y-4">
              <FireHeroCard dateLabel="2042년 8월" distanceLabel="17년 3개월 후" compact />
              <StateMetricExamples />
              <div className="rounded-soft bg-fb-card-mute p-4 text-sm leading-6 text-fb-ink-2">
                현재 입력 기준으로는 목표 도달 시점을 계산하기 어려워요.
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6" data-od-id="ds-lead">
            <h2 className="text-lg font-bold">6. 리드 파트너 입력</h2>
            <p className="mt-2 text-sm leading-6 text-fb-ink-2">
              더 많은 항목과 세부 입력 제공. 정확한 수치를 기반으로 한 참고 지표 제공.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricCard title="총 자산" value="입력 후 표시" />
              <MetricCard title="저축률" value="계산 대기" variant="positive" />
            </div>
          </Card>
          <Card className="p-6" data-od-id="ds-lite">
            <h2 className="text-lg font-bold">배우자 간단 입력</h2>
            <p className="mt-2 text-sm leading-6 text-fb-ink-2">
              간단한 입력만으로 참여. 부담 없는 질문과 안심 문구 중심.
            </p>
            <div className="mt-5 space-y-3">
              <MoneyInputRow label="내 세후 월수입" value={0} soft />
              <Button className="w-full" variant="soft">정확하지 않아도 괜찮아요</Button>
            </div>
          </Card>
        </div>
      </PageCanvas>
    </div>
  )
}
