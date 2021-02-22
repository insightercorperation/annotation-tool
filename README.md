# Insighter Annotation Tool

이미지에 라벨링 작업을 할 수 있는 웹 어플리케이션입니다.

## Development

### 개발용 docker-compose (docker-compose.yml)

`docker-compose up` 활용해서 `db`이미지와 `server` 이미지를 같이 구동합니다.
`server` 이미지는 서버를 바로 구동하지 않고 node환경만 마련합니다. 따라서 서버 이미지에 접속해서 의존성 설치 및 DB 테이블 생성이 필요합니다.

```bash
# docker images 구동
docker-compose up

# docker server image 상태 확인
docker ps

# 새로운 터미널에서 서버 컨테이너 접속
# annotation-tool_server 이미지를 가지는 컨테이너에 접속
docker attach {containerID}

# (만약에 설치를 하지 않은 경우에만) 의존성 설치
# 이미 설치를 한 경우 node_modules 포함한 모든 프로젝트 경로가 mount되어 있기에 추가 설치 불필요.
# 단, 이미 node_modules 있다면 삭제 후 다시 설치해야 함
yarn install
cd server && yarn install && cd ..
cd client && yarn install && cd ..

# (테이블 생성하지 않은 경우) 테이블 생성
# 테이블 제거 시에는 `create` 대신 `drop`
./manage_table.sh create

# 개발용 웹 서버와 API 서버 구동
yarn dev

# 로컬 서버 접속
# 만약 개발 서버의 포트 번호를 바꾸려면
# docker-compose.yml 파일과 .env.dev 모두 바꿔야 함
http://localhost:3001
```
