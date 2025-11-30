# MemePot - DeFi No-Loss Lottery Platform

> Trust + Safety + Fun: A decentralized no-loss lottery platform where users earn yield while having a chance to win prizes

## Project Vision

**MemePot: 신뢰, 안전, 재미가 공존하는 새로운 DeFi 문화**

MemePot은 PoolTogether의 Cabana DApp과 유사한 **무손실 복권(No-Loss Lottery)** 모델을 기반으로 하며, Memecore 체인을 활용하여 신뢰, 안전, 재미가 공존하는 새로운 DeFi 문화를 구축하고자 합니다.

### 미션 (Mission)

MemePot은 단순한 DeFi를 넘어섭니다. 우리는 Memecore 재단의 가치를 계승하여 DeFi 문화의 일부로 자리 잡기를 원합니다. 장기적으로 **신뢰할 수 있고 재미있는(Trustworthy and Fun) DeFi의 미래**를 함께 만들어 나가는 것이 목표입니다.

### 핵심 가치 (Core Values)

MemePot은 네 가지 핵심 가치에 기반하여 설계 및 운영됩니다:

| 가치               | 설명                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| **신뢰 (Trust)**   | 과장된 수익률이 아닌 **현실성 있는 APY**로 장기적인 보상 모델을 구축하고 투명하게 운영 |
| **안전 (Safety)**  | 자금 탈취 방지 및 **원금 보장(No-Loss Model)**을 최우선 목표로 설정                    |
| **재미 (Fun)**     | 24시간 365일 열리는 **상시 이벤트 개념**의 이벤트 풀로 지속적 보상 기회 제공           |
| **문화 (Culture)** | 신뢰와 안전을 목표로 삼고 재미 요소를 더해 Memecore 재단의 가치를 계승                 |

## Technical Architecture

### Tech Stack

| 계층                | 기술                            | 목적                                   |
| ------------------- | ------------------------------- | -------------------------------------- |
| **블록체인**        | Memecore Chain (EVM-compatible) | 스마트 컨트랙트 & 토큰 관리            |
| **스마트 컨트랙트** | Solidity + Hardhat + Foundry    | 무손실 복권 로직 구현                  |
| **프론트엔드**      | Next.js 15 (App Router)         | 최신 React UI with Server Components   |
| **블록체인 통합**   | Wagmi + RainbowKit              | 매끄러운 지갑 연결 & 컨트랙트 상호작용 |
| **스타일링**        | Tailwind CSS                    | 반응형 디자인 + 연금술적 미학          |
| **상태 관리**       | React Hooks                     | 가벼운 컴포넌트 단위 상태 관리         |
| **빌드 시스템**     | Yarn Monorepo                   | 다중 패키지 조율                       |
| **품질 관리**       | ESLint + TypeScript + Prettier  | 코드 품질 및 타입 안전성 보장          |
| **배포**            | Vercel + IPFS                   | 클라우드 & 분산 저장소 지원            |

### Monorepo 구조 (Structure)

```
packages/
├── hardhat/           # 스마트 컨트랙트 계층
│   ├── contracts/     # Solidity 스마트 컨트랙트
│   ├── deploy/        # 배포 스크립트
│   ├── test/          # 컨트랙트 단위 테스트
│   └── scripts/       # 유틸리티 스크립트 (ABI 생성 등)
│
└── nextjs/            # 프론트엔드 계층
    ├── app/           # Next.js 15 App Router 페이지
    │   ├── /          # 랜딩 페이지 (Ready)
    │   ├── /about     # 프로젝트 정보
    │   ├── /vaults    # Vault 풀 목록
    │   ├── /prizes    # 이벤트 풀 쇼케이스 (모션 그래픽)
    │   ├── /prizes-detail/[id]  # 동적 이벤트 풀 상세
    │   └── /dashboard # 사용자 대시보드 (포트폴리오 관리)
    ├── components/    # 재사용 가능한 React 컴포넌트
    ├── hooks/         # Scaffold-ETH 커스텀 훅
    ├── services/      # Web3 설정 (Wagmi, RainbowKit)
    └── public/        # 정적 자산 & 이미지
```

## Core Features

### 1. **Vaults: 토큰 예치 풀**

사용자가 Memecore 체인의 다양한 토큰(USDT, USDC, ETH 등)을 예치하여 안정적인 수익을 얻는 무손실 복권 풀입니다.

**작동 방식:**

```
Deposit → Earn Yield → Convert to Tickets → Win Prizes
         ↓
    Principal Always Safe & Withdrawable (원금 항상 안전)
```

**수익 구조:**

- **고정 수익 (Base APY)**: 4-8% 범위의 현실적인 APY 제공
- **티켓 APY**: 추가 수익이 이벤트 풀 참여 티켓으로 전환
- **원금 보장**: 예치된 자금은 언제든 인출 가능

**Vault 스펙:**
| 항목 | 내용 |
|------|------|
| 토큰 종류 | USDT, USDC, WETH, MEME, etc. |
| APY 구조 | 기본 APY + 티켓 APY (커스터마이징 가능) |
| 유동성 | 365일 24/7 운영되는 상시 이벤트 풀 |
| 사용자 경험 | 한 번의 클릭으로 예치/출금 완료 |

