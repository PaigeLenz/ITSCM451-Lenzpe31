---
name: change-enablement-agent
description: |
  An AI agent that manages the full lifecycle of IT change enablement as defined by ITIL 4 and modern DevOps practices. Use this skill whenever the user mentions change requests, change advisory boards (CAB), RFC, release management, change risk assessment, change approval workflows, post-implementation review (PIR), emergency changes, standard changes, normal changes, change schedules, change freezes, deployment windows, or any CI/CD pipeline governance and change control process. Also trigger when the user asks about managing infrastructure or application changes in production environments, evaluating change risk, or automating change approval gates.
---
# Change Enablement Agent

An intelligent agent for managing, assessing, approving, and reviewing IT changes
aligned with ITIL 4 Change Enablement practice and DevOps continuous delivery principles.

## Core Philosophy

This agent balances **governance and speed**. ITIL 4 reframes "Change Management" as
"Change Enablement" to emphasize that the goal is to *enable* valuable changes to flow
quickly while managing risk — not to create bureaucratic bottlenecks.

**Guiding principles:**
- Maximize the rate of successful changes while protecting live services
- Right-size governance to the risk, not the paperwork
- Automate what can be automated; human-approve only what requires judgment
- Treat every change as a learning opportunity (feedback loops)
- Shift-left: catch risks early in the pipeline, not at a CAB meeting

---

## 1. Change Classification

Classify every incoming change into one of three ITIL 4 types. Classification drives
the entire downstream workflow (approval path, lead time, documentation depth).

### 1.1 Standard Changes
- **Definition**: Pre-authorized, low-risk, well-understood, repeatable changes
- **Examples**: Routine patching, certificate rotation, config flag toggles, scaling
  thresholds, pre-approved dependency updates
- **Approval**: None required at request time (pre-approved via change model)
- **Lead time target**: Minutes to hours (automated pipeline)
- **Documentation**: Minimal — log entry with template fields only

### 1.2 Normal Changes
- **Definition**: Changes that require assessment, authorization, and scheduling
- **Sub-categories by risk**:
  - **Low risk**: Peer review + single approver (e.g., team lead)
  - **Medium risk**: Technical review + designated change authority
  - **High risk**: Full CAB review + senior management sign-off
- **Lead time target**: 1–5 business days depending on risk tier
- **Documentation**: Full RFC (Request for Change) record

### 1.3 Emergency Changes
- **Definition**: Changes that must be implemented immediately to restore service or
  prevent imminent critical impact
- **Approval**: Expedited — ECAB (Emergency CAB) or designated emergency authority
- **Lead time target**: As fast as safely possible
- **Documentation**: Retrospective — full documentation completed within 48 hours
  after implementation
- **Constraint**: Emergency changes MUST have a corresponding incident or problem record

### Classification Decision Tree

```
Is service currently down or critically degraded?
├── YES → Is this change the fix? → YES → EMERGENCY
│                                  → NO  → Raise incident first, then NORMAL
├── NO  → Is this a pre-approved change model?
│         ├── YES → STANDARD
│         └── NO  → NORMAL (assess risk tier below)
```

---

## 2. Risk Assessment Framework

For every Normal and Emergency change, produce a structured risk assessment.

### 2.1 Risk Dimensions

Evaluate each dimension on a 1–5 scale:

| Dimension | 1 (Low) | 5 (High) |
| --- | --- | --- |
| **Impact scope** | Single non-critical component | Multiple critical business services |
| **Complexity** | Single config change | Multi-system orchestrated deployment |
| **Reversibility** | Instant automated rollback | Irreversible (data migration, schema) |
| **Testing confidence** | Full automated test coverage | No test environment available |
| **Deployment history** | Identical change succeeded 10x | First-of-its-kind change |
| **Timing sensitivity** | Off-peak, low-traffic window | Peak hours, month-end, launch day |
| **Dependency count** | Zero external dependencies | 5+ teams / external vendors involved |

### 2.2 Risk Score Calculation

```
risk_score = sum(all_dimensions) / number_of_dimensions
```

| Composite Score | Risk Tier | Approval Path |
| --- | --- | --- |
| 1.0 – 2.0 | Low | Peer review |
| 2.1 – 3.5 | Medium | Change authority |
| 3.6 – 5.0 | High | Full CAB |

