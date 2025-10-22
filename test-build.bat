@echo off
echo Testing Next.js Build...
echo.
call npm run build > build-output.txt 2>&1
type build-output.txt
echo.
echo Build output saved to build-output.txt
pause
