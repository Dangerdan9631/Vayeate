# Contract: Persisted Artifacts

## Purpose

This contract defines the durable file artifacts the application reads and
writes during normal authoring workflows.

## Catalog Files

**Location**: `data/catalogs/`

**File naming**:

- `<catalog-name>-<version>.json`

**Behavioral expectations**:

- Name and version together identify one catalog version.
- Invalid or unreadable files are ignored rather than trusted.
- Catalogs persist token entries, optional remote sources, and semantic token
  registry lists.

## Template Files

**Location**: `data/templates/`

**File naming**:

- `<template-name>-<version>.template.json`

**Behavioral expectations**:

- One file represents one template version.
- Templates persist selected catalog references, groups, variables, mappings,
  and semantic variant support data.
- Locked versions remain stable reference points for themes.

## Theme Files

**Location**: `data/themes/`

**File naming**:

- `<theme-name>-<version>.theme.json`

**Behavioral expectations**:

- One file represents one editable theme version.
- Theme files persist template reference, preview-role token references, color
  assignments, contrast assignments, and palette settings.
- Incrementing a theme version creates a new durable authoring artifact rather
  than overwriting prior versions.

## App Config File

**Location**: `data/config.json`

**Behavioral expectations**:

- Stores application-level preferences, currently including color scheme.
- Missing or invalid config falls back to default values.

## Preview Samples

**Location**: `previews/<language>/`

**Behavioral expectations**:

- Each preview directory contains one grammar definition plus one or more
  sample files.
- Sample files are tokenized and rendered for preview validation.
- Failed preview loads are skipped without corrupting persisted authoring data.

## Data Integrity Rules

- Artifact names use shared naming rules based on alphanumeric characters and
  hyphens.
- Versions follow semantic version formatting.
- Persisted files are validated at read boundaries before they enter policy or
  UI state.
- Missing references should surface as orphaned or unavailable state rather
  than being silently repaired.
- Empty sentinel files used only to preserve directories, such as `.gitkeep`,
  are not considered authoring artifacts and may be ignored by validation.

## Baseline Verification Coverage

- Catalog, template, theme, and config fixtures are verified by
  `src/model/schema/baseline-artifacts.test.ts`.
- Gateway load paths are verified to reject malformed persisted content safely
  in `src/gateway/baseline-gateways.test.ts`.
