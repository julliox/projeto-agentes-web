# Script para corrigir problemas de npm install
# Resolve erros de permissao e package-lock.json corrompido
# Encoding: UTF-8 sem BOM

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Correcao de problemas do npm install" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

Write-Host "`nDiretorio do projeto: $projectPath" -ForegroundColor Gray

# 1. Verificar processos que podem estar bloqueando arquivos
Write-Host "`n[1/6] Verificando processos Node.js em execucao..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Encontrados processos Node.js. Finalizando..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "  Processos finalizados" -ForegroundColor Green
} else {
    Write-Host "  Nenhum processo Node.js em execucao" -ForegroundColor Green
}

# Verificar também processos do Cursor/VS Code que possam estar bloqueando
Write-Host "`n[2/6] Verificando processos que podem bloquear arquivos..." -ForegroundColor Yellow
$blockingProcesses = @("Code", "Cursor", "devenv", "msbuild")
foreach ($procName in $blockingProcesses) {
    $procs = Get-Process -Name $procName -ErrorAction SilentlyContinue
    if ($procs) {
        Write-Host "  ATENCAO: Processo $procName encontrado. Considere fecha-lo." -ForegroundColor Yellow
    }
}

# 2. Limpar cache do npm
Write-Host "`n[3/6] Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "  Cache limpo" -ForegroundColor Green

# 3. Remover node_modules usando rimraf (mais eficaz no Windows)
Write-Host "`n[4/6] Removendo node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  Usando rimraf para remocao segura..." -ForegroundColor Gray
    try {
        # Tentar usar rimraf via npx (mais eficaz)
        npx --yes rimraf@latest node_modules 2>&1 | Out-Null
        Start-Sleep -Seconds 2
        
        # Verificar se ainda existe
        if (Test-Path "node_modules") {
            Write-Host "  Tentando remocao manual de pastas problemáticas..." -ForegroundColor Gray
            
            # Remover pastas problemáticas específicas primeiro
            $problemFolders = @(
                "node_modules\karma-jasmine",
                "node_modules\@angular\compiler-cli",
                "node_modules\@angular-devkit",
                "node_modules\@babel"
            )
            
            foreach ($folder in $problemFolders) {
                if (Test-Path $folder) {
                    try {
                        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
                    } catch {
                        # Ignorar erros de pastas específicas
                    }
                }
            }
            
            # Tentar remover o resto
            Start-Sleep -Seconds 1
            Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        if (-not (Test-Path "node_modules")) {
            Write-Host "  node_modules removido com sucesso" -ForegroundColor Green
        } else {
            Write-Host "  AVISO: Algumas pastas podem ainda existir. Continuando..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  AVISO: Erro ao remover node_modules: $_" -ForegroundColor Yellow
        Write-Host "  Continuando mesmo assim..." -ForegroundColor Gray
    }
} else {
    Write-Host "  node_modules nao existe" -ForegroundColor Green
}

# 4. Remover package-lock.json
Write-Host "`n[5/6] Removendo package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "  package-lock.json removido" -ForegroundColor Green
} else {
    Write-Host "  package-lock.json nao existe" -ForegroundColor Green
}

# 5. Configurar npm para evitar problemas de limpeza
Write-Host "`n[6/6] Reinstalando dependencias..." -ForegroundColor Yellow
Write-Host "  Isso pode levar varios minutos..." -ForegroundColor Gray

# Usar flags que evitam o problema ERR_INVALID_ARG_TYPE
# --no-fund e --no-audit reduzem operações que podem causar o erro
# --legacy-peer-deps resolve problemas de dependências
# --prefer-offline evita downloads desnecessários

$env:npm_config_audit = "false"
$env:npm_config_fund = "false"

Write-Host "`n  Executando: npm install --legacy-peer-deps --no-audit --no-fund" -ForegroundColor Gray

npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SUCESSO! npm install concluido!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "`n  Primeira tentativa falhou. Tentando com --force..." -ForegroundColor Yellow
    
    npm install --force --legacy-peer-deps --no-audit --no-fund
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "SUCESSO! npm install concluido (com --force)!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "`n========================================" -ForegroundColor Red
        Write-Host "ERRO: Ainda ha problemas" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "`nTente as seguintes solucoes:" -ForegroundColor Yellow
        Write-Host "  1. Feche TODOS os editores/IDEs (Cursor, VS Code, etc.)" -ForegroundColor White
        Write-Host "  2. Execute este script como Administrador" -ForegroundColor White
        Write-Host "  3. Verifique se ha antivirus bloqueando arquivos" -ForegroundColor White
        Write-Host "  4. Tente usar yarn: yarn install" -ForegroundColor White
        Write-Host "`nLog completo em:" -ForegroundColor Gray
        Write-Host "  $env:LOCALAPPDATA\npm-cache\_logs\" -ForegroundColor Gray
    }
}

Write-Host "`nProcesso concluido!" -ForegroundColor Cyan
