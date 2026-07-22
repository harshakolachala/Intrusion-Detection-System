# FL vs. Baseline -- Held-Out Evaluation

_Generated 2026-07-22 14:15 UTC by evaluate.py_

Both models below are scored on the exact same pooled, stratified 20% held-out set (`data/clients/global_holdout_*.npy`), built once from all three client shards so neither model has an unfair data-overlap advantage.

## Summary

| Model | Accuracy | Macro F1 | Weighted F1 | Eval samples | Excluded (unseen label) |
|---|---|---|---|---|---|
| Baseline (single client, no FL) | 0.9870 | 0.6862 | 0.9869 | 504160 | 0 |
| FL Global Model | 0.9847 | 0.6856 | 0.9843 | 504160 | 0 |

## Notes

- The FL global model trails the single-client baseline by -0.0005 macro F1 (-0.0023 accuracy). Macro F1 matters more than accuracy here because CICIDS2017 is heavily class-imbalanced (e.g. BENIGN vs. Heartbleed's ~11 samples).
- Per-class numbers for both models are in `fl_vs_baseline_results.json` for a deeper minority-class look (worth highlighting Heartbleed/Infiltration in the writeup, since those are the classes FL's cross-client data diversity should help with most).
- Baseline was trained on a single client's local data only (`train_baseline.py`, client0); any class missing from that client's shard is excluded from its scoring here rather than counted as wrong, since the model was never able to predict it.
