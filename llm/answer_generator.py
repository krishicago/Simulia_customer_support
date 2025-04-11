# llm/answer_generator.py
def generate_answer(llm, question, retrieved_info, entity, info_type):
    info_labels = {
        "features": "features",
        "limitations": "limitations",
        "support": "support level",
        "upgrades": "upgradable tiers"
    }
    label = info_labels.get(info_type, info_type)

    system_prompt = (
        "You are a helpful customer support assistant for Simulia subscriptions. "
        "Use the facts provided to answer the user's question accurately and conversationally."
    )

    context = f"{label.capitalize()} for the {entity} tier: {retrieved_info}"

    full_prompt = f"""<s>[INST] <<SYS>>
{system_prompt}
<</SYS>>

User Question: {question}

Context:
{context}

Assistant:"""

    response = llm(full_prompt, max_tokens=200, stop=["</s>"])
    return response["choices"][0]["text"].strip()