### 2. **Prizes: 다양한 이벤트 풀 참여**

Vault에서 얻은 티켓으로 여러 기간의 이벤트 풀에 참여하여 보상을 획득합니다.

**풀 다양성:**
| 풀 종류 | 주기 | 보상 예시 | 특징 |
|--------|------|---------|------|
| **Quick Draw** | 매일 | 24 USDC | 일일 즉시성 |
| **Standard Pool** | 매월 | 1,569 USDT | 안정적 보상 |
| **Major Pool** | 분기 | 8,750 MEME | 중대형 상금 |
| **Mega Pool** | 반기 | 11,585 ETH | 최대 상금 |

**핵심 UX/UX 특징:**

- 🎨 **모션 그래픽 & 애니메이션**: 시각적으로 화려한 애니메이션으로 참여의 재미(Fun) 극대화
- ⏰ **실시간 카운트다운**: 다음 드로우까지의 시간을 역동적으로 표시
- 🎯 **당첨 확률 시각화**: 사용자의 당첨 가능성을 직관적으로 표현

### 3. **Dashboard: 개인 수익 관리 중앙화면**

사용자의 포트폴리오와 수익 현황을 한눈에 확인할 수 있는 전문적인 대시보드입니다.

**주요 기능:**

- 📊 **포트폴리오 현황**: 예치 토큰별 수익 및 APY 실시간 추적
- 💰 **클레임/인출 관리**: 수익 클레임 및 원금 인출 기능
- 🏆 **이벤트 참여 현황**: 현재 참여 중인 이벤트 풀 및 당첨 상태 확인
- 🎁 **당첨 상품 관리**: 당첨 시 클레임 기능

**디자인 철학:**

- Ramses UI의 대시보드 구조 참고로 **정보 밀도가 높고 전문적**인 레이아웃
- 신뢰성과 기능성을 동시에 강조하는 UI/UX 구성

### 💡 무손실 복권 모델 (No-Loss Lottery)

**MemePot의 핵심 메커니즘:**

```
핵심 문구: "Deposit tokens, join the culture, win prizes. Zero risk, endless fun."
          (토큰을 예치하고, 문화에 참여하고, 상품을 획득하세요. 위험 없음, 끝없는 재미)
```

- ✅ **원금 100% 보장**: 어떤 상황에서도 예치금 전액 인출 가능
- ✅ **보장된 수익**: Base APY로 최소한의 이자 수익 확보
- ✅ **추가 상금 기회**: 무손실 조건 하에 상금 당첨 기회
- ✅ **완전한 자유**: 언제든지 자유롭게 참여/철수 가능

## 📊 Data Flow Architecture

### 사용자 여정 (User Journey)

#### **1단계: 발견 및 온보딩 (Discovery & Onboarding)**

**랜딩 페이지 (/)** - MemePot 문화 소개

```
사용자 도착 (Cold Start)
   ↓
Hero Section - "신뢰, 안전, 재미가 공존하는 새로운 DeFi"
   ├─ 연금술적 우주 배경 (Alchemical Cosmos Visual)
   ├─ 메인 메시지: "Deposit tokens, join the culture, win prizes"
   └─ CTA 버튼: "시작하기" / "자세히 알아보기"
   ↓
핵심 가치 섹션 - 신뢰, 안전, 재미, 문화 소개
   ├─ 각 가치별 아이콘 & 설명 카드
   ├─ 무손실 원금 보장 명시 ✅ (신뢰 구축)
   └─ "당신의 원금은 항상 안전합니다" 강조
   ↓
About 페이지 (/about) - 프로젝트 상세 정보
   ├─ MemePot의 미션 & 로드맵
   ├─ Memecore 재단과의 파트너십
   └─ DeFi 혁신 스토리
```

---

#### **2단계: 지갑 연결 (Wallet Connection)**

**헤더 & RainbowKit** - 수동 연결 모드

```
사용자: "Connect Wallet" 버튼 클릭
   ↓
RainbowKit Modal 표시
   ├─ MetaMask, Wallet Connect, Ledger 등 선택 가능
   ├─ 지원하는 네트워크: Memecore Chain (주요), Ethereum (향후)
   └─ ⚠️ 주의: Auto-connect 비활성화 (multiInjectedProviderDiscovery: false)
      → 사용자가 명시적으로 지갑 연결 의도 확인
   ↓
지갑 연결 완료
   ├─ 헤더에 "0x1234...5678" 주소 표시
   ├─ 사용자 계정 잠금 해제
   └─ 네트워크 확인: "Memecore Chain Connected ✓"
```

---

#### **3단계: Vault 탐색 및 선택 (Vault Discovery & Selection)**

**Vaults 페이지 (/vaults)** - 예치 풀 선택

