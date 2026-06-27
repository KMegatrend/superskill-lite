---
name: "OpenCode Power Pack"
description: "Eleven Claude Code skills ported to OpenCode: code-review, security-review, feature-dev, frontend-design + 7 more."
tags:
  - opencode
  - power-pack
  - bundle
---

# OpenCode Power Pack

*Eleven Claude Code skills, ported to OpenCode.*
*Code review, security audit, feature dev, frontend design, and the rest of the kit — installable in one line.*

## 🌟 왜 이 스킬이 필요한가요? (Why this exists)
OpenCode는 기본적으로 SKILL.md 형식을 지원하지만, Anthropic의 공식 Claude Code 플러그인들은 에이전트 워크플로우를 사용하기 때문에 단순 복사-붙여넣기로는 작동하지 않습니다. 이 파워팩은 이러한 플러그인 워크플로우를 OpenCode 호환 스킬로 재작성한 것입니다.

## 📦 포함된 스킬 (What's inside)

### Review (리뷰)
- **code-review**: 교차 검증 및 재현 시나리오를 포함한 다중 에이전트 PR 리뷰
- **security-review**: OWASP 기반, 3단계 필터링 및 구체적인 공격 PoC 요구를 포함한 보안 리뷰

### Feature dev (기능 개발)
- **feature-dev**: 7단계 가이드 워크플로우 (발견 → 탐색 → 질문 → 아키텍처 → 구현 → 리뷰 → 요약)
- **code-explorer**: 딥 코드베이스 분석 및 기능의 End-to-End 추적
- **code-architect**: 파일 수준의 구현 맵을 포함한 아키텍처 설계
- **code-reviewer**: 명시적인 엣지 케이스 체크리스트를 활용한 적대적(adversarial) 리뷰

### Design (디자인)
- **frontend-design**: 흔한 AI 디자인을 피하는 프로덕션급 UI 생성

### Authoring (스킬 제작)
- **mcp-builder**: 고품질 MCP 서버(Python/TypeScript) 구축 가이드
- **skill-creator**: 새로운 SKILL.md 파일을 점진적 작성법으로 생성

### Project memory (프로젝트 메모리)
- **agents-md-improver**: 현재 코드베이스를 기준으로 AGENTS.md / CLAUDE.md를 점검 및 업데이트
- **agents-md-revise**: 세션에서 학습한 내용을 프로젝트 규칙으로 저장 (improver의 보완)

## 🚀 설치 및 적용 방법 (Installation)
1. **[GitHub 저장소 방문하기](https://github.com/waybarrios/opencode-power-pack)**
2. `~/.config/opencode/opencode.json` 파일에 다음을 추가합니다:
   ```json
   {
     "plugin": [
       "opencode-power-pack@git+https://github.com/waybarrios/opencode-power-pack.git"
     ]
   }
   ```
3. OpenCode를 재시작하여 적용합니다.