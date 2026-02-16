@echo off

echo.
echo +_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
echo +  RAG Model - Chess Coaching System  +
echo _  Starting Backend and Frontend...   _
echo +_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
echo.


start "RAG Frontend - Next.js" cmd /k "cd /d %CD%\rag && npm run dev"
echo.
echo +_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
echo +          Server Starting            +
echo +_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
echo.
echo.echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo GraphQL:  http://localhost:8080/
echo.
echo Both terminal windows have been opened.
echo Close them when you want to stop the services.
echo.

pause
