#!/bin/bash

# 현재 스크립트가 실행되는 디렉토리를 설정합니다.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# npm이 이미 설치되어 있는지 확인합니다.
if ! command -v npm &> /dev/null
then
    echo "npm could not be found, please install Node.js and npm first."
    exit 1
else
    echo "npm is already installed."
fi

# 의존성을 설치합니다.
echo "Installing dependencies with bun..."
npm install

# 프로젝트를 컴파일합니다.
echo "Compiling project with bun..."
npm run build 

# systemd 서비스 파일을 동적으로 생성합니다.
SERVICE_NAME=$(basename "$(pwd)")
SERVICE_FILE=$SERVICE_NAME.service
echo "Creating systemd service file..."
cat <<EOF >$SERVICE_FILE
[Unit]
Description=$SERVICE_NAME

[Service]
ExecStart=$DIR/$SERVICE_NAME
Restart=always
User=$(whoami)
Group=$(id -gn $(whoami))
EnvironmentFile=$DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# 생성된 systemd 서비스 파일을 등록합니다.
echo "Registering systemd service..."
sudo cp "$DIR/$SERVICE_FILE" /etc/systemd/system/

# systemd 데몬을 리로드하고 서비스를 시작합니다.
echo "Reloading systemd daemon and enabling the service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_FILE
sudo systemctl restart $SERVICE_FILE

# 사용자에게 서비스 상태를 수동으로 확인하라는 메시지를 표시합니다.
echo "$SERVICE_NAME Service setup completed."
echo ""
echo "To check the status of the service,"
echo "run:"
echo ""
echo "sudo systemctl status $SERVICE_FILE"
echo ""
echo "Press Ctrl+C to return to the prompt after reviewing the service status."
