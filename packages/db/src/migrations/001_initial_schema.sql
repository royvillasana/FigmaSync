-- =============================================================================
-- UxBridge — Initial Schema (Migration 001)
-- =============================================================================

-- Enums
CREATE TYPE sync_direction AS ENUM ('figma_to_github', 'github_to_figma', 'bidirectional');
CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'conflict', 'error', 'pending_review', 'staged');
CREATE TYPE ds_source AS ENUM ('predefined', 'figma_library', 'storybook', 'tokens', 'custom_ai');
CREATE TYPE framework_label AS ENUM ('React', 'Vue', 'Svelte', 'WebComponents');
CREATE TYPE code_export_type AS ENUM ('default', 'named');
CREATE TYPE figma_node_type AS ENUM ('COMPONENT', 'COMPONENT_SET', 'VARIABLE', 'STYLE');
CREATE TYPE batch_trigger_type AS ENUM ('auto_inactivity', 'auto_threshold', 'manual', 'auto_timeout');
CREATE TYPE created_by_type AS ENUM ('user', 'ai_auto', 'storybook_import');
CREATE TYPE pr_status AS ENUM ('open', 'merged', 'closed');
CREATE TYPE sync_event_trigger AS ENUM ('webhook', 'plugin_manual', 'plugin_auto_inactivity', 'plugin_auto_threshold', 'plugin_auto_timeout', 'pr_merge');
CREATE TYPE sync_event_status AS ENUM ('success', 'error', 'conflict', 'staged', 'promoted');
CREATE TYPE conflict_resolution_type AS ENUM ('figma_wins', 'github_wins', 'manual_merge');
CREATE TYPE workspace_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE ds_via AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE sync_mode AS ENUM ('auto', 'manual_only');

-- -----------------------------------------------------------------------------
-- workspaces
-- -----------------------------------------------------------------------------
CREATE TABLE workspaces (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  plan              workspace_plan NOT NULL DEFAULT 'free',
  figma_org_id      TEXT,
  github_org        TEXT,
  ai_model_default  TEXT NOT NULL DEFAULT 'google/gemini-2.5-pro',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- projects — branch governance config lives here
-- -----------------------------------------------------------------------------
CREATE TABLE projects (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  figma_file_key            TEXT NOT NULL,
  github_repo               TEXT NOT NULL,
  design_system_via         ds_via NOT NULL DEFAULT 'A',
  ds_system                 TEXT,
  -- Branch governance
  design_branch_prefix      TEXT NOT NULL DEFAULT 'design/',
  pr_target_branch          TEXT NOT NULL DEFAULT 'main',
  sync_on_merge_to          TEXT NOT NULL DEFAULT 'main',
  auto_merge_tokens         BOOLEAN NOT NULL DEFAULT FALSE,
  require_pr_review         BOOLEAN NOT NULL DEFAULT TRUE,
  figma_staging_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  rollback_on_error         BOOLEAN NOT NULL DEFAULT TRUE,
  pr_description_figma_link BOOLEAN NOT NULL DEFAULT TRUE,
  -- Batching config
  inactivity_timeout_ms     INTEGER NOT NULL DEFAULT 300000,
  auto_sync_threshold       INTEGER NOT NULL DEFAULT 15,
  max_wait_timeout_ms       INTEGER NOT NULL DEFAULT 1800000,
  min_changes_for_sync      INTEGER NOT NULL DEFAULT 1,
  sync_mode                 sync_mode NOT NULL DEFAULT 'auto',
  ignore_low_significance   BOOLEAN NOT NULL DEFAULT FALSE,
  show_countdown_timer      BOOLEAN NOT NULL DEFAULT TRUE,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (figma_file_key, github_repo)
);

-- -----------------------------------------------------------------------------
-- component_mappings — central entity
-- -----------------------------------------------------------------------------
CREATE TABLE component_mappings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  figma_file_key          TEXT NOT NULL,
  figma_node_id           TEXT NOT NULL,
  figma_node_name         TEXT NOT NULL,
  figma_node_type         figma_node_type NOT NULL,
  figma_version_snapshot  TEXT,
  figma_staging_node_id   TEXT,
  code_repo               TEXT NOT NULL,
  code_file_path          TEXT NOT NULL,
  code_component_name     TEXT NOT NULL,
  code_export_type        code_export_type NOT NULL DEFAULT 'named',
  framework_label         framework_label NOT NULL DEFAULT 'React',
  ds_source               ds_source NOT NULL,
  ds_system               TEXT,
  variant_map             JSONB,
  token_bindings          JSONB,
  storybook_story_id      TEXT,
  confidence_score        REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  sync_direction          sync_direction NOT NULL DEFAULT 'bidirectional',
  last_sync_branch        TEXT,
  last_sync_pr_number     INTEGER,
  last_sync_pr_status     pr_status,
  last_sync_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sync_hash          TEXT,
  sync_status             sync_status NOT NULL DEFAULT 'pending',
  batch_id                TEXT,
  batch_trigger           batch_trigger_type,
  batch_change_count      INTEGER,
  ai_model_used           TEXT,
  created_by              created_by_type NOT NULL DEFAULT 'user',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (figma_file_key, figma_node_id)
);

-- -----------------------------------------------------------------------------
-- sync_events — audit log for every sync operation
-- -----------------------------------------------------------------------------
CREATE TABLE sync_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mapping_id            UUID REFERENCES component_mappings(id) ON DELETE SET NULL,
  direction             sync_direction NOT NULL,
  trigger               sync_event_trigger NOT NULL,
  status                sync_event_status NOT NULL,
  batch_id              TEXT,
  batch_change_count    INTEGER,
  branch_name           TEXT,
  pr_number             INTEGER,
  figma_version_before  TEXT,
  payload_hash          TEXT,
  ai_model_used         TEXT,
  duration_ms           INTEGER,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- conflict_resolutions
-- -----------------------------------------------------------------------------
CREATE TABLE conflict_resolutions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_event_id    UUID NOT NULL REFERENCES sync_events(id) ON DELETE CASCADE,
  mapping_id       UUID NOT NULL REFERENCES component_mappings(id) ON DELETE CASCADE,
  figma_snapshot   JSONB NOT NULL,
  github_snapshot  JSONB NOT NULL,
  resolution       conflict_resolution_type NOT NULL,
  resolved_by      UUID REFERENCES auth.users(id),
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on component_mappings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER component_mappings_updated_at
  BEFORE UPDATE ON component_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
