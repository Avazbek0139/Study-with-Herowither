@echo off
:: Creates a desktop shortcut for Study with HERO
set SCRIPT_DIR=%~dp0
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Study with HERO.lnk
set TARGET_PATH=%SCRIPT_DIR%start.bat
set ICON_INDEX=0

powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%SHORTCUT_PATH%'); $sc.TargetPath = '%TARGET_PATH%'; $sc.WorkingDirectory = '%SCRIPT_DIR%'; $sc.Description = 'Start Study with HERO Dev Server'; $sc.Save()"

echo Desktop shortcut created: %SHORTCUT_PATH%
