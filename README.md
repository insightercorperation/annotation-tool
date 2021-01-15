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
# markcloud-annotation_server 이미지를 가지는 컨테이너에 접속
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

## 배포하기

> 미리 DB, table, user, 권한부여가 진행되어야 테이블을 생성할 수 있습니다.

1. ssh 접속
2. 최신 코드 가져오기
3. `.env` 파일 준비
4. `./serve_production.sh {scale}`

## 배포용 docker-compose (docker-compose-prod.yml)

배표용 compose 파일은 테스트와 달리 nginx를 사용하고 `.env` 파일을
활용해서 환경변수를 설정해 주어야 함.

`.env` 파일 설명
(docker-compose-prod.yml과 같은 위치)

(상세 내용은 관리자에게 따로 문의)

- DB_HOST: 데이터 베이스 호스트
- DB_PORT: 데이터 베이스 포트
- DB_NAME: 데이터 베이스 이름
- DB_USER: 데이터 베이스 사용자
- DB_PASSWORD: 데이터 베이스 비밀번호
- ADMIN_PASSWORD: 웹 관리자 비밀번호
