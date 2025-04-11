# streamlit_frontend/chat_ui.py

import sys, os
import streamlit as st

# Make project root importable
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from graph.query_engine import QueryEngine
from llm.model import load_llm
from llm.answer_generator import generate_answer

# Load LLM once
llm = load_llm()

st.set_page_config(page_title="Simulia Chat", layout="wide")
st.title("🗣️ Simulia Subscription Support Chat")

# Sidebar for default context
with st.sidebar:
    st.header("Context Settings")
    default_tier = st.selectbox("Default Tier", ["Basic", "Standard", "Premium"])
    default_info = st.selectbox(
        "Default Info Type", ["features", "limitations", "support", "upgrades"]
    )

# Initialize chat history
if "history" not in st.session_state:
    st.session_state.history = []  # list of {"role":"user"|"assistant","message":str}

# Render chat history
for msg in st.session_state.history:
    if msg["role"] == "user":
        st.markdown(f"**You:** {msg['message']}")
    else:
        st.markdown(f"**Assistant:** {msg['message']}")

# Use a form to capture input and submit
with st.form(key="chat_form", clear_on_submit=True):
    user_input = st.text_input("Your message:")
    submit = st.form_submit_button("Send")

if submit and user_input:
    # 1) Append the user message
    st.session_state.history.append({"role": "user", "message": user_input})

    # 2) Query the knowledge graph
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
        else:
            retrieved = []
    finally:
        engine.close()

    # 3) Generate the assistant’s reply
    answer = generate_answer(
        llm=llm,
        question=user_input,
        retrieved_info=retrieved,
        entity=default_tier,
        info_type=default_info
    )

    # 4) Append the assistant message
    st.session_state.history.append({"role": "assistant", "message": answer})

    # 5) Stop execution so Streamlit reruns and displays updated history
    st.stop()