```
사용자가 /vaults 방문
   ↓
Vault 목록 조회 - 실시간 데이터 표시
   ├─ Vault 카드 정보:
   │  ├─ 토큰 로고 + 이름 (USDT, USDC, WETH, MEME)
   │  ├─ Base APY (고정 수익률) - 예: "4.2%"
   │  ├─ Ticket APY (추가 수익 → 티켓) - 예: "3.8%"
   │  ├─ 총 예치액 (TVL) - 예: "$1.5M"
   │  ├─ 24시간 거래량 - 예: "$250K"
   │  └─ 상태: "Active" / "Coming Soon"
   ↓
필터 & 검색 기능
   ├─ APY로 정렬 (높음 → 낮음)
   ├─ TVL로 필터 (대형 / 중형 / 소형)
   ├─ 토큰 종류 검색 (예: "USDT" 검색)
   └─ 위험도 표시 (Low / Medium / High)
   ↓
Vault 상세 보기 (Vault Details)
   ├─ 수익 구조 설명:
   │  ├─ "예치하신 USDT는 4.2% APY로 고정 수익 제공"
   │  ├─ "추가 수익 3.8%는 자동으로 이벤트 풀 티켓으로 변환"
   │  └─ "당첨 시 상금 획득, 탈락해도 원금 + 고정 수익 100% 보장"
   ├─ 수익 시뮬레이터 (예시):
   │  ├─ 예치 금액 입력: $1,000
   │  ├─ 예상 월 수익: $35.83 (4.2% + 3.8%)
   │  └─ 1년 예상 수익: $430 (원금 보장)
   ├─ 유동성 정보 (Liquidity):
   │  ├─ 즉시 인출 가능 여부
   │  ├─ 인출 수수료 (0% / 최대 0.5%)
   │  └─ 평균 인출 시간 (< 1 분)
   └─ 현재 참여자: "234명이 $1.5M 예치"
   ↓
Vault 선택 & 예치 준비
   ├─ 사용자: "예치하기" 버튼 클릭
   └─ 예치 모달 열림
```

---

#### **4단계: 예치 및 거래 실행 (Deposit & Transaction Execution)**

**Vault 예치 프로세스** - 트랜잭션 단계별 진행

```
사용자가 "예치하기" 버튼 클릭
   ↓
Transaction Modal - 다단계 진행 상황 표시
   ├─ Step 1️⃣: "Approval 트랜잭션 시작"
   │  ├─ 설명: "MemePot 컨트랙트가 USDT를 사용할 수 있도록 승인"
   │  ├─ 상태: ⏳ Processing → ✅ Completed (2-5초)
   │  └─ 진행률: [████████░░] 80%
   │
   ├─ Step 2️⃣: "예치 트랜잭션 실행"
   │  ├─ 설명: "USDT를 Vault로 전송"
   │  ├─ 예치 금액 확인: "$1,000 USDT"
   │  ├─ 상태: ⏳ Processing → ✅ Completed (3-8초)
   │  └─ 진행률: [██████████] 100%
   │
   └─ Step 3️⃣: "포지션 확인"
      ├─ 설명: "블록체인에서 최종 확인"
      ├─ 상태: ✅ Completed
      └─ 다음: 클레임 가능 시간 표시
   ↓
✅ 성공 메시지
   ├─ 토스트 알림: "🎉 예치 완료! $1,000 USDT가 Vault에 들어갔습니다"
   ├─ 트랜잭션 해시: "[Etherscan 링크]"
   └─ 모달 닫기 버튼
   ↓
포지션 업데이트 (실시간)
   ├─ Vault 카드에 "MY POSITION" 섹션 표시:
   │  ├─ 예치 금액: "$1,000 USDT"
   │  ├─ 획득한 티켓: "15 tickets"
   │  ├─ 예상 월 수익: "$35.83"
   │  └─ 다음 드로우까지 남은 시간: "2일 14시간"
   └─ Dashboard로 이동 권유
```

---

#### **5단계: 수익 발생 및 티켓 변환 (Yield Generation & Ticket Conversion)**

**자동 수익 생성 프로세스** - 시간에 따른 변화

```
사용자가 Vault에 예치 완료 (시간: 0일)
   ↓
Day 1-7: 수익 누적 중
   ├─ Base APY 작동: 매일 $0.115 수익 누적
   │  └─ 표시: "You earned: $0.81 (7 days)"
   ├─ Yield 추적 (Dashboard에서 실시간 표시):
   │  ├─ Vault 카드: "수익 현황: $0.81"
   │  ├─ 애니메이션: 📈 수익 증가 그래프
   │  └─ 시간에 따른 자동 업데이트
   └─ 사용자 경험: 수익이 쌓이는 것을 직시적으로 확인 가능
   ↓
Weekly Conversion: 티켓으로 자동 변환 (매주 목요일)
   ├─ 누적 수익: $0.81 → 자동으로 이벤트 풀 티켓으로 변환
   ├─ 변환 공식: $0.81 ÷ ($0.05/ticket) = 16 tickets
   ├─ 대시보드 알림:
   │  ├─ 🎫 "수익이 이벤트 풀 티켓 16장으로 변환되었습니다!"
   │  ├─ 이전 티켓: 15장 → 현재 티켓: 31장
   │  └─ "다음 드로우에서 당첨 확률이 높아졌습니다"
   └─ 사용자 감정: ✨ 계속 쌓이고 있다는 기대감
   ↓
Dashboard 실시간 반영
   ├─ Portfolio Summary:
   │  ├─ 예치 자산: "$1,000 USDT"
   │  ├─ 수익 (locked): "$0.81"
   │  ├─ 수익 (converted to tickets): 31 tickets
   │  ├─ 총 잠재 가치: "$1,001.55"
   │  └─ 수익률: "+0.155% (7일)"
   └─ Visual: 초록색 상승 화살표 표시 📈
```

