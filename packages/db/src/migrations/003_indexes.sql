-- =============================================================================
-- UxBridge — Performance Indexes (Migration 003)
-- =============================================================================

-- component_mappings — most common query patterns
CREATE INDEX idx_cm_project_id ON component_mappings (project_id);
CREATE INDEX idx_cm_figma_file_key ON component_mappings (figma_file_key);
CREATE INDEX idx_cm_figma_node_id ON component_mappings (figma_node_id);
CREATE INDEX idx_cm_sync_status ON component_mappings (sync_status);
CREATE INDEX idx_cm_batch_id ON component_mappings (batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_cm_last_sync_at ON component_mappings (last_sync_at DESC);
CREATE INDEX idx_cm_workspace_id ON component_mappings (workspace_id);

-- sync_events — audit log queries
CREATE INDEX idx_se_project_id ON sync_events (project_id);
CREATE INDEX idx_se_mapping_id ON sync_events (mapping_id);
CREATE INDEX idx_se_batch_id ON sync_events (batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_se_created_at ON sync_events (created_at DESC);
CREATE INDEX idx_se_status ON sync_events (status);
CREATE INDEX idx_se_trigger ON sync_events (trigger);

-- projects
CREATE INDEX idx_projects_workspace_id ON projects (workspace_id);
CREATE INDEX idx_projects_figma_file_key ON projects (figma_file_key);

-- workspace_members
CREATE INDEX idx_wm_user_id ON workspace_members (user_id);
