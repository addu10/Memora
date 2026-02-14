# Data Directory

- `raw/` — raw photos/CSVs collected from participants. Keep PII encrypted and out of version control.
- `processed/` — aligned faces, tokenized metadata, train/val splits.
- `examples/` — tiny synthetic samples for CI/smoke tests (safe to commit).

Suggested practice:
- Maintain a `data_catalog.md` describing each dataset, source, consent status, and preprocessing steps.
- Use `.gitignore` to exclude large/raw artifacts.