---

#### **6단계: 이벤트 풀 참여 및 당첨 기대 (Prize Pool Participation)**

**Prizes 페이지 (/prizes)** - 다양한 이벤트 풀

```
사용자가 Dashboard에서 "View Prizes" 클릭
   ↓
Prizes 페이지 도착 - 모션 그래픽 강조
   ├─ Hero Section: 연금술적 배경 + 회전하는 별들 ✨
   ├─ 메인 메시지: "당신의 티켓이 상금을 기다리고 있습니다"
   └─ 사용자 느낌: 💫 "이제 정말 뭔가 일어날 것 같다"
   ↓
Available Prize Pools - 실시간 카운트다운
   │
   ├─ Pool 1️⃣: Quick Draw (매일)
   │  ├─ 💰 상금: 24 USDC
   │  ├─ ⏰ 다음 드로우: 14시간 23분 14초 (실시간 감소)
   │  ├─ 🎫 당신의 티켓: 31장
   │  ├─ 📊 총 참여 티켓: 12,450장
   │  ├─ 🎯 당첨 확률: 0.248% (31/12,450)
   │  ├─ 🏆 당첨 자: "15명이 각각 $1.6 획득"
   │  ├─ 모션: 카운트다운 숫자가 빨간색으로 펄싱 애니메이션
   │  └─ 버튼: "Draw 보기" / "이전 드로우 결과"
   │
   ├─ Pool 2️⃣: Standard Pool (매월, 첫 날)
   │  ├─ 💰 상금: 1,569 USDT
   │  ├─ ⏰ 다음 드로우: 6일 2시간 14분 (카운트다운)
   │  ├─ 🎫 당신의 티켓: 31장
   │  ├─ 📊 총 참여 티켓: 234,567장
   │  ├─ 🎯 당첨 확률: 0.0132% (소수 표시)
   │  ├─ 🏆 상금 규모: 평균 상금 $130/명
   │  ├─ 모션: 배경 그래디언트가 천천히 변함 (보라색 ↔ 핑크색)
   │  └─ 버튼: "참여하기" / "상세 정보"
   │
   └─ Pool 3️⃣: Mega Pool (6개월, 최대 상금)
      ├─ 💰 상금: 11,585 ETH
      ├─ ⏰ 다음 드로우: 167일 4시간 22분
      ├─ 🎫 당신의 티켓: 31장
      ├─ 📊 총 참여 티켓: 50M+ (메가 규모)
      ├─ 🎯 당첨 확률: <0.001% (희귀성 강조)
      ├─ 🏆 "운이 좋으면 $20M+ 획득 가능"
      ├─ 모션: 큰 경기장 배경, 반짝이는 파티클 효과
      └─ "이 풀에 참여하세요!" - CTA 강조
   ↓
Previous Winners - 신뢰 강화
   ├─ 최근 당첨자 목록:
   │  ├─ "0x3A... - Quick Draw - 24 USDC - 1시간 전 ✅ Claimed"
   │  ├─ "0x7B... - Standard Pool - 1,569 USDT - 2일 전 ✅ Claimed"
   │  └─ "0xF2... - Major Pool - 8,750 MEME - 14일 전 ✅ Claimed"
   └─ 메시지: "실제 사람들이 이미 상금을 받았습니다!"
   ↓
당첨 확률 교육
   ├─ "당첨 확률을 올리려면?"
   └─ 팁: "더 많은 Vault에 예치하거나, 더 오래 기다려서 티켓을 모으세요!"
```

---

#### **7단계: Dashboard 통합 관리 (Unified Dashboard)**

**Dashboard 페이지 (/dashboard)** - 포트폴리오 중앙 제어

