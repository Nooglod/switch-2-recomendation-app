# 실제 게임 이미지 넣는 방법 (How to add real game images)

The app now **prefers a real image** for each game and only falls back to the
generated cover if a real one isn't found. To use the actual artwork from your
Figma file, export each game's image and drop it into the `images/` folder using
the file name in the table below.

## 빠른 순서 (Figma export — ~30s each)

1. Figma에서 해당 게임의 **커버 이미지 / 상세 페이지 이미지**를 선택하세요.
   (Select the game's cover image or the image layer on its 상세 페이지 frame.)
2. 오른쪽 패널 맨 아래 **Export** 섹션에서 **＋** 를 누르고 형식을 **PNG** (또는 JPG)로 둡니다.
3. **Export** 버튼을 눌러 저장합니다.
4. 저장한 파일 이름을 아래 표의 **File name**으로 바꿔 `images/` 폴더에 넣으세요.
   예: 제노블레이드 크로니클 3 이미지 → `images/game1.png`
5. 브라우저에서 `index.html`을 새로고침하면 실제 이미지로 바뀝니다. ✅

> 팁: 한 번에 여러 프레임을 선택해 export하면 빠릅니다. PNG가 안 맞으면 `.jpg`도 자동 인식됩니다.
> 파일을 안 넣은 게임은 기존 생성 커버가 그대로 보입니다 (앱이 깨지지 않아요).

## 이름 매핑표 (File naming map)

| ID | 게임 이름 (Game) | 장르 | 넣을 파일 이름 (File name) |
|----|------------------|------|----------------------------|
| `game1` | 제노블레이드 크로니클 3 | RPG | `images/game1.png` |
| `game2` | 루이지 멘션 3 | 액션/퍼즐 | `images/game2.png` |
| `game3` | 마리오 테니스 피버 | 스포츠 | `images/game3.png` |
| `game4` | 엔터 더 건전 | 로그라이트/슈팅 | `images/game4.png` |
| `game5` | 잇 테이크 투 | 협동/어드벤처 | `images/game5.png` |
| `game6` | 요시와 신기한 도감 | 액션 | `images/game6.png` |
| `game7` | 스플릿 픽션 | 협동/퍼즐 | `images/game7.png` |
| `game8` | 스니퍼클립스 플러스 | 퍼즐 | `images/game8.png` |
| `game9` | 메트로이드 프라임 4 | 액션/FPS | `images/game9.png` |
| `game10` | 슈퍼마리오브라더스 원더 | 액션 | `images/game10.png` |
| `game11` | 할로우 나이트 | 액션 | `images/game11.png` |
| `game12` | 하데스 2 | 액션 | `images/game12.png` |
| `game13` | 애스트럴 체인 | 액션 | `images/game13.png` |
| `game14` | 젤다 야생의 숨결 | 게임 | `images/game14.png` |
| `game15` | 슈퍼마리오 파티 잼버리 | 슈팅/FPS | `images/game15.png` |
| `game16` | 마리오 카트 월드 | 스포츠/레이싱 | `images/game16.png` |
| `game17` | 커비의 드림 뷔페 | 액션 | `images/game17.png` |
| `game18` | 스플래툰 3 | 슈팅/FPS | `images/game18.png` |
| `game19` | 포켓몬 유나이트 | MOBA | `images/game19.png` |
| `game20` | 오버위치 2 | 게임 | `images/game20.png` |
| `game21` | F-ZERO 99 | 액션 | `images/game21.png` |
| `game22` | 동킹콩 바난자 | 슈팅/FPS | `images/game22.png` |
| `game23` | 젤다무쌍 봉인 전기 | 액션 | `images/game23.png` |
| `game24` | 파이어 엠블렘: 만자천홍 | RPG | `images/game24.png` |
| `game25` | 피크민 4 | 전략/퍼즐 | `images/game25.png` |
| `game26` | 젤다의 전설 야생의 숨결 | 오픈월드/액션 | `images/game26.png` |
| `game27` | 포코피아 | 게임 | `images/game27.png` |
| `game28` | 포켓몬 챔피언스 | 전략/RPG | `images/game28.png` |
| `game29` | 포켓몬스터 레전드 ZA | RPG | `images/game29.png` |
| `game30` | 스플래툰 레이더스 | 슈팅/액션 | `images/game30.png` |
| `game31` | 커비의 에어라이더 | 레이싱 | `images/game31.png` |
| `game32` | 별의 커비 디스커버리 | 슈팅/FPS | `images/game32.png` |
| `game33` | F-ZERO GX | 레이싱 | `images/game33.png` |
| `game34` | 제노블레이드 크로니클스 크로스 디피니티브 에디션 | 오픈월드/RPG | `images/game34.png` |
| `game35` | 오버워치 2 | 액션 | `images/game35.png` |
| `game36` | 몬스터헌터 스토리즈 3 | 액션 | `images/game36.png` |
| `game37` | 드래그 앤드 드라이브 | 액션 | `images/game37.png` |
| `game38` | 유카-리플레일리 | 액션 | `images/game38.png` |
| `game39` | 데이브 더 다이버 | 액션 | `images/game39.png` |
| `game40` | 셀레스트 | 액션 | `images/game40.png` |
| `game41` | 데드셀 | 액션 | `images/game41.png` |

총 41개 게임. PNG 권장, JPG도 가능합니다.
