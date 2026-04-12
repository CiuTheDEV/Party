CREATE TABLE IF NOT EXISTS activation_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  entitlement_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  redeemed_by_user_id TEXT,
  redeemed_at TEXT,
  FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_redeemed_by_user_id ON activation_codes(redeemed_by_user_id);

INSERT OR IGNORE INTO activation_codes (
  id,
  code,
  entitlement_key,
  created_at,
  redeemed_by_user_id,
  redeemed_at
) VALUES (
  'activation-charades-pack',
  'KALAMBURY-START',
  'charades_category_pack',
  '2026-04-12T00:00:00.000Z',
  NULL,
  NULL
);