```
사용자가 /dashboard 방문
   ↓
Portfolio Overview - 한눈에 보는 전체 상황
   ├─ 💼 총 자산 가치: "$1,001.55"
   │  ├─ 예치된 자산: "$1,000 USDT"
   │  ├─ 누적 수익: "$1.55"
   │  └─ 변화율: "+0.155%" (초록색)
   │
   ├─ 🏆 내 티켓 현황:
   │  ├─ 총 티켓: 31장
   │  ├─ Quick Draw: 15장
   │  ├─ Standard Pool: 10장
   │  ├─ Mega Pool: 6장
   │  └─ "당첨 확률: 모든 풀에서 계속 증가 중"
   │
   └─ 📊 수익 추적 (차트):
      ├─ 7일 수익률 그래프
      ├─ 월별 수익 비교
      └─ "추세: 📈 꾸준히 증가"
   ↓
My Vaults - 예치된 풀 관리
   ├─ Vault 1: USDT Vault
   │  ├─ 예치 금액: $1,000
   │  ├─ Base APY: 4.2%
   │  ├─ Ticket APY: 3.8%
   │  ├─ 누적 수익: $0.81
   │  ├─ 상태: "Active ✓"
   │  ├─ 액션 버튼:
   │  │  ├─ "추가 예치" (더 많은 티켓 원할 때)
   │  │  ├─ "수익 클레임" (고정 수익 인출)
   │  │  └─ "전액 인출" (원금 + 수익 동시 인출)
   │  └─ ⚠️ "원금은 항상 보장됩니다"
   │
   └─ Vault 2: USDC Vault
      ├─ 예치 금액: "$500"
      ├─ Base APY: 3.5%
      ├─ ...
      └─ (추가 Vault 반복)
   ↓
Prize Participation Status - 이벤트 풀 진행 상황
   ├─ Active Participation:
   │  ├─ Quick Draw (매일)
   │  │  ├─ 당신의 티켓: 15장
   │  │  ├─ 다음 드로우: 14시간 23분
   │  │  ├─ 당첨 확률: 0.12%
   │  │  └─ "곧 결과가 나옵니다!"
   │  │
   │  ├─ Standard Pool (매월)
   │  │  ├─ 당신의 티켓: 10장
   │  │  ├─ 다음 드로우: 6일 2시간
   │  │  ├─ 당첨 확률: 0.0042%
   │  │  └─ 상금 예상값: "$20.62" (기대값 계산)
   │  │
   │  └─ Mega Pool (6개월)
   │     ├─ 당신의 티켓: 6장
   │     ├─ 다음 드로우: 167일
   │     ├─ 당첨 확률: <0.0001%
   │     └─ 상금 예상값: "$0.69" (기대값)
   │
   └─ Past Results:
      ├─ "7일 전 Quick Draw에서 탈락 (원금+수익 안전 ✓)"
      └─ "아직 당첨된 풀이 없습니다"
   ↓
Quick Actions - 자주 사용하는 기능
   ├─ "[+ 추가 예치]" 버튼
   ├─ "[💰 수익 클레임]" 버튼
   ├─ "[🎁 이벤트 풀 보기]" 버튼
   └─ "[📊 상세 분석]" 버튼
```

---

#### **8단계: 당첨 및 보상 획득 (Winning & Claiming Rewards)**

**당첨 시나리오** - 성공 경로

```
시나리오: Standard Pool 드로우 진행 (6일 후)
   ↓
🎉 당첨 알림!
   ├─ 푸시 알림 (또는 대시보드 배너): "축하합니다! 🎉 Standard Pool에서 당첨되셨습니다!"
   ├─ 상금: "1,569 USDT"
   ├─ 드로우 번호: "#STD-2025-12-01-001"
   └─ "지금 바로 클레임하세요!"
   ↓
Dashboard - 당첨 정보 업데이트
   ├─ Prize Participation Status에 새 섹션 표시:
   │  └─ 🏆 "Claiming Rewards"
   │     ├─ 당첨 풀: "Standard Pool"
   │     ├─ 상금: "1,569 USDT"
   │     ├─ 상태: "🔓 Claimable Now"
   │     └─ 버튼: "[🎁 클레임하기]"
   │
   └─ 설명: "상금은 최대 30일까지 클레임할 수 있습니다"
   ↓
Claim Modal - 클레임 프로세스
   ├─ Step 1: 확인 화면
   │  ├─ "1,569 USDT를 클레임하시겠습니까?"
   │  ├─ 지갑 주소: "0x1234...5678"
   │  └─ 버튼: "[확인]" / "[취소]"
   │
   ├─ Step 2: 트랜잭션 진행
   │  ├─ 상태: ⏳ "트랜잭션 진행 중..."
   │  ├─ 메시지: "잠시만 기다려 주세요"
   │  └─ 진행률: [██████░░░░] 60%
   │
   └─ Step 3: 완료
      ├─ ✅ "클레임 완료!"
      ├─ "1,569 USDT가 지갑에 입금되었습니다"
      ├─ 트랜잭션 해시: "[Etherscan 링크]"
      └─ 메시지: "🎉 축하합니다! 당신은 이제 $1,569를 더 가지고 있습니다"
   ↓
포지션 업데이트 (최종)
   ├─ Dashboard 포트폴리오:
   │  ├─ 총 자산 가치: "$2,570.55" (이전 $1,001.55 + 당첨금 $1,569)
   │  ├─ 원금 (예치): "$1,000"
   │  ├─ 클레임된 수익: "$1,569"
   │  ├─ 추가 수익 (locked): "$1.55"
   │  └─ 변화율: "+257%" 🚀
   │
   └─ Celebration 메시지:
      ├─ "당첨을 축하합니다! 🎊"
      ├─ "당신의 성공 스토리를 공유하세요 [Share on Twitter]"
      └─ "더 많은 수익을 위해 더 예치해 보세요!"
   ↓
추가 선택지
   ├─ Option 1: 다시 예치하기 → 새로운 Vault 탐색 (Step 3으로)
   ├─ Option 2: 인출하기 → 지갑 확인
   └─ Option 3: 계속 보유 → 다음 드로우 준비
```

---

#### **9단계: 장기 관계 유지 (Long-term Engagement)**

**지속적 참여 및 성장** - 반복되는 사이클

