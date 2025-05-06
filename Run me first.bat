@echo off
setlocal

:: Define Python installer URL and install directory
set PYTHON_URL=https://www.python.org/ftp/python/3.12.2/python-3.12.2-amd64.exe
set PYTHON_INSTALLER=python-installer.exe
set VENV_DIR=env

:: Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python not found. Downloading and installing...
    curl -o %PYTHON_INSTALLER% %PYTHON_URL%
    start /wait %PYTHON_INSTALLER% /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del %PYTHON_INSTALLER%
) else (
    echo Python is already installed.
)

:: Refresh environment variables
call refreshenv >nul 2>nul

:: Create virtual environment
python -m venv %VENV_DIR%

:: Activate virtual environment
call %VENV_DIR%\Scripts\activate.bat

:: Upgrade pip and install required libraries
python -m pip install --upgrade pip
pip install flask flask-cors psycopg2-binary

echo All required packages are installed.
echo Now run the app.py file to start the API
pause
