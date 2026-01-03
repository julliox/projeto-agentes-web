# Script PowerShell para finalizar processos Angular de forma inteligente
param(
    [switch]$Force,
    [switch]$KillAll
)

Write-Host "🔍 Procurando processos Angular..." -ForegroundColor Yellow

# Função para finalizar processo de forma segura
function Stop-ProcessSafely {
    param($ProcessId, $ProcessName)
    
    try {
        $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "🔄 Finalizando $ProcessName (PID: $ProcessId)..." -ForegroundColor Cyan
            
            if ($Force) {
                Stop-Process -Id $ProcessId -Force
                Write-Host "✅ Processo $ProcessName finalizado forçadamente" -ForegroundColor Green
            } else {
                # Tentar finalização suave primeiro
                $process.CloseMainWindow() | Out-Null
                Start-Sleep -Seconds 2
                
                if (!$process.HasExited) {
                    Stop-Process -Id $ProcessId -Force
                    Write-Host "⚠️ Processo $ProcessName finalizado forçadamente" -ForegroundColor Yellow
                } else {
                    Write-Host "✅ Processo $ProcessName finalizado suavemente" -ForegroundColor Green
                }
            }
        }
    } catch {
        Write-Host "❌ Erro ao finalizar processo $ProcessId: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Finalizar processos na porta 4200 (Angular Dev Server)
$port4200 = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue
if ($port4200) {
    foreach ($conn in $port4200) {
        Stop-ProcessSafely -ProcessId $conn.OwningProcess -ProcessName "Angular Dev Server (Port 4200)"
    }
} else {
    Write-Host "ℹ️ Nenhum processo encontrado na porta 4200" -ForegroundColor Blue
}

# Finalizar processos na porta 24678 (HMR)
$portHMR = Get-NetTCPConnection -LocalPort 24678 -ErrorAction SilentlyContinue
if ($portHMR) {
    foreach ($conn in $portHMR) {
        Stop-ProcessSafely -ProcessId $conn.OwningProcess -ProcessName "HMR Server (Port 24678)"
    }
} else {
    Write-Host "ℹ️ Nenhum processo encontrado na porta 24678" -ForegroundColor Blue
}

# Finalizar processos Node.js relacionados ao Angular
if ($KillAll) {
    Write-Host "🗑️ Finalizando todos os processos Node.js..." -ForegroundColor Red
    
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        $processInfo = $_.ProcessName + " (PID: $($_.Id))"
        Stop-ProcessSafely -ProcessId $_.Id -ProcessName $processInfo
    }
    
    Get-Process -Name "ng" -ErrorAction SilentlyContinue | ForEach-Object {
        $processInfo = $_.ProcessName + " (PID: $($_.Id))"
        Stop-ProcessSafely -ProcessId $_.Id -ProcessName $processInfo
    }
} else {
    # Finalizar apenas processos Angular específicos
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "node" -and 
        (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -like "*ng serve*"
    } | ForEach-Object {
        Stop-ProcessSafely -ProcessId $_.Id -ProcessName "Angular Node Process"
    }
}

# Limpar cache temporário
Write-Host "🧹 Limpando cache temporário..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cache limpo" -ForegroundColor Green
}

Write-Host "🎉 Finalização concluída!" -ForegroundColor Green

# Aguardar um pouco para garantir que tudo foi finalizado
Start-Sleep -Seconds 2

# Verificar se ainda há processos rodando
$remainingProcesses = @()
$remainingProcesses += Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue
$remainingProcesses += Get-NetTCPConnection -LocalPort 24678 -ErrorAction SilentlyContinue

if ($remainingProcesses.Count -gt 0) {
    Write-Host "⚠️ Ainda há processos rodando:" -ForegroundColor Yellow
    $remainingProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.OwningProcess) na porta $($_.LocalPort)" -ForegroundColor Yellow
    }
    Write-Host "💡 Use -Force para finalização forçada" -ForegroundColor Cyan
} else {
    Write-Host "✅ Todos os processos foram finalizados com sucesso!" -ForegroundColor Green
}