```
사용자가 일주일마다 방문 (Recurring Pattern)
   ↓
Daily Check-in Pattern:
   ├─ 📱 아침: Dashboard 확인 → "오늘 수익: $0.12 적립"
   ├─ 📊 점심: Prizes 페이지 확인 → "Quick Draw 카운트다운 12시간"
   ├─ 🎯 저녁: "당첨 알림 없음, 계속 기다리는 중..."
   └─ 감정: 💭 "내 티켓이 언제 당첨될까? 기대된다..."
   ↓
Weekly Milestone:
   ├─ 누적 수익: "$1.55" → 더 많은 티켓으로 변환
   ├─ 티켓: 31장 → 35장으로 증가
   ├─ 당첨 확률 증가 → 더 높은 기대감
   └─ Notification: "🎫 수익이 새로운 티켓 4장으로 변환되었습니다!"
   ↓
Monthly Cycle:
   ├─ Standard Pool 드로우 완료 (결과 확인)
   ├─ Portfolio 성장: 초기 $1,000 → 현재 $1,500+
   ├─ "이번 달 수익률: +3.2%"
   └─ 감정: 😊 "체계적으로 성장하고 있다!"
   ↓
더 많은 Vault 참여 (선택):
   ├─ 사용자: "더 많은 수익을 원한다" → 새로운 Vault 탐색
   ├─ Vault 2 추가: "USDC Vault에 $500 예치"
   ├─ 포트폴리오 다각화 (Risk Management)
   └─ 수익 가능성 증대: 기대 더 상승 ⬆️
   ↓
6개월 성과 검토:
   ├─ 초기 투자: $1,000
   ├─ 누적 예치: $1,500
   ├─ 클레임된 상금: $2,100 (한 번 당첨)
   ├─ 현재 자산: $3,600
   ├─ 수익률: "+260%"
   └─ "원금은 항상 안전했고, 수익은 계속 늘었다!" ✅
```

---

### **사용자 감정 곡선 (Emotional Journey)**

```
             당첨 🎉
              ↑
              │     🚀 기대감
              │    /
신뢰감 (안전) │   /
     ✅       │  /      당첨 탈락 (원금 안전)
              │ /            ↘ 실망감
              │/  당첨 확률    \
              ├─────────────────╲ → 다시 시도
              │                  \
         기다림 (설렘)             → 계속 수익 증가
              │                    → 재참여
              │
            시간 →

핵심: 언제든 원금을 잃지 않으므로 "위험 없는 기대감"
```

---

### **주요 UX 특징별 상세 상호작용**

#### **Prizes 페이지 - 모션 그래픽 강화**

```
1. 별 입자 효과 (Stars Particle)
   ├─ 배경에서 지속적으로 떨어지는 별들 ✨
   ├─ 마우스 이동에 반응: 별들이 약간 흩어짐
   └─ 사용자 느낌: "신비로움, 마법 같음"

2. 카운트다운 애니메이션
   ├─ 숫자가 실시간으로 감소
   ├─ 마지막 1시간: 색상 변경 (빨강) + 펄싱
   └─ 사용자 느낌: "긴박함, 시간이 무언가"

3. 상금 표시 애니메이션
   ├─ 큰 숫자가 나타났다 사라졌다 반복 (숨 쉬는 애니메이션)
   ├─ 호버 시 확대: "11,585 ETH" → 더 큰 글씨
   └─ 사용자 느낌: "이 상금이 날 기다리고 있다!"

4. 당첨자 목록 스크롤
   ├─ 최근 당첨자가 계속 추가됨 (실시간)
   ├─ 각 당첨자 항목에 ✅ 아이콘
   └─ 사용자 느낌: "사람들이 정말 당첨되고 있다! 나도 될 수 있다!"
```

---

이제 **구체적이고 상세한 사용자 여정**이 완성되었습니다! 🎉 각 단계에서 사용자가 경험하는 감정, UI/UX 특징, 그리고 실제 액션까지 명시적으로 표현되어 있습니다.

### 상태 관리 흐름 (State Management Flow)

```typescript
// 예시: 트랜잭션 진행 상태 관리
Parent Component (MyVaultsSection)
  ↓
[showModal, depositAmount, transactionSteps]
  ↓
TransactionProgressModal (isOpen, steps, onClose 전달)
  ↓
simulateTransaction() → setTransactionSteps() → UI 업데이트
  ↓
Success Toast → 모달 상태 리셋
```

## 🔐 Wallet Integration (Wagmi + RainbowKit)

### Configuration

```typescript
// services/web3/wagmiConfig.tsx
export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors(),
  ssr: true,
  multiInjectedProviderDiscovery: false, // Manual connect only
  client: ({ chain }) =>
    createClient({
      chain,
      transport: fallback([
        http(rpcOverrideUrl || alchemyHttpUrl),
        http(), // Fallback RPC
      ]),
    }),
});
```

### Custom Connect Button

```tsx
// components/scaffold-eth/RainbowKitCustomConnectButton
<ConnectButton.Custom>
  {({ account, chain, openConnectModal, mounted }) => {
    if (!connected)
      return (
        <button onClick={openConnectModal}>
          <i className="ri-wallet-3-line" />
          Connect Wallet
        </button>
      );
    // Render connected state...
  }}
</ConnectButton.Custom>
```

## 📱 Responsive Design Strategy

