## annotation 데이터 추출 [python 3.x]

### Docker 파일 필드

```bash
docker build -t markcloud-data-env:0.0.1 -f Dockerfile .
```

### 도커 환경 실행

```bash
docker run -v $(pwd):/app -it markcloud-data-env:0.0.1 /bin/bash
```

### 이슈

- 비엔나 코드가 없는경우 어떻게 처리해야 하는가?
- 다중 비엔나코드에 대한 구분자 '|'
- docker 실행시 메모리 부족 현상

### 사용 방법

**0) input 파일 다운로드**
`{project_root}/src/input`아래에서 키프리스 원본 데이터 파일을 다운받습니다.

```bash
curl https://www.dropbox.com/s/ldzzhe8h1ti9l12/biblography.csv\?dl\=0 -L -o biblography.csv
```

[중간산출물 추출]
python data_processing.py ./data/ biblography.csv

[최종결과물 추출]
python extract.py ./output/ biblo.csv

### 중간 산출물 (biblio.csv)

비엔나 코드가 존재하는 상표 목록을 추출
(비엔나코드 6자리를 3등분함)

- main: [0:2]
- mid: 비엔나코드 중간 2리 번호 [2:4]
- sub: 비엔나코드 마지막 2자리 [4:6]
- applicationNumber: 출원번호(국제번호)
- status: 상표 상태
- link: 상표 이미지

### 최종 결과물 (main_01_130256.csv)

main별 데이터 저장 (mid, sub 기준 정렬)
main별 이미지 갯수 추출

- main: [0:2]
- mid: 비엔나코드 중간 2리 번호 [2:4]
- sub: 비엔나코드 마지막 2자리 [4:6]
- applicationNumber: 출원번호(국제번호)
- status: 상표 상태
- link: 상표 이미지
