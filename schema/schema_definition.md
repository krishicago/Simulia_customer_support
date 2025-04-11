# Knowledge Graph Schema - Simulia Subscription Support

## Entity Types:
- SubscriptionTier
- Feature
- Limitation
- SupportLevel

## Relationships:
- SubscriptionTier HAS_FEATURE Feature
- SubscriptionTier HAS_LIMITATION Limitation
- SubscriptionTier HAS_SUPPORTLEVEL SupportLevel
- SubscriptionTier CAN_UPGRADE_TO SubscriptionTier