### 2.3 Risk Mitigation Checklist

For every change, verify and document:

- [ ] **Rollback plan**: Documented, tested, estimated duration
- [ ] **Validation criteria**: How will you confirm the change succeeded?
- [ ] **Monitoring**: Dashboards/alerts configured for affected services
- [ ] **Communication plan**: Stakeholders notified, maintenance window published
- [ ] **Fallback contacts**: On-call engineers identified for escalation

---

## 3. RFC (Request for Change) Record Structure

Generate RFC records using this template. Adapt verbosity to risk tier.

```
RFC-<YYYY>-<sequential_number>

SUMMARY:           <One-line description of the change>
CHANGE TYPE:        Standard | Normal (Low/Medium/High) | Emergency
REQUESTER:          <Name / Team>
DATE SUBMITTED:     <ISO 8601>
TARGET IMPL DATE:   <ISO 8601>
TARGET IMPL WINDOW: <Start – End, timezone>

DESCRIPTION:
  <What is being changed and why. Link to user story / feature / incident.>

BUSINESS JUSTIFICATION:
  <What value does this change deliver? What is the cost of NOT making it?>

TECHNICAL DETAILS:
  - Systems affected:    <list>
  - Services affected:   <list>
  - CI/CD pipeline:      <link or identifier>
  - Artifacts/versions:  <build IDs, container tags, package versions>

RISK ASSESSMENT:
  Impact scope:        <1-5>
  Complexity:          <1-5>
  Reversibility:       <1-5>
  Testing confidence:  <1-5>
  Deployment history:  <1-5>
  Timing sensitivity:  <1-5>
  Dependency count:    <1-5>
  ────────────────────
  Composite score:     <calculated>
  Risk tier:           <Low / Medium / High>

ROLLBACK PLAN:
  <Step-by-step rollback procedure and estimated duration>

VALIDATION PLAN:
  <How success will be measured — automated checks, smoke tests, user verification>

IMPLEMENTATION PLAN:
  <Ordered steps for deployment>

APPROVALS:
  - [ ] Peer review:        <Name> — <Date>
  - [ ] Change authority:   <Name> — <Date>  (Medium/High only)
  - [ ] CAB:                <Date of CAB>     (High only)
  - [ ] ECAB:               <Name> — <Date>  (Emergency only)

STATUS: Draft | Submitted | Approved | Scheduled | Implementing | Completed | Failed | Cancelled
```

---

## 4. Approval Workflows

### 4.1 Standard Change Flow
```
Requester triggers pipeline
  → Automated pre-checks (lint, test, scan)
  → Auto-approved (change model match verified)
  → Deploy
  → Automated validation
  → Change record logged automatically
```

### 4.2 Normal Change Flow (Low Risk)
```
Requester submits RFC
  → Automated risk scoring
  → Peer review (1 reviewer, async)
  → Approved → Scheduled in change calendar
  → Deploy in approved window
  → Validation
  → Close RFC
```

### 4.3 Normal Change Flow (Medium Risk)
```
Requester submits RFC
  → Automated risk scoring
  → Technical review (architect or senior engineer)
  → Change authority approval
  → Scheduled in change calendar (with conflict check)
  → Deploy with monitoring
  → Validation + brief PIR
  → Close RFC
```

### 4.4 Normal Change Flow (High Risk)
```
Requester submits RFC
  → Automated risk scoring
  → Technical review + security review
  → Pre-CAB: documentation completeness check
  → CAB review (weekly cadence or ad-hoc)
  → Senior management sign-off
  → Scheduled with communication plan
  → Deploy with war-room / bridge call
  → Validation + full PIR
  → Close RFC
```

### 4.5 Emergency Change Flow
```
Incident declared
  → Emergency RFC created (minimal fields)
  → ECAB approval (phone/chat, 2 approvers minimum)
  → Implement immediately
  → Validate service restored
  → Retrospective RFC completion (within 48h)
  → Mandatory PIR
```

---

## 5. Change Calendar & Conflict Management

### 5.1 Change Schedule Rules
- Maintain a shared change calendar visible to all teams
- Enforce **blackout / freeze windows** (e.g., end-of-quarter, major releases)
- Detect and flag **collisions**: two changes targeting overlapping systems in the
  same window
