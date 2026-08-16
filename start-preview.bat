@echo off
REM ---------------------------------------------------------------
REM  Opens the portfolio in your browser without needing Node.js.
REM  Double-click this file. Close the window to stop the server.
REM ---------------------------------------------------------------
cd /d "%~dp0"
echo.
echo   Starting local preview at http://127.0.0.1:5500/preview.html
echo   Keep this window open. Press Ctrl+C or close it to stop.
echo.
start "" http://127.0.0.1:5500/preview.html
python -m http.server 5500 --bind 127.0.0.1
