# Feature Blocks & Monetization Guide

## Overview

SofaPredict uses a **feature blocks** system that allows you to:
- Define which features are available in each subscription plan
- Set usage limits (daily, weekly, monthly, yearly)
- Allow guest access to specific features without authentication
- Manage free trials with automatic expiration
- Track feature usage per user

## Feature Blocks Architecture

### 1. Feature Blocks Table
Defines all features that can be restricted:

```
featureBlocks:
  - key: "ai_analysis" (unique identifier)
  - name: "Análise com IA"
  - category: "analytics" | "tools" | "core" | "premium" | "export"
  - requiresAuth: boolean (needs login?)
  - requiresSubscription: boolean (needs paid plan?)
  - availableInTrial: boolean (available during trial?)
  - isActive: boolean (enabled?)
```

### 2. Plan Features Mapping
Links plans to features with limits:

```
planFeatures:
  - planId: 2 (Pro plan)
  - featureBlockId: 5 (AI Analysis feature)
  - usageLimit: 50 (max 50 per month)
  - resetPeriod: "monthly"
  - isEnabled: true
```

### 3. User Feature Usage
Tracks consumption:

```
userFeatureUsage:
  - userId: 123
  - featureBlockId: 5
  - usageCount: 25 (used 25 out of 50)
  - periodStart: 2026-06-27
  - periodEnd: 2026-07-27
```

### 4. Trial Subscriptions
Manages free trial periods:

```
trialSubscriptions:
  - userId: 456
  - trialPlanId: 2 (trialing Pro plan)
  - trialDaysRemaining: 10
  - endsAt: 2026-07-07
  - status: "active" | "expired" | "converted" | "cancelled"
```

## Available Feature Blocks

### Core Features (Free)
- `match_list` - Listar partidas ao vivo
- `match_details` - Detalhes da partida
- `filters_basic` - Filtros básicos (liga, odds range)
- `bet_history` - Histórico de apostas
- `user_profile` - Perfil do usuário

### Analytics Features (Pro+)
- `ai_analysis` - Análise com IA (limit: 50/month)
- `confidence_index` - Índice de confiança
- `team_stats` - Estatísticas de times
- `user_metrics` - Métricas do usuário (ROI, taxa de acerto)

### Tools Features (Pro+)
- `surebet_calculator` - Calculadora de arbitragem
- `tactical_radar` - Radar tático visual
- `triple_generator` - Gerador de tripla recomendada

### Premium Features (Premium only)
- `advanced_analytics` - Análises avançadas
- `export_data` - Exportar dados em CSV/PDF
- `priority_support` - Suporte prioritário

## Subscription Plans

### Free Plan
- **Price:** R$ 0.00
- **Features:** Core only
- **Limits:** 1 time favorito, 5 apostas/mês
- **Trial:** N/A

### Pro Plan
- **Price:** R$ 29.90/mês ou R$ 299.00/ano
- **Features:** Core + Analytics + Tools
- **Limits:** 5 times favoritos, 50 apostas/mês
- **Trial:** 14 dias grátis

### Premium Plan
- **Price:** R$ 79.90/mês ou R$ 799.00/ano
- **Features:** Core + Analytics + Tools + Premium
- **Limits:** 10 times favoritos, 200 apostas/mês
- **Trial:** 14 dias grátis

## Access Control Flow

### 1. Check Feature Access
```typescript
// Check if user can access a feature
const hasAccess = await hasFeatureAccess(userId, "ai_analysis");

if (!hasAccess) {
  return { error: "Feature not available in your plan" };
}
```

### 2. Track Usage
```typescript
// Increment usage counter after feature use
await incrementFeatureUsage(userId, "ai_analysis");

// Get remaining usage
const remaining = await getRemainingUsage(userId, "ai_analysis");
console.log(`Remaining analyses: ${remaining}`);
```

### 3. Guest Access
```typescript
// Features with requiresAuth=false are available to guests
const hasAccess = await hasFeatureAccess(null, "match_list");
// Returns true - guests can see match list
```

## Payment Verification Flow

### 1. Payment Initiated
User selects plan and payment method → Gateway processes payment

### 2. Webhook Received
Payment gateway sends webhook confirmation:
- Asaas (Pix): `payment_confirmed` event
- Stripe (Credit Card): `payment_intent.succeeded` event
- PayPal: `PAYMENT.CAPTURE.COMPLETED` event
- Telegram: `successful_payment` update

