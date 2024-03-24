#!/bin/bash

# 현재 디렉토리 이름 가져오기
current_dir=$(basename "$PWD")

# 도커 이미지 빌드
echo "Building $current_dir image..."
docker build -t "$current_dir" .

# 기존에 실행 중인 컨테이너 중지
echo "Stopping and removing existing $current_dir container..."
docker stop "$current_dir" >/dev/null 2>&1

# 도커 컨테이너 실행
echo "Running $current_dir container..."
docker run -d --network host --name "$current_dir" --restart=always "$current_dir"

echo "Done."