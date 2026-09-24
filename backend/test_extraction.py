from agent import run_extraction
try:
    result = run_extraction("This is a test deviation.")
    print("Success:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
