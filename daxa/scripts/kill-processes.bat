@echo off
echo Finalizando processos Angular...

REM Finalizar processos na porta 4200
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do (
    echo Finalizando processo PID: %%a
    taskkill /PID %%a /F
)

REM Finalizar processos na porta 24678 (HMR)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :24678') do (
    echo Finalizando processo HMR PID: %%a
    taskkill /PID %%a /F
)

REM Finalizar processos Node.js relacionados ao Angular
taskkill /IM node.exe /F 2>nul
taskkill /IM ng.exe /F 2>nul

REM Finalizar processos esbuild
taskkill /IM esbuild.exe /F 2>nul

echo Processos finalizados com sucesso!
pause

