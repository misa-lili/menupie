#!/bin/bash

# 현재 디렉토리 이름 가져오기
current_dir=$(basename "$PWD")

# 도커 이미지 빌드
docker build -t "$current_dir" .

# 도커 컨테이너 실행
docker run -d --network host --name "$current_dir" --restart=always "$current_dir"