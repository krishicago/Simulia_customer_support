# streamlit_frontend/chat_ui.py

import sys, os
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# Make project root importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from graph.query_engine import QueryEngine
from llm.model import load_llm
from llm.answer_generator import generate_answer

llm = load_llm()
st.set_page_config(page_title="Simulia Chat", layout="wide")
st.title("🗣️ Simulia Subscription Support Chat")

with st.sidebar:
    st.header("Context Settings")
    default_tier = st.selectbox("Default Tier", ["Basic", "Standard", "Premium"])
    default_info = st.selectbox(
        "Default Info Type",
        ["features", "limitations", "support", "upgrades", "features_after_upgrade"]
    )
    if default_info == "features_after_upgrade":
        from_tier = st.selectbox("From Tier", ["Basic", "Standard", "Premium"], index=0)
        to_tier   = st.selectbox("To Tier",   ["Basic", "Standard", "Premium"], index=1)
    show_chart = st.checkbox("Show Tier Overview Chart")

if show_chart:
    engine = QueryEngine()
    tiers = ["Basic", "Standard", "Premium"]
    data = {
        "Tier": tiers,
        "Features": [len(engine.get_tier_features(t)) for t in tiers],
        "Limitations": [len(engine.get_tier_limitations(t)) for t in tiers],
    }
    engine.close()
    df = pd.DataFrame(data)
    fig, ax = plt.subplots()
    ax.bar(df["Tier"], df["Features"], label="Features")
    ax.bar(df["Tier"], df["Limitations"], bottom=df["Features"], label="Limitations")
    ax.set_xlabel("Subscription Tier")
    ax.set_ylabel("Count")
    ax.set_title("Features vs Limitations by Tier")
    ax.legend()
    ax.grid(True, linestyle="--", linewidth=0.5)
    st.pyplot(fig)

if "history" not in st.session_state:
    st.session_state.history = []

for msg in st.session_state.history:
    with st.chat_message(msg["role"]):
        st.markdown(msg["message"])

user_input = st.chat_input("Your message...")

if user_input:
    st.session_state.history.append({"role": "user", "message": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    engine = QueryEngine()
    try:
        if default_info == "features":
            retrieved = engine.get_tier_features(default_tier)
        elif default_info == "limitations":
            retrieved = engine.get_tier_limitations(default_tier)
        elif default_info == "support":
            retrieved = engine.get_tier_support(default_tier)
        elif default_info == "upgrades":
            retrieved = engine.get_upgradable_tiers(default_tier)
        else:  # features_after_upgrade
            retrieved = engine.get_features_after_upgrade(from_tier, to_tier)
    finally:
        engine.close()

    entity_label = f"{from_tier}→{to_tier}" if default_info == "features_after_upgrade" else default_tier
    answer = generate_answer(
        llm=llm,
        question=user_input,
        retrieved_info=retrieved,
        entity=entity_label,
        info_type=default_info
    )
    st.session_state.history.append({"role": "assistant", "message": answer})
    with st.chat_message("assistant"):
        st.markdown(answer)