```typescript
// Tailwind utility pattern (mobile-first)
<div className="hidden md:flex items-center">
  {/* Desktop navigation */}
</div>

<div className="md:hidden">
  {/* Mobile menu */}
</div>

// Tailwind grid (auto-responsive)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Automatically adjusts columns */}
</div>
```

## 🚀 Development & Deployment

### Local Development

```bash
# 1. Install dependencies
yarn install

# 2. Start local blockchain
yarn chain

# 3. Deploy contracts to local chain
yarn deploy

# 4. Start frontend dev server
yarn start
# → http://localhost:3000
```

### Code Quality & Validation

```bash
# ESLint + Prettier check
yarn lint

# TypeScript validation
yarn next:check-types

# Fix linting errors
yarn next:lint --fix
yarn prettier --write
```

### Build & Deployment

```bash
# Production build
yarn build

# Deploy to Vercel
yarn vercel

# Deploy frontend to IPFS
yarn ipfs:deploy
```

## 🔄 Smart Contract Integration

### 예상 컨트랙트 인터페이스

```typescript
// 이벤트 풀 구조
interface PrizePool {
  id: string;
  token: string;
  baseAPY: number;
  ticketAPY: number;
  totalDeposits: bigint;
  nextDrawTime: number;
  prizeAmount: bigint;
  poolDuration: "daily" | "monthly" | "quarterly" | "semi-annual";
}

// Vault 구조
interface Vault {
  id: string;
  tokenAddress: string;
  totalDeposits: bigint;
  baseAPY: number;
  ticketAPY: number;
  underlyingProtocol: string; // 수익 창출 프로토콜
  isActive: boolean;
}

// 사용자 포지션
interface UserPosition {
  vaultId: string;
  depositAmount: bigint;
  accruedYield: bigint;
  ticketBalance: number;
  prizeWinnings: bigint;
}
```

### Scaffold-ETH 훅 패턴 (향후 구현)

```typescript
// 이벤트 풀 조회
const { data: pools } = useScaffoldReadContract({
  contractName: "PrizePoolManager",
  functionName: "getPrizePools",
});

// Vault 데이터 조회
const { data: vaults } = useScaffoldReadContract({
  contractName: "VaultManager",
  functionName: "getAllVaults",
});

// Vault에 토큰 예치 (쓰기 트랜잭션)
const { writeContractAsync } = useScaffoldWriteContract({
  contractName: "Vault",
});

await writeContractAsync({
  functionName: "deposit",
  args: [vaultId, depositAmount],
  value: parseEther("0"),
});

// 당첨 상금 클레임
await writeContractAsync({
  contractName: "PrizePoolManager",
  functionName: "claimPrize",
  args: [poolId, ticketId],
});
```

### 무손실 복권 메커니즘 (스마트 컨트랙트 로직)

```solidity
// 의사 코드: 무손실 원금 보장
contract NoLossVault {
  // 원금 추적: 항상 인출 가능
  mapping(address => uint256) public deposits;

  // Deposit: 원금 기록 및 수익 생성 시작
  function deposit(uint256 amount) external {
    deposits[msg.sender] += amount;
    yieldManager.deposit(amount);
  }

  // Withdraw: 원금 100% 보장 + 수익 인출
  function withdraw(uint256 amount) external {
    require(amount <= deposits[msg.sender], "Insufficient deposit");
    deposits[msg.sender] -= amount;

    uint256 yield = getAccruedYield(msg.sender);
    uint256 totalWithdraw = amount + yield;

    // 원금은 항상 먼저 반환
    token.transfer(msg.sender, totalWithdraw);
  }

  // 수익을 티켓으로 자동 변환
  function convertYieldToTickets(address user) internal {
    uint256 yieldAmount = getAccruedYield(user);
    uint256 ticketCount = yieldAmount / ticketPrice;
    prizePool.addTickets(user, ticketCount);
  }
}
```

## 🎨 Design System

### 브랜드 아이덴티티 (Brand Identity)

**Visual Concept: 연금술적 우주 (Alchemical Cosmos)**

MemePot은 DeFi의 변혁성과 Memecore 문화의 창의성을 "연금술"이라는 시각적 메타포로 표현합니다.

### 색상 팔레트 (Color Palette)

| 용도           | 색상                                 | 의미           |
| -------------- | ------------------------------------ | -------------- |
| **Primary**    | Purple (`#AD47FF`), Pink (`#EC4899`) | 신비로움, 변혁 |
| **Secondary**  | Cyan (`#06B6D4`), Orange (`#FB923C`) | 역동성, 에너지 |
| **Background** | Deep Purple (`#0a0118` ~ `#1a0a2e`)  | 우주적 깊이    |
| **Text**       | White + Gray Accents                 | 명확한 가독성  |

### 애니메이션 패턴 (Animation Patterns)

