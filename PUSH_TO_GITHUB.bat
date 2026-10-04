@echo off
title Push Coffee Cafe to GitHub
cd /d "%~dp0"
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"

echo ======================================================================
echo           COFFEE CAFE - GITHUB UPLOAD HELPER
echo ======================================================================
echo Target Repository: https://github.com/gagansran800/COFFEE-CAFE-
echo Branch: main
echo.
echo Pushing all 82 project files (source code, admin panel, styles, routes)...
echo.

git push coffee main

echo.
echo ======================================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: All project files have been successfully uploaded to GitHub!
) else (
    echo PUSH REQUIRES AUTHENTICATION.
    echo If GitHub asks you to login or enter token, please sign in.
)
echo ======================================================================
echo.
pause
