# Script alternativo para corrigir problemas de npm install
# Versao 2 - Usa estrategias mais agressivas
# Encoding: UTF-8 sem BOM

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Correcao AVANCADA de problemas npm" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

# Verificar e atualizar npm
Write-Host "`n[0/7] Verificando versao do npm..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "  Versao atual: $npmVersion" -ForegroundColor Gray

Write-Host "  Atualizando npm para versao mais recente..." -ForegroundColor Yellow
npm install -g npm@latest 2>&1 | Out-Null
$newNpmVersion = npm --version
Write-Host "  Nova versao: $newNpmVersion" -ForegroundColor Green

# 1. Finalizar TODOS os processos relacionados
Write-Host "`n[1/7] Finalizando processos relacionados..." -ForegroundColor Yellow
$processesToKill = @("node", "npm", "nodejs")
foreach ($procName in $processesToKill) {
    $procs = Get-Process -Name $procName -ErrorAction SilentlyContinue
    if ($procs) {
        Write-Host "  Finalizando processos $procName..." -ForegroundColor Gray
        $procs | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 3

# 2. Limpar TODOS os caches
Write-Host "`n[2/7] Limpando caches..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null

# Limpar cache do usuário também
$npmCachePath = "$env:APPDATA\npm-cache"
if (Test-Path $npmCachePath) {
    Write-Host "  Limpando cache do usuario..." -ForegroundColor Gray
    Remove-Item -Path "$npmCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "  Caches limpos" -ForegroundColor Green

# 3. Remover node_modules com metodo mais agressivo
Write-Host "`n[3/7] Removendo node_modules (metodo agressivo)..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    # Primeiro, tentar usar rimraf
    Write-Host "  Tentativa 1: Usando rimraf..." -ForegroundColor Gray
    npx --yes rimraf@latest node_modules 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    
    if (Test-Path "node_modules") {
        Write-Host "  Tentativa 2: Removendo pastas problemáticas individualmente..." -ForegroundColor Gray
        
        # Lista de pastas conhecidas por causar problemas
        $problemFolders = @(
            "node_modules\karma-jasmine",
            "node_modules\@angular",
            "node_modules\@angular-devkit",
            "node_modules\@babel",
            "node_modules\.cache"
        )
        
        foreach ($folder in $problemFolders) {
            $fullPath = Join-Path $projectPath $folder
            if (Test-Path $fullPath) {
                try {
                    # Tentar remover atributos de somente leitura primeiro
                    Get-ChildItem -Path $fullPath -Recurse -Force | ForEach-Object {
                        $_.Attributes = "Normal"
                    }
                    Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
                } catch {
                    # Ignorar erros
                }
            }
        }
        
        Start-Sleep -Seconds 2
        
        # Tentar remover o resto
        if (Test-Path "node_modules") {
            Write-Host "  Tentativa 3: Remocao final..." -ForegroundColor Gray
            Get-ChildItem -Path "node_modules" -Recurse -Force | ForEach-Object {
                $_.Attributes = "Normal"
            }
            Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "  node_modules removido com sucesso" -ForegroundColor Green
    } else {
        Write-Host "  AVISO: Algumas pastas podem ainda existir" -ForegroundColor Yellow
        Write-Host "  Continuando mesmo assim..." -ForegroundColor Gray
    }
}

# 4. Remover package-lock.json
Write-Host "`n[4/7] Removendo package-lock.json..." -ForegroundColor Yellow
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Write-Host "  Removido" -ForegroundColor Green

# 5. Configurar npm para evitar problemas
Write-Host "`n[5/7] Configurando npm..." -ForegroundColor Yellow
$env:npm_config_audit = "false"
$env:npm_config_fund = "false"
$env:npm_config_progress = "false"
Write-Host "  Configurado" -ForegroundColor Green

# 6. Instalar com configurações otimizadas
Write-Host "`n[6/7] Instalando dependencias..." -ForegroundColor Yellow
Write-Host "  Isso pode levar varios minutos..." -ForegroundColor Gray

# Usar flags que minimizam problemas
$installArgs = @(
    "install",
    "--legacy-peer-deps",
    "--no-audit",
    "--no-fund",
    "--prefer-offline",
    "--loglevel=error"
)

Write-Host "  Comando: npm $($installArgs -join ' ')" -ForegroundColor Gray
& npm $installArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SUCESSO! Instalacao concluida!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
}

# 7. Se falhou, tentar com yarn como alternativa
Write-Host "`n[7/7] npm falhou. Tentando com YARN como alternativa..." -ForegroundColor Yellow

# Verificar se yarn está instalado
$yarnInstalled = Get-Command yarn -ErrorAction SilentlyContinue
if (-not $yarnInstalled) {
    Write-Host "  Yarn nao esta instalado. Instalando..." -ForegroundColor Yellow
    npm install -g yarn 2>&1 | Out-Null
}

if (Get-Command yarn -ErrorAction SilentlyContinue) {
    Write-Host "  Usando YARN para instalar dependencias..." -ForegroundColor Yellow
    yarn install --ignore-engines
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "SUCESSO! Instalacao concluida com YARN!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`nNOTA: Projeto agora usa YARN. Use 'yarn' em vez de 'npm'." -ForegroundColor Yellow
        exit 0
    }
}

# Se tudo falhou
Write-Host "`n========================================" -ForegroundColor Red
Write-Host "ERRO: Nao foi possivel instalar dependencias" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host "`nSolucoes adicionais:" -ForegroundColor Yellow
Write-Host "  1. Feche TODOS os programas (Cursor, VS Code, navegadores)" -ForegroundColor White
Write-Host "  2. Execute como Administrador" -ForegroundColor White
Write-Host "  3. Desative temporariamente o antivirus" -ForegroundColor White
Write-Host "  4. Tente em um novo terminal" -ForegroundColor White
Write-Host "  5. Verifique o log: $env:LOCALAPPDATA\npm-cache\_logs\" -ForegroundColor White
exit 1