### 3. Automatic Activation
Webhook handler automatically:
1. Verifies webhook signature
2. Updates payment status to "completed"
3. Activates subscription (status = "active")
4. User gains access to paid features immediately

### 4. User Sees Changes
- Dashboard shows "Pro" badge
- New features appear in navigation
- Usage limits update

## Trial Period Management

### 1. Create Trial on Signup
```typescript
// Automatically create 14-day trial when user signs up
await createFreeTrial(userId, trialPlanId=2, trialDays=14);
```

### 2. Trial Expiration Reminders
```typescript
// Run daily to send reminders 3 days before expiry
await sendTrialExpirationReminders();
```

### 3. Trial Expiration
```typescript
// Run daily to expire old trials
await expireOldTrials();
```

### 4. Convert Trial to Subscription
```typescript
// When user upgrades from trial to paid
await convertTrialToSubscription(userId, subscriptionId);
```

## Guest Access (No Account Required)

Some features are available without authentication:

1. **Match List** - View live matches
2. **Match Details** - See match statistics
3. **Basic Filters** - Filter by league, odds range
4. **Public Radar** - View tactical radar for public matches

Guest access is tracked in `guestAccessLog` table for analytics.

## Admin Configuration

### 1. Add New Feature Block
```typescript
// In admin panel or database
INSERT INTO feature_blocks (key, name, category, requiresAuth)
VALUES ('new_feature', 'New Feature', 'tools', true);
```

### 2. Assign Feature to Plan
```typescript
// Link feature to plan with limits
INSERT INTO plan_features (planId, featureBlockId, usageLimit, resetPeriod)
VALUES (2, 10, 50, 'monthly');
```

### 3. Modify Plan Features
```typescript
// Update feature availability in plan
UPDATE plan_features
SET usageLimit = 100, isEnabled = true
WHERE planId = 2 AND featureBlockId = 10;
```

## API Endpoints (tRPC)

### Check Access
```typescript
trpc.features.hasAccess.useQuery({ featureKey: "ai_analysis" });
```

### Get Available Features
```typescript
trpc.features.getAvailable.useQuery();
```

### Get Usage Info
```typescript
trpc.features.getUsage.useQuery({ featureKey: "ai_analysis" });
```

### Get All Features (Admin)
```typescript
trpc.admin.features.getAll.useQuery();
```

### Update Feature Config (Admin)
```typescript
trpc.admin.features.update.useMutation({
  featureBlockId: 5,
  config: { usageLimit: 100 }
});
```

## Best Practices

### 1. Feature Naming
- Use snake_case for keys: `ai_analysis`, `surebet_calculator`
- Use readable names: "Análise com IA", "Calculadora de Arbitragem"

### 2. Usage Limits
- Set realistic limits based on API costs
- Consider trial users (usually higher limits)
- Reset periods should match billing cycles

### 3. Guest Access
- Only enable for non-sensitive features
- Track guest usage for conversion metrics
- Consider rate limiting for guests

### 4. Trial Strategy
- 14 days is standard for SaaS
- Give trial users access to Pro features
- Send reminders 3 days before expiry
- Make upgrade easy at trial end

### 5. Monitoring
- Track feature adoption rates
- Monitor usage patterns
- Identify underutilized features
- Adjust limits based on data

## Troubleshooting

### User Can't Access Feature
1. Check if feature is active: `featureBlocks.isActive = true`
2. Check if plan has feature: `planFeatures.isEnabled = true`
3. Check usage limit: `userFeatureUsage.usageCount < planFeatures.usageLimit`
4. Check trial status: `trialSubscriptions.status = "active"` and `endsAt > now`

### Payment Not Activating Subscription
1. Check webhook logs for errors
2. Verify webhook signature validation
3. Check payment status in database
4. Manually activate if needed: `UPDATE user_subscriptions SET status = 'active'`

### Trial Not Expiring
1. Run `expireOldTrials()` manually
2. Check `trialSubscriptions.endsAt` is in past
3. Verify cron job is running

## Future Enhancements

- [ ] Feature analytics dashboard
- [ ] A/B testing for feature limits
- [ ] Dynamic pricing based on usage
- [ ] Feature rollout scheduling
- [ ] Beta feature access for specific users
- [ ] Feature deprecation warnings
