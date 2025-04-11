# # llm/model.py

# import os
# from llama_cpp import Llama

# print("✅ model.py is running...")

# def load_llm():
#     project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
#     model_path = os.path.join(project_root, "models", "mistral-7b-instruct-v0.1.Q4_K_M.gguf")
    
#     if not os.path.exists(model_path):
#         raise ValueError(f"Model file not found at: {model_path}")

#     llm = Llama(
#         model_path=model_path,
#         n_ctx=2048,
#         n_threads=4
#     )
    
#     return llm  # <— this must be inside the function

# # no code after this

# llm/model.py
from llama_cpp import Llama

def load_llm():
    model_path = "models/mistral-7b-instruct-v0.1.Q4_K_M.gguf"
    llm = Llama(
        model_path=model_path,
        n_ctx=2048,
        n_threads=4,
        verbose=False,
        log_level="error"
    )
    return llm