```css
/* 펄싱 강조 효과 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 부유하는 효과 (Stars, Elements) */
@keyframes animate-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 그래디언트 텍스트 */
.bg-gradient-to-r.from-purple-400.to-pink-400 {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### UI/UX 철학

- 🌌 **어두운 테마 (Dark Mode)**: 우주적 배경으로 신비로움 강조
- 🎭 **연금술적 요소**: 변환과 변혁의 시각적 표현
- 💫 **모션 그래픽**: Prizes 페이지에서 참여의 재미 극대화
- 📊 **전문성**: Ramses UI 참고로 높은 정보 밀도와 신뢰성 확보

## 🧪 Testing Strategy

- **Unit Tests**: Smart contract tests in `packages/hardhat/test/`
- **E2E Tests**: Frontend interactions (TODO)
- **Type Safety**: TypeScript + ESLint ensure compile-time safety
- **Pre-commit Hooks**: ESLint + TypeScript validation before commits

## 📈 Performance Optimization

- **Next.js Image Optimization**: All images use `<Image>` component with auto-optimization
- **Code Splitting**: Route-based splitting via Next.js App Router
- **Infinite Scroll**: Intersection Observer API (VaultsTable.tsx)
- **Lazy Modals**: Modals render conditionally (not pre-mounted)

## 🌐 Supported Networks

| 네트워크             | 상태          | 용도                      |
| -------------------- | ------------- | ------------------------- |
| **Memecore Chain**   | 주요 네트워크 | 메인 스마트 컨트랙트 배포 |
| **Ethereum Mainnet** | 향후 지원     | 크로스체인 확장 (2026 Q4) |
| **Arbitrum**         | 향후 지원     | 저비용 거래 지원          |
| **Polygon**          | 향후 지원     | 대중적 접근성 확대        |

## 🏆 핵심 경쟁 우위

| 우위                | 설명                                  |
| ------------------- | ------------------------------------- |
| **원금 100% 보장**  | 무손실 모델로 사용자 신뢰 확보        |
| **현실적인 수익률** | 과장 없는 APY로 장기 신뢰 구축        |
| **상시 이벤트**     | 24/7/365 운영되는 다양한 상금 풀      |
| **시각적 재미**     | 모션 그래픽 & 애니메이션으로 UX 강화  |
| **Memecore 생태계** | 문화적 가치와 기술적 혁신의 결합      |
| **전문적 UI**       | Ramses UI 참고의 신뢰성 있는 대시보드 |

## 📦 External Dependencies

- **Alchemy RPC**: Free tier (Note: 429 rate limits if exceeded)
- **ReadDy.ai**: Image domain for meme assets
- **Scaffold-ETH**: Utilities for contract interaction
- **RainbowKit**: Multi-wallet support (MetaMask, Wallet Connect, Ledger, etc.)

## 🔮 Future Roadmap

MemePot은 함께 DeFi의 미래를 구축하기 위한 명확한 로드맵을 가지고 있습니다:

### 2026 Q1: MemePot 프로젝트 런칭

- 메인넷 배포 및 스마트 컨트랙트 감사 완료
- 첫 번째 Vault 풀 오픈
- RainbowKit 지갑 연결 안정화

### 2026 Q2: 커뮤니티 구축 & 초기 이벤트 시작

- 커뮤니티 활성화 및 초기 사용자 온보딩
- 다양한 이벤트 풀 운영 시작 (매일, 매월, 분기)
- 보상 구조 최적화 및 사용자 피드백 반영

### 2026 Q3: 메인 풀 다이나믹 & 보안 감사 완료

- 추가 토큰 및 Vault 확장
- 전체 스마트 컨트랙트 보안 감사 완료
- 고급 DeFi 기능 통합 (유동성 관리, 헤징 등)

### 2026 Q4: 파트너십 확장 & 생태계 성장

- Memecore 재단 및 주요 DeFi 프로토콜과의 파트너십
- 모바일 앱 개발 (React Native)
- 크로스체인 지원 (Arbitrum, Polygon 등)
- 거버넌스 토큰(MemePot DAO) 출시

## 📝 Key Files Reference

| File                            | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `scaffold.config.ts`            | Network config, API keys           |
| `app/layout.tsx`                | Root layout with providers         |
| `services/web3/wagmiConfig.tsx` | Blockchain connection config       |
| `components/Header.tsx`         | Global navigation + wallet button  |
| `app/dashboard/page.tsx`        | User analytics & transaction logic |
| `hooks/useToast.ts`             | Toast notification system          |

## 🤝 Contributing

MemePot 프로젝트에 기여하고 싶으신가요? 다음 단계를 따라주세요:

1. 기능 브랜치 생성: `git checkout -b feature/your-feature`
2. 코드 스타일 준수: `yarn next:lint --fix`
3. 타입 검증: `yarn next:check-types`
4. 커밋 메시지 작성: `git commit -m "feat: description"`
5. PR 생성 및 제출

자세한 개발 가이드는 [DEVELOPMENT.md](./DEVELOPMENT.md)를 참고하세요.

## 📄 License

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

## 🙏 감사의 말

- **Memecore 재단**: 플랫폼 및 생태계 지원
- **PoolTogether**: 무손실 복권 모델 영감
- **Scaffold-ETH**: 개발 프레임워크
- **Ramses UI**: UI/UX 디자인 레퍼런스
- **RainbowKit & Wagmi**: 지갑 통합 라이브러리

---

**MemePot: 신뢰, 안전, 재미가 공존하는 DeFi의 미래**

**Made with ❤️ for MEMEKATHON 2025**
