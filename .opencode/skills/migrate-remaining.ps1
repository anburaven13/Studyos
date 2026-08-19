# Script de migración de Skills restantes
# ========================================

$basePath = Resolve-Path (Join-Path $PSScriptRoot "..")

# Skills restantes clasificados
$remainingSkills = @{
	"10-backend-group"   = @(
		'backend-development-feature-development', 'c-pro', 'cpp-pro', 'php-pro', 'rust-pro',
		'julia-pro', 'data-engineering-data-driven-feature', 'data-engineering-data-pipeline',
		'database-cloud-optimization-cost-optimize', 'database-migrations-migration-observability',
		'database-migrations-sql-migrations', 'salesforce-development', 'shopify-development',
		'shopify-apps', 'moodle-external-api-development', 'plaid-fintech', 'algolia-search',
		'discord-bot-architect', 'slack-bot-builder', 'telegram-bot-builder', 'telegram-mini-app',
		'twilio-communications', 'temporal-python-pro', 'temporal-python-testing', 'python-patterns',
		'python-packaging', 'python-development-python-scaffold', 'bun-development'
	)
	"20-frontend-group"  = @(
		'frontend-mobile-development-component-scaffold', 'frontend-mobile-security-xss-scan',
		'javascript-typescript-typescript-scaffold', 'avalonia-layout-zafiro', 'avalonia-viewmodels-zafiro',
		'avalonia-zafiro-development', 'remotion-best-practices', 'claude-d3js-skill', 'web-artifacts-builder',
		'algorithmic-art', 'blog-a-slides', 'game-development', 'godot-gdscript-patterns',
		'minecraft-bukkit-pro', 'unity-developer', 'unity-ecs-patterns'
	)
	"30-devops-group"    = @(
		'deployment-validation-config-validate', 'dependency-management-deps-audit', 'dependency-upgrade',
		'environment-setup-guide', 'git-advanced-workflows', 'git-pr-workflows-git-workflow',
		'git-pr-workflows-onboard', 'git-pr-workflows-pr-enhance', 'git-pushing', 'using-git-worktrees',
		'changelog-automation', 'lint-and-validate', 'mcp-builder', 'zapier-make-patterns',
		'workflow-automation', 'arm-cortex-expert', 'systems-programming-rust-project', 'uv-package-manager'
	)
	"40-security-group"  = @(
		'cc-skill-security-review', 'production-code-audit'
	)
	"50-data-ml-group"   = @(
		'subagent-driven-development', 'search-specialist', 'conversation-memory'
	)
	"60-testing-group"   = @(
		'code-refactoring-context-restore', 'code-refactoring-refactor-clean', 'code-refactoring-tech-debt',
		'codebase-cleanup-deps-audit', 'codebase-cleanup-refactor-clean', 'codebase-cleanup-tech-debt',
		'framework-migration-code-migrate', 'framework-migration-deps-upgrade', 'framework-migration-legacy-modernize',
		'legacy-modernizer', 'verification-before-completion'
	)
	"70-docs-group"      = @(
		'brand-guidelines-anthropic', 'brand-guidelines-community', 'internal-comms-anthropic',
		'internal-comms-community', 'reference-builder', 'slack-gif-creator'
	)
	"80-marketing-group" = @(
		'ab-test-setup'
	)
	"85-business-group"  = @(
		'dx-optimizer', 'personal-tool-builder', 'app-builder'
	)
	# Grupo de utilidades y agentes
	"99-common-utils"    = @(
		'context-driven-development', 'context-management-context-restore', 'context-management-context-save',
		'context-manager', 'context-window-management', 'behavioral-modes', 'concise-planning',
		'executing-plans', 'planning-with-files', 'file-organizer', 'clean-code',
		'conductor-implement', 'conductor-manage', 'conductor-new-track', 'conductor-revert',
		'conductor-setup', 'conductor-status', 'conductor-validator', 'track-management',
		'core-components', 'browser-automation', 'full-stack-orchestration-full-stack-feature',
		'multi-platform-apps-multi-platform', 'using-superpowers', 'cc-skill-backend-patterns',
		'cc-skill-clickhouse-io', 'cc-skill-coding-standards', 'cc-skill-continuous-learning',
		'cc-skill-frontend-patterns', 'cc-skill-project-guidelines-example', 'cc-skill-strategic-compact',
		'claude-code-guide', 'address-github-comments', 'finishing-a-development-branch',
		'skill-creator', 'skill-developer', 'creador-de-habilidades', 'senior-fullstack',
		'kaizen', 'blockrun', 'loki-mode'
	)
}

$moved = 0
$notFound = 0

foreach ($group in $remainingSkills.Keys) {
	$specialistsPath = Join-Path $basePath "skills\$group\specialists"
	New-Item -Path $specialistsPath -ItemType Directory -Force | Out-Null
    
	foreach ($skill in $remainingSkills[$group]) {
		$source = Join-Path $basePath $skill
		if (Test-Path $source) {
			try {
				$dest = Join-Path $specialistsPath $skill
				Move-Item -Path $source -Destination $dest -Force -ErrorAction Stop
				$moved++
			}
			catch {
				Write-Host "Error: $skill - $_"
			}
		}
		else {
			$notFound++
		}
	}
}

Write-Host "=== Resumen ==="
Write-Host "Skills movidos: $moved"
Write-Host "No encontrados: $notFound"
