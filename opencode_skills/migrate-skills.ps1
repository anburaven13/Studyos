# Script de migración de Skills al Conglomerado
# ==============================================
# Este script mueve todos los skills existentes a sus grupos correspondientes

$basePath = Resolve-Path (Join-Path $PSScriptRoot "..")

# Definición de skills por grupo
$skillGroups = @{
    "10-backend-group" = @(
        'backend-architect', 'backend-dev-guidelines', 'api-design-principles', 'api-patterns',
        'fastapi-pro', 'fastapi-templates', 'nestjs-expert', 'django-pro', 'graphql-architect',
        'graphql', 'database-architect', 'database-design', 'database-admin', 'database-migration',
        'database-optimizer', 'postgres-best-practices', 'postgresql', 'sql-optimization-patterns',
        'sql-pro', 'prisma-expert', 'cqrs-implementation', 'event-sourcing-architect',
        'event-store-design', 'saga-orchestration', 'projection-patterns', 'microservices-patterns',
        'nodejs-backend-patterns', 'nodejs-best-practices', 'dotnet-backend-patterns', 'dotnet-architect',
        'golang-pro', 'python-pro', 'java-pro', 'csharp-pro', 'elixir-pro', 'ruby-pro', 'scala-pro',
        'haskell-pro', 'async-python-patterns', 'auth-implementation-patterns', 'bullmq-specialist',
        'payment-integration', 'paypal-integration', 'stripe-integration', 'email-systems',
        'workflow-orchestration-patterns', 'workflow-patterns'
    )
    "20-frontend-group" = @(
        'frontend-developer', 'frontend-dev-guidelines', 'frontend-design', 'react-best-practices',
        'react-patterns', 'react-state-management', 'react-ui-patterns', 'react-modernization',
        'nextjs-best-practices', 'nextjs-app-router-patterns', 'nextjs-supabase-auth',
        'tailwind-design-system', 'tailwind-patterns', 'javascript-mastery', 'javascript-pro',
        'javascript-testing-patterns', 'typescript-expert', 'typescript-pro', 'typescript-advanced-types',
        'modern-javascript-patterns', 'ui-ux-designer', 'ui-ux-pro-max', 'ui-visual-validator',
        'accessibility-compliance-accessibility-audit', 'wcag-audit-patterns', 'screen-reader-testing',
        'mobile-design', 'flutter-expert', 'react-native-architecture', 'ios-developer', 'mobile-developer',
        'angular-migration', 'vue-patterns', 'web-design-guidelines', 'web-performance-optimization',
        'animation-patterns', 'scroll-experience', 'canvas-design', 'interactive-portfolio',
        '3d-web-experience', 'theme-factory', 'browser-extension-builder', 'clerk-auth'
    )
    "30-devops-group" = @(
        'devops-troubleshooter', 'deployment-engineer', 'deployment-pipeline-design', 'deployment-procedures',
        'docker-expert', 'kubernetes-architect', 'k8s-manifest-generator', 'k8s-security-policies',
        'helm-chart-scaffolding', 'terraform-specialist', 'terraform-module-library', 'aws-serverless',
        'aws-penetration-testing', 'azure-functions', 'gcp-cloud-run', 'cloud-architect', 'multi-cloud-architecture',
        'hybrid-cloud-architect', 'hybrid-cloud-networking', 'gitops-workflow', 'github-actions-templates',
        'github-workflow-automation', 'gitlab-ci-patterns', 'cicd-automation-workflow-automate',
        'observability-engineer', 'observability-monitoring-monitor-setup', 'observability-monitoring-slo-implement',
        'prometheus-configuration', 'grafana-dashboards', 'distributed-tracing', 'service-mesh-expert',
        'service-mesh-observability', 'istio-traffic-management', 'linkerd-patterns', 'slo-implementation',
        'incident-runbook-templates', 'on-call-handoff-patterns', 'postmortem-writing', 'server-management',
        'linux-shell-scripting', 'bash-linux', 'bash-pro', 'bash-defensive-patterns', 'posix-shell-pro',
        'powershell-windows', 'network-engineer', 'network-101', 'bazel-build-optimization',
        'monorepo-architect', 'monorepo-management', 'nx-workspace-patterns', 'turborepo-caching',
        'vercel-deployment', 'neon-postgres', 'firebase', 'upstash-qstash', 'inngest', 'trigger-dev'
    )
    "40-security-group" = @(
        'security-auditor', 'backend-security-coder', 'frontend-security-coder', 'mobile-security-coder',
        'pentest-checklist', 'pentest-commands', 'vulnerability-scanner', 'sql-injection-testing',
        'xss-html-injection', 'html-injection-testing', 'broken-authentication', 'idor-testing',
        'file-path-traversal', 'file-uploads', 'threat-modeling-expert', 'threat-mitigation-mapping',
        'stride-analysis-patterns', 'attack-tree-construction', 'security-requirement-extraction',
        'gdpr-data-handling', 'pci-compliance', 'security-compliance-compliance-check', 'secrets-management',
        'mtls-configuration', 'red-team-tactics', 'red-team-tools', 'incident-responder',
        'incident-response-incident-response', 'incident-response-smart-fix', 'memory-forensics',
        'malware-analyst', 'firmware-analyst', 'reverse-engineer', 'binary-analysis-patterns',
        'anti-reversing-techniques', 'protocol-reverse-engineering', 'privilege-escalation-methods',
        'linux-privilege-escalation', 'windows-privilege-escalation', 'active-directory-attacks',
        'cloud-penetration-testing', 'wordpress-penetration-testing', 'burp-suite-testing',
        'metasploit-framework', 'sqlmap-database-pentesting', 'shodan-reconnaissance',
        'wireshark-analysis', 'scanning-tools', 'ethical-hacking-methodology', 'api-security-best-practices',
        'api-fuzzing-bug-bounty', 'top-web-vulnerabilities', 'sast-configuration',
        'security-scanning-security-dependencies', 'security-scanning-security-hardening',
        'security-scanning-security-sast', 'solidity-security', 'nft-standards', 'web3-testing',
        'defi-protocol-templates', 'blockchain-developer', 'memory-safety-patterns', 'shellcheck-configuration',
        'smtp-penetration-testing', 'ssh-penetration-testing'
    )
    "50-data-ml-group" = @(
        'data-engineer', 'data-scientist', 'data-storytelling', 'data-quality-frameworks',
        'dbt-transformation-patterns', 'spark-optimization', 'airflow-dag-patterns',
        'ml-engineer', 'mlops-engineer', 'ml-pipeline-workflow', 'machine-learning-ops-ml-pipeline',
        'backtesting-frameworks', 'ai-engineer', 'ai-agents-architect', 'autonomous-agents',
        'autonomous-agent-patterns', 'computer-use-agents', 'parallel-agents', 'dispatching-parallel-agents',
        'agent-evaluation', 'agent-memory-systems', 'agent-memory-mcp', 'agent-manager-skill',
        'agent-orchestration-improve-agent', 'agent-orchestration-multi-agent-optimize', 'agent-tool-builder',
        'langchain-architecture', 'langgraph', 'langfuse', 'crewai', 'rag-engineer', 'rag-implementation',
        'embedding-strategies', 'vector-database-engineer', 'vector-index-tuning', 'hybrid-search-implementation',
        'similarity-search-patterns', 'prompt-engineer', 'prompt-engineering', 'prompt-engineering-patterns',
        'prompt-library', 'prompt-caching', 'llm-evaluation', 'llm-app-patterns',
        'llm-application-dev-ai-assistant', 'llm-application-dev-langchain-agent',
        'llm-application-dev-prompt-optimize', 'voice-agents', 'voice-ai-development',
        'quant-analyst', 'risk-metrics-calculation'
    )
    "60-testing-group" = @(
        'test-automator', 'test-driven-development', 'test-fixing', 'testing-patterns', 'tdd-workflow',
        'tdd-orchestrator', 'tdd-workflows-tdd-cycle', 'tdd-workflows-tdd-green', 'tdd-workflows-tdd-red',
        'tdd-workflows-tdd-refactor', 'playwright-skill', 'e2e-testing-patterns', 'webapp-testing',
        'javascript-testing-patterns', 'python-testing-patterns', 'bats-testing-patterns',
        'go-concurrency-patterns', 'rust-async-patterns', 'code-review-excellence', 'code-reviewer',
        'code-review-checklist', 'code-review-ai-ai-review', 'requesting-code-review', 'receiving-code-review',
        'comprehensive-review-full-review', 'comprehensive-review-pr-enhance', 'performance-testing-review-ai-review',
        'performance-testing-review-multi-agent-review', 'debugger', 'systematic-debugging',
        'debugging-strategies', 'debugging-toolkit-smart-debug', 'error-detective', 'error-handling-patterns',
        'error-debugging-error-analysis', 'error-debugging-error-trace', 'error-debugging-multi-agent-review',
        'error-diagnostics-error-analysis', 'error-diagnostics-error-trace', 'error-diagnostics-smart-debug',
        'distributed-debugging-debug-trace', 'performance-engineer', 'performance-profiling',
        'application-performance-performance-optimization', 'python-performance-optimization',
        'unit-testing-test-generate', 'api-testing-observability-api-mock'
    )
    "70-docs-group" = @(
        'docs-architect', 'api-documenter', 'api-documentation-generator', 'openapi-spec-generation',
        'documentation-generation-doc-generate', 'documentation-templates', 'code-documentation-code-explain',
        'code-documentation-doc-generate', 'mermaid-expert', 'c4-architecture-c4-architecture',
        'c4-context', 'c4-container', 'c4-component', 'c4-code', 'architecture-decision-records',
        'architecture-patterns', 'architecture', 'software-architecture', 'senior-architect',
        'architect-review', 'tutorial-engineer', 'content-creator', 'copy-editing', 'copywriting',
        'writing-skills', 'writing-plans', 'plan-writing', 'doc-coauthoring', 'notebooklm',
        'pdf-official', 'docx-official', 'pptx-official', 'xlsx-official'
    )
    "80-marketing-group" = @(
        'seo-fundamentals', 'seo-audit', 'seo-keyword-strategist', 'seo-content-writer',
        'seo-content-planner', 'seo-content-auditor', 'seo-content-refresher', 'seo-meta-optimizer',
        'seo-structure-architect', 'seo-cannibalization-detector', 'seo-snippet-hunter',
        'seo-authority-builder', 'schema-markup', 'programmatic-seo', 'analytics-tracking',
        'segment-cdp', 'kpi-dashboard-design', 'app-store-optimization', 'page-cro', 'form-cro',
        'signup-flow-cro', 'onboarding-cro', 'popup-cro', 'paywall-upgrade-cro', 'free-tool-strategy',
        'viral-generator-builder', 'content-marketer', 'marketing-ideas', 'marketing-psychology',
        'paid-ads', 'social-content', 'email-sequence', 'referral-program', 'launch-strategy',
        'top-reddit', 'hubspot-integration', 'geo-fundamentals', 'i18n-localization'
    )
    "85-business-group" = @(
        'business-analyst', 'startup-analyst', 'startup-financial-modeling', 'startup-metrics-framework',
        'startup-business-analyst-business-case', 'startup-business-analyst-financial-projections',
        'startup-business-analyst-market-opportunity', 'competitive-landscape', 'competitor-alternatives',
        'market-sizing-analysis', 'product-manager-toolkit', 'pricing-strategy', 'cost-optimization',
        'micro-saas-launcher', 'ai-product', 'ai-wrapper-product', 'legal-advisor', 'hr-pro',
        'employment-contract-templates', 'team-composition-analysis', 'team-collaboration-issue',
        'team-collaboration-standup-notes', 'billing-automation', 'risk-manager', 'brainstorming',
        'notion-template-business', 'sales-automator', 'customer-support', 'research-engineer'
    )
}

# Contadores
$moved = 0
$notFound = 0
$errors = @()

# Crear directorios y mover skills
foreach ($group in $skillGroups.Keys) {
    $specialistsPath = Join-Path $basePath "skills\$group\specialists"
    New-Item -Path $specialistsPath -ItemType Directory -Force | Out-Null
    
    foreach ($skill in $skillGroups[$group]) {
        $source = Join-Path $basePath $skill
        if (Test-Path $source) {
            try {
                $dest = Join-Path $specialistsPath $skill
                Move-Item -Path $source -Destination $dest -Force -ErrorAction Stop
                $moved++
            } catch {
                $errors += "Error moviendo $skill : $_"
            }
        } else {
            $notFound++
        }
    }
}

Write-Host "=== Resumen de Migracion ==="
Write-Host "Skills movidos: $moved"
Write-Host "Skills no encontrados: $notFound"
Write-Host "Errores: $($errors.Count)"

if ($errors.Count -gt 0) {
    Write-Host "`n=== Errores ==="
    $errors | ForEach-Object { Write-Host $_ }
}
