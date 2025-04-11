# app/main.py
from graph.query_engine import QueryEngine

def test_query_engine():
    engine = QueryEngine()
    
    tier_name = "Premium"  # This should be the tier name you're interested in
    
    features = engine.get_tier_features(tier_name)
    limitations = engine.get_tier_limitations(tier_name)
    support = engine.get_tier_support(tier_name)
    upgradable_tiers = engine.get_upgradable_tiers(tier_name)
    
    print(f"Features for {tier_name}: {features}")
    print(f"Limitations for {tier_name}: {limitations}")
    print(f"Support for {tier_name}: {support}")
    print(f"Upgradable tiers for {tier_name}: {upgradable_tiers}")
    
    engine.close()

test_query_engine()
