import type { FixedCostSimulatorConfig } from "./fixedCostTypes";

export const defaultFixedCostConfig: FixedCostSimulatorConfig = {
  periodMonths: 120,
  annualReturnRate: 0.05,
  investmentRatio: 0,
  bufferMonthlyAmount: 0,
  subscriptionCategories: [
    {
      id: "digital",
      name: "디지털 구독",
      prompt: "혹시 쓰고 있는 OTT나 앱 구독이 있으세요?",
      items: [
        { id: "youtube-premium", name: "유튜브 프리미엄", monthlyAmount: 14_900, enabled: false },
        { id: "chatgpt-plus", name: "ChatGPT Plus", monthlyAmount: 30_000, enabled: false },
        { id: "claude-pro", name: "Claude Pro", monthlyAmount: 30_000, enabled: false },
        { id: "notion", name: "Notion", monthlyAmount: 7_000, enabled: false },
      ],
    },
    {
      id: "finance",
      name: "금융/보험",
      prompt: "매달 자동이체 되는 보험이나 대출이자가 있나요?",
      items: [
        { id: "insurance", name: "보험료", monthlyAmount: 100_000, enabled: false },
        { id: "loan-interest", name: "대출 이자", monthlyAmount: 300_000, enabled: false },
      ],
    },
    {
      id: "membership",
      name: "통신/멤버십",
      prompt: "휴대폰 요금이나 멤버십 서비스는요?",
      items: [
        { id: "phone", name: "휴대폰 요금", monthlyAmount: 65_000, enabled: false },
        { id: "coupang", name: "쿠팡 와우", monthlyAmount: 4_990, enabled: false },
        { id: "naver", name: "네이버멤버십", monthlyAmount: 5_000, enabled: false },
      ],
    },
    {
      id: "health",
      name: "운동/건강",
      prompt: "헬스장이나 건강 관련 정기 결제가 있으세요?",
      items: [
        { id: "gym", name: "헬스장", monthlyAmount: 50_000, enabled: false },
        { id: "pilates", name: "필라테스", monthlyAmount: 100_000, enabled: false },
        { id: "supplements", name: "영양제 정기배송", monthlyAmount: 30_000, enabled: false },
      ],
    },
    {
      id: "learning",
      name: "취미/학습",
      prompt: "게임이나 온라인 강의 구독 중인 게 있나요?",
      items: [
        { id: "game", name: "게임 월정액", monthlyAmount: 15_000, enabled: false },
        { id: "course", name: "온라인 강의", monthlyAmount: 30_000, enabled: false },
      ],
    },
    {
      id: "custom",
      name: "직접 추가",
      prompt: "내 상황에 맞는 반복 지출을 직접 넣어보세요.",
      items: [],
    },
  ],
  livingExpenses: [
    { id: "food", name: "식비", monthlyAmount: 0 },
    { id: "dining", name: "외식/카페", monthlyAmount: 0 },
    { id: "transport", name: "교통비", monthlyAmount: 0 },
    { id: "medical", name: "병원/약", monthlyAmount: 0 },
    { id: "shopping", name: "쇼핑/생활용품", monthlyAmount: 0 },
    { id: "culture", name: "여행/취미", monthlyAmount: 0 },
    { id: "misc", name: "기타", monthlyAmount: 0 },
  ],
};