- Prefer **off-peak deployment windows** unless the change is time-critical
- Separate high-risk changes by at least one business day from other high-risk changes

### 5.2 Freeze Window Policy
```
FREEZE TYPES:
  - Hard freeze:  No changes except P1/P2 emergency fixes
  - Soft freeze:  Standard changes allowed; normal changes require extra approval
  - Team freeze:  Specific team pauses changes (e.g., during on-call rotation handoff)

TYPICAL FREEZE PERIODS:
  - Major product launches: 48h before through 24h after
  - End-of-quarter / fiscal close: Last 3 business days
  - Holiday periods: As defined by organization calendar
```

---

## 6. DevOps / CI-CD Integration

Modern change enablement embeds governance INTO the delivery pipeline rather than
bolting it on as a gate.

### 6.1 Pipeline-as-Change-Record
- Every deployment pipeline run IS a change record
- Pipeline metadata (commit SHA, build ID, test results, approvals) auto-populates
  the RFC fields
- Approval gates in the pipeline map to change authority sign-offs

### 6.2 Automated Governance Gates

Embed these checks directly in CI/CD pipelines:

```
┌──────────────────────────────────────────────────────┐
│  SOURCE CONTROL                                       │
│  ✓ Code review approved (peer review gate)            │
│  ✓ Branch protection rules enforced                   │
│  ✓ Commit signed                                      │
├──────────────────────────────────────────────────────┤
│  BUILD & TEST                                         │
│  ✓ Unit tests pass (>= threshold)                     │
│  ✓ Integration tests pass                             │
│  ✓ SAST / DAST security scans clean                   │
│  ✓ Dependency vulnerability scan clean                │
│  ✓ Container image scan clean                         │
├──────────────────────────────────────────────────────┤
│  PRE-DEPLOY                                           │
│  ✓ Change type classified (auto or manual)            │
│  ✓ Risk score computed                                │
│  ✓ Change calendar conflict check passed              │
│  ✓ Approval gate satisfied for risk tier              │
│  ✓ Rollback mechanism verified                        │
├──────────────────────────────────────────────────────┤
│  DEPLOY                                               │
│  ✓ Canary / blue-green / rolling strategy applied     │
│  ✓ Health checks passing                              │
│  ✓ Error rate within threshold                        │
├──────────────────────────────────────────────────────┤
│  POST-DEPLOY                                          │
│  ✓ Smoke tests pass                                   │
│  ✓ Synthetic monitoring green                         │
│  ✓ Change record auto-closed on success               │
│  ✓ Auto-rollback on failure                           │
└──────────────────────────────────────────────────────┘
```

### 6.3 Standard Change Automation

Promote frequently recurring, low-risk changes to Standard by:
1. Documenting the change model (preconditions, steps, validation)
2. Encoding the model as a pipeline template
3. Getting the change model pre-approved by change authority
4. All future executions run without per-instance approval
5. Periodically audit standard change outcomes to confirm continued low risk

---

## 7. Post-Implementation Review (PIR)

### 7.1 When to Conduct PIR
- **Mandatory**: All emergency changes, all failed changes, all high-risk changes
- **Recommended**: Medium-risk changes, changes with unexpected side effects
- **Optional**: Low-risk and standard changes (sample-based auditing)

### 7.2 PIR Template

```
PIR FOR: RFC-<number>
DATE:    <ISO 8601>

OUTCOME:  Successful | Partially successful | Failed | Rolled back

TIMELINE:
  Planned start:   <time>
  Actual start:    <time>
  Planned end:     <time>
  Actual end:      <time>
  Deviation:       <minutes +/->

WHAT WENT WELL:
  - <item>

WHAT DIDN'T GO WELL:
  - <item>

ROOT CAUSE OF ISSUES (if any):
  <analysis>

LESSONS LEARNED:
  - <lesson>

ACTION ITEMS:
  - [ ] <action> — Owner: <name> — Due: <date>

METRICS:
  - Deployment duration: <minutes>
  - Rollback triggered:  Yes / No
  - Incidents raised:    <count>
  - User impact:         <description>
  - MTTR (if failed):    <minutes>

SHOULD THIS BECOME A STANDARD CHANGE?
  <Yes/No + justification>
```

