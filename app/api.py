# # app/api.py

# import sys, os

# # 1) Add project root to sys.path so we can import graph/ and llm/
# PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
# if PROJECT_ROOT not in sys.path:
#     sys.path.insert(0, PROJECT_ROOT)

# from flask import Flask, request, jsonify
# from graph.query_engine import QueryEngine
# from llm.model import load_llm
# from llm.answer_generator import generate_answer

# app = Flask(__name__)
# llm = load_llm()

# @app.route("/api/converse", methods=["POST"])
# def converse():
#     data = request.get_json(silent=True) or {}
#     question = data.get("user_question") or data.get("question")
#     if not question:
#         return jsonify(error="Missing user_question"), 400

#     tier = data.get("tier_name", "Basic")
#     info  = data.get("info_type", "features")

#     engine = QueryEngine()
#     try:
#         if info == "features":
#             retrieved = engine.get_tier_features(tier)
#         elif info == "limitations":
#             retrieved = engine.get_tier_limitations(tier)
#         elif info == "support":
#             retrieved = engine.get_tier_support(tier)
#         elif info == "upgrades":
#             retrieved = engine.get_upgradable_tiers(tier)
#         elif info == "features_after_upgrade":
#             from_t = data.get("from_tier", tier)
#             to_t   = data.get("to_tier", tier)
#             retrieved = engine.get_features_after_upgrade(from_t, to_t)
#         else:
#             retrieved = []
#     finally:
#         engine.close()

#     entity_label = (
#         f"{data.get('from_tier','') or tier}→{data.get('to_tier','') or tier}"
#         if info == "features_after_upgrade" else tier
#     )
#     answer = generate_answer(
#         llm=llm,
#         question=question,
#         retrieved_info=retrieved,
#         entity=entity_label,
#         info_type=info
#     )
#     return jsonify(answer=answer)

# if __name__ == "__main__":
#     app.run(host="127.0.0.1", port=5050, debug=False)










# app/api.py

import sys, os
import json
from flask import Flask, request, jsonify

# Add project root to path for imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from graph.query_engine import QueryEngine
from llm.model import load_llm
from llm.answer_generator import generate_answer

app = Flask(__name__)
llm = load_llm()

@app.route("/api/converse", methods=["POST"])
def converse():
    data = request.get_json(silent=True) or {}
    question = data.get("user_question") or data.get("question")
    if not question:
        return jsonify(error="Missing user_question"), 400

    # 1) Default context
    tier = data.get("tier_name", "Basic")
    info  = data.get("info_type", "features")

    # 2) Automatic intent extraction if context not provided
    if ("tier_name" not in data) or ("info_type" not in data):
        parse_prompt = f"""Extract JSON with keys "tier_name" (Basic|Standard|Premium) and \
"info_type" (features|limitations|support|upgrades|features_after_upgrade) from the user question below. \
Respond ONLY with JSON, nothing else.

Question: "{question}"
"""
        try:
            parse_resp = llm(parse_prompt, max_tokens=60, stop=["\n"])
            intent = json.loads(parse_resp["choices"][0]["text"])
            tier = intent.get("tier_name", tier)
            info = intent.get("info_type", info)
        except Exception:
            # If parsing fails, keep defaults or provided values
            pass

    # 3) Retrieve from the graph
    engine = QueryEngine()
    try:
        if info == "features":
            retrieved = engine.get_tier_features(tier)
        elif info == "limitations":
            retrieved = engine.get_tier_limitations(tier)
        elif info == "support":
            retrieved = engine.get_tier_support(tier)
        elif info == "upgrades":
            retrieved = engine.get_upgradable_tiers(tier)
        elif info == "features_after_upgrade":
            from_t = data.get("from_tier", tier)
            to_t   = data.get("to_tier", tier)
            retrieved = engine.get_features_after_upgrade(from_t, to_t)
        else:
            retrieved = []
    finally:
        engine.close()

    # 4) Build entity label for multi-hop or single context
    if info == "features_after_upgrade":
        entity_label = f"{data.get('from_tier', tier)}→{data.get('to_tier', tier)}"
    else:
        entity_label = tier

    # 5) Generate the answer
    answer = generate_answer(
        llm=llm,
        question=question,
        retrieved_info=retrieved,
        entity=entity_label,
        info_type=info
    )

    return jsonify(answer=answer)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=False)
