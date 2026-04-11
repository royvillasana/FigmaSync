export type SyncDirection = "figma_to_github" | "github_to_figma" | "bidirectional";
export type SyncStatus = "synced" | "pending" | "conflict" | "error" | "pending_review" | "staged";
export type DsSource = "predefined" | "figma_library" | "storybook" | "tokens" | "custom_ai";
export type FrameworkLabel = "React" | "Vue" | "Svelte" | "WebComponents";
export type CodeExportType = "default" | "named";
export type FigmaNodeType = "COMPONENT" | "COMPONENT_SET" | "VARIABLE" | "STYLE";
export type BatchTriggerType = "auto_inactivity" | "auto_threshold" | "manual" | "auto_timeout";
export type CreatedBy = "user" | "ai_auto" | "storybook_import";
export type LastSyncPrStatus = "open" | "merged" | "closed";
/** Central entity — every sync operation references a ComponentMapping */
export interface ComponentMapping {
    id: string;
    workspace_id: string;
    project_id: string;
    figma_file_key: string;
    figma_node_id: string;
    figma_node_name: string;
    figma_node_type: FigmaNodeType;
    /** Figma version ID saved before each write — used for rollback */
    figma_version_snapshot: string | null;
    /** Node ID in the Staging section (before promoting to master) */
    figma_staging_node_id: string | null;
    code_repo: string;
    code_file_path: string;
    code_component_name: string;
    code_export_type: CodeExportType;
    framework_label: FrameworkLabel;
    ds_source: DsSource;
    ds_system: string | null;
    /** Figma variant → code prop mapping. e.g. { "variant=primary": { "variant": "default" } } */
    variant_map: Record<string, Record<string, string>> | null;
    /**
     * DTCG token bindings — maps Figma variable IDs to tokens.json paths.
     * e.g. { "figma_var_id": "VariableID:123", "dtcg_path": "color.primary", "css_var": "--color-primary" }
     * NOT Code Connect — uses the token pipeline directly.
     */
    token_bindings: Record<string, string> | null;
    storybook_story_id: string | null;
    /** AI confidence score 0.0–1.0 (null if created manually) */
    confidence_score: number | null;
    sync_direction: SyncDirection;
    last_sync_branch: string | null;
    last_sync_pr_number: number | null;
    last_sync_pr_status: LastSyncPrStatus | null;
    last_sync_at: string;
    /** SHA-256 hash of last synced state — used for conflict detection */
    last_sync_hash: string | null;
    sync_status: SyncStatus;
    /** ID grouping all changes from one batch flush → single PR */
    batch_id: string | null;
    batch_trigger: BatchTriggerType | null;
    batch_change_count: number | null;
    /** OpenRouter model string used in the last AI operation */
    ai_model_used: string | null;
    created_by: CreatedBy;
    created_at: string;
    updated_at: string;
}
export interface Workspace {
    id: string;
    name: string;
    plan: "free" | "pro" | "enterprise";
    figma_org_id: string | null;
    github_org: string | null;
    /** Default OpenRouter model string for this workspace */
    ai_model_default: string;
    created_at: string;
}
/** Branch governance config lives on the Project */
export interface Project {
    id: string;
    workspace_id: string;
    figma_file_key: string;
    github_repo: string;
    design_system_via: "A" | "B" | "C" | "D";
    ds_system: string | null;
    /** Prefix for branches created from Figma changes. Default: "design/" */
    design_branch_prefix: string;
    /** Target branch for PRs created by design changes. Default: "main" */
    pr_target_branch: string;
    /** Merges to this branch trigger Figma updates. Default: "main" */
    sync_on_merge_to: string;
    /** Auto-merge token-only changes without review */
    auto_merge_tokens: boolean;
    /** Require at least 1 approval before applying sync */
    require_pr_review: boolean;
    /** Show staging section in Figma before promoting */
    figma_staging_enabled: boolean;
    /** Restore Figma snapshot on sync failure */
    rollback_on_error: boolean;
    /** Include Figma node link in PR description */
    pr_description_figma_link: boolean;
    /** Batching config */
    inactivity_timeout_ms: number;
    auto_sync_threshold: number;
    max_wait_timeout_ms: number;
    min_changes_for_sync: number;
    sync_mode: "auto" | "manual_only";
    ignore_low_significance: boolean;
    show_countdown_timer: boolean;
    is_active: boolean;
    created_at: string;
}
export type SyncEventTrigger = "webhook" | "plugin_manual" | "plugin_auto_inactivity" | "plugin_auto_threshold" | "plugin_auto_timeout" | "pr_merge";
export type SyncEventStatus = "success" | "error" | "conflict" | "staged" | "promoted";
export interface SyncEvent {
    id: string;
    project_id: string;
    mapping_id: string;
    direction: SyncDirection;
    trigger: SyncEventTrigger;
    status: SyncEventStatus;
    batch_id: string | null;
    batch_change_count: number | null;
    branch_name: string | null;
    pr_number: number | null;
    figma_version_before: string | null;
    payload_hash: string | null;
    ai_model_used: string | null;
    duration_ms: number | null;
    error_message: string | null;
    created_at: string;
}
export type ConflictResolution = "figma_wins" | "github_wins" | "manual_merge";
export interface ConflictResolutionRecord {
    id: string;
    sync_event_id: string;
    mapping_id: string;
    figma_snapshot: Record<string, unknown>;
    github_snapshot: Record<string, unknown>;
    resolution: ConflictResolution;
    resolved_by: string | null;
    resolved_at: string | null;
}
//# sourceMappingURL=database.d.ts.map