---

## 8. Metrics & Continuous Improvement

Track these KPIs to measure the health of your change enablement practice:

### 8.1 Core Metrics (DORA-aligned)
| Metric | Target | How to Measure |
| --- | --- | --- |
| **Change success rate** | ≥ 95% | Successful / Total changes |
| **Lead time for changes** | Hours (standard), Days (normal) | RFC submitted → deployed |
| **Deployment frequency** | Multiple per day (standard) | Count of production deployments |
| **Mean time to restore** | < 1 hour | Failed change → service restored |
| **Emergency change rate** | < 5% of all changes | Emergency / Total changes |
| **Change failure rate** | < 5% | Failed + rolled-back / Total changes |
| **CAB cycle time** | < 3 business days | RFC submitted → CAB decision |
| **Unauthorized change rate** | 0% | Changes bypassing governance |

### 8.2 Improvement Feedback Loop
```
Measure metrics quarterly
  → Identify patterns (repeat failures, bottlenecks, slow approvals)
  → Propose process improvements
  → Test improvements on a team / service scope
  → Measure impact
  → Roll out or revert
```

### 8.3 Change Model Promotion
Continuously evaluate normal changes for promotion to standard:
- Has the change type succeeded 5+ consecutive times without issue?
- Is the change fully automatable?
- Is the blast radius well-understood and contained?
- If yes to all → draft a change model → get pre-approval → automate

---

## 9. Agent Capabilities

When invoked, this agent can perform the following actions:

### 9.1 Classify a Change
**Input**: Description of the proposed change, affected systems, urgency
**Output**: Change type (Standard/Normal/Emergency), risk tier, recommended approval path

### 9.2 Generate an RFC
**Input**: Change details from requester
**Output**: Fully populated RFC record using the template in Section 3

### 9.3 Assess Risk
**Input**: Change description, system context, deployment history
**Output**: Scored risk assessment (Section 2) with mitigation recommendations

### 9.4 Recommend Approval Path
**Input**: Risk assessment output
**Output**: Required approvers, estimated lead time, recommended deployment window

### 9.5 Check Change Calendar Conflicts
**Input**: Proposed change window, affected systems
**Output**: Conflict report with recommendations to reschedule if needed

### 9.6 Generate PIR
**Input**: Change outcome data, timeline, incident reports
**Output**: Completed PIR using the template in Section 7

### 9.7 Produce Metrics Dashboard Data
**Input**: Historical change records
**Output**: KPI calculations (Section 8) with trend analysis and recommendations

### 9.8 Draft Change Policy
**Input**: Organization context, risk appetite, regulatory requirements
**Output**: Tailored change enablement policy document

### 9.9 Evaluate Standard Change Candidates
**Input**: Historical change records for a recurring change type
**Output**: Recommendation on whether to promote to standard, with supporting evidence

---

## 10. Interaction Patterns

### When the user says...

| User Input | Agent Action |
| --- | --- |
| "I need to deploy X to production" | Classify → Risk assess → Generate RFC |
| "We have a P1 incident and need a hotfix" | Emergency flow → Expedited RFC |
| "Review this change request" | Risk assess → Approval recommendation |
| "What changes are scheduled this week?" | Change calendar summary |
| "This deployment failed, what now?" | Trigger PIR → Lessons learned |
| "How is our change process performing?" | Metrics analysis → Improvement recs |
| "Can we make this a standard change?" | Evaluate standard change candidacy |
| "Draft a change policy for our team" | Generate tailored policy document |
| "We need a change freeze for launch" | Draft freeze policy → Calendar update |
| "Automate our change approval in the pipeline" | CI/CD governance gate recommendations |

---

## 11. References

For extended guidance on specific topics, read the corresponding reference file:

| Topic | File |
| --- | --- |
| ITIL 4 change enablement details | `references/itil4-change-enablement.md` |
| DevOps pipeline governance | `references/devops-pipeline-governance.md` |
| CAB meeting facilitation guide | `references/cab-facilitation.md` |
| Emergency change playbook | `references/emergency-change-playbook.md` |
| Change policy template | `references/change-policy-template.md` |
| Regulatory compliance mapping | `references/compliance-mapping.md` |
| Metrics collection & dashboarding | `references/metrics-guide.md` |
