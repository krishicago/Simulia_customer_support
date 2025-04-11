# test_query_engine.py

from graph.query_engine import QueryEngine
from llm.model import load_llm
from llm.answer_generator import generate_answer

llm = load_llm()
engine = QueryEngine()

for tier in ["Basic", "Standard", "Premium", "NonExistent"]:
    features = engine.get_tier_features(tier)
    limitations = engine.get_tier_limitations(tier)
    support = engine.get_tier_support(tier)
    upgrades = engine.get_upgradable_tiers(tier)

    print(f"\n=== Tier: {tier} ===")
    for info_type, data in [
        ("features", features),
        ("limitations", limitations),
        ("support", support),
        ("upgrades", upgrades),
    ]:
        answer = generate_answer(
            llm=llm,
            question=f"What are the {info_type} of the {tier} tier?",
            retrieved_info=data,
            entity=tier,
            info_type=info_type
        )
        print(f"{info_type.capitalize()} Answer: {answer}")

engine.close()
