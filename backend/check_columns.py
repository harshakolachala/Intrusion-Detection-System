import pandas as pd

df = pd.read_csv("datasets/combinenew.csv", low_memory=False)

print(df.dtypes)

print("\nObject Columns:")
print(df.select_dtypes(include=["object"]).columns.tolist())