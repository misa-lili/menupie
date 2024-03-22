#!/bin/bash

# 현재 스크립트가 실행되는 디렉토리를 설정합니다.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# systemd 서비스 파일 이름을 현재 폴더 이름을 기반으로 설정합니다.
SERVICE_NAME=$(basename "$(pwd)")
SERVICE_FILE=$SERVICE_NAME.service

# 서비스를 중지하고 비활성화합니다.
echo "Stopping and disabling $SERVICE_FILE..."
sudo systemctl stop $SERVICE_FILE
sudo systemctl disable $SERVICE_FILE

# 생성된 systemd 서비스 파일을 제거합니다.
echo "Removing systemd service file..."
sudo rm /etc/systemd/system/$SERVICE_FILE

# systemd 데몬을 리로드합니다.
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

echo "$SERVICE_NAME Service has been successfully removed."
