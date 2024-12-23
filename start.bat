@echo off
:start
node index
echo Closed. Restarting..
timeout 10 /nobreak
cls
goto start