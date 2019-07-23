@echo off

title webParanoia Setup

echo Installing packages...

echo.
call npm install

echo.
echo Packages installed.

echo.
echo Installing client packages...

echo.
cd client_src
call npm install

echo.
echo Client packages installed.

echo.
echo Installing gulp...

echo.
call npm install -g gulp-cli

echo.
echo Gulp installed.

echo.
echo Running gulp...

echo.
call gulp

echo.
echo Done. Start a server by running start_server.bat

echo.
pause