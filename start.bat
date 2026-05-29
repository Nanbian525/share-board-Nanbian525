@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [提示] 未检测到可用的 Python。
    echo 请从 https://www.python.org/downloads/ 安装 Python 3，
    echo 安装时勾选 "Add python.exe to PATH"。
    echo.
    pause
    exit /b 1
)

echo 正在安装依赖（首次运行可能需要片刻）...
python -m pip install -r requirements.txt -q
if errorlevel 1 (
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
)

echo.
echo 启动分享墙...
start http://localhost:3000
python app.py
