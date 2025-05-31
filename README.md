# 칸반보드 봇

Discord에서 간단한 일정관리를 할 수 있는 칸반보드 봇입니다.

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. config.json에서 봇 토큰 설정

3. 봇 실행
```bash
npm start
```

## 명령어

### 보드 관리
- `/kanban create [보드명]` - 새 칸반보드 생성
- `/kanban show [보드명]` - 보드 현황 표시
- `/kanban list` - 모든 보드 목록 표시
- `/kanban delete [보드명]` - 보드 삭제

### 태스크 관리
- `/task add [보드명] [제목] [설명] [@담당자]` - 새 태스크 추가
- `/task move [보드명] [태스크] [컬럼]` - 태스크 이동 (할일/진행중/완료)
- `/task show [보드명] [태스크]` - 태스크 상세 정보
- `/task delete [보드명] [태스크]` - 태스크 삭제

## 사용 예시

```
kanban create 웹개발프로젝트
task add 웹개발프로젝트 "로그인기능구현" "사용자 인증 시스템 개발" @개발자
task move 웹개발프로젝트 로그인기능구현현 진행중
kanban show 웹개발프로젝트
```

## 데이터 저장

모든 데이터는 `./data/[서버ID]/boards.json` 파일에 로컬로 저장됩니다.