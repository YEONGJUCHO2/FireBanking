import { z } from "zod";

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  monthlyAmount: z.number().min(0).max(100_000_000),
  enabled: z.boolean().optional(),
  note: z.string().max(500).optional(),
});

export const fixedCostSimulationConfigSchema = z.object({
  periodMonths: z.number().int().min(1).max(360),
  annualReturnRate: z.number().min(0).max(0.2),
  investmentRatio: z.number().min(0).max(1),
  bufferMonthlyAmount: z.number().min(0).max(1_000_000_000),
  dashboardBaseline: z
    .object({
      targetMonthlyExpense: z.number().min(0).max(1_000_000_000),
      fireNetWorth: z.number().min(0).max(100_000_000_000_000),
      monthlyAssetGrowthCapacity: z.number().min(-1_000_000_000).max(1_000_000_000),
    })
    .optional(),
  subscriptionCategories: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      prompt: z.string(),
      items: z.array(itemSchema.extend({ enabled: z.boolean() })),
    }),
  ),
  livingExpenses: z.array(itemSchema.omit({ enabled: true })),
});
