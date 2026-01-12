@echo off
setlocal

:: === Tor Browser Speed Optimization Script ===
:: Created by ChatGPT (for Windows users)

echo --------------------------------------------------
echo   ⚡ Optimizing Tor Browser Speed Configuration...
echo --------------------------------------------------

:: Detect Tor Browser installation path (Default)
set "TOR_DIR=%USERPROFILE%\Desktop\Tor Browser\Browser\TorBrowser\Data\Tor"
if not exist "%TOR_DIR%\torrc" (
    echo ❌ torrc file not found at the default location.
    echo Please enter your Tor 'Data\Tor' folder path manually:
    set /p TOR_DIR="Path: "
)

:: Check again
if not exist "%TOR_DIR%\torrc" (
    echo ❌ torrc file not found. Exiting...
    pause
    exit /b
)

:: Backup existing torrc
echo 📦 Backing up current torrc...
copy "%TOR_DIR%\torrc" "%TOR_DIR%\torrc_backup_%date:~-4%%date:~4,2%%date:~7,2%.bak" >nul

:: Write optimized configuration
(
echo #####################################################
echo # Optimized Tor Configuration for Speed - Scholarpeak
echo # Created: %date% %time%
echo #####################################################
echo.
echo # Prefer faster, high-bandwidth, and stable nodes
echo EntryNodes {us},{de},{nl},{fr},{ca}
echo ExitNodes {us},{de},{nl},{fr},{ca}
echo StrictNodes 0
echo ExcludeNodes {cn},{ru},{ir},{kp}
echo.
echo # Improve circuit build performance
echo FastFirstHopPK 1
echo NumEntryGuards 4
echo NewCircuitPeriod 30
echo MaxCircuitDirtiness 600
echo.
echo # Connection Optimizations
echo GeoIPExcludeUnknown 1
echo AvoidDiskWrites 1
echo CircuitStreamTimeout 60
echo.
echo # Logging (optional - comment if not needed)
echo Log notice stdout
) > "%TOR_DIR%\torrc"

echo ✅ New optimized torrc file written successfully!

:: Optionally restart Tor Browser
echo.
set /p restartChoice="Do you want to restart Tor Browser now? (Y/N): "
if /i "%restartChoice%"=="Y" (
    echo 🔁 Restarting Tor Browser...
    taskkill /IM firefox.exe /F >nul 2>&1
    start "" "%USERPROFILE%\Desktop\Tor Browser\Start Tor Browser.lnk"
    echo Tor Browser restarted.
) else (
    echo ℹ️ Please restart Tor Browser manually for changes to take effect.
)

echo --------------------------------------------------
echo ✅ Tor optimization complete! Enjoy faster .onion browsing.
echo --------------------------------------------------
pause
exit /b
