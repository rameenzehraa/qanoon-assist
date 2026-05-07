# Software Requirements Specification

## Qanoon Assist — Legal Services Platform

---

| Field | Detail |
|-------|--------|
| **Document version** | 2.0 |
| **Status** | Final |
| **Date** | 2026-05-04 |
| **Course** | Software Engineering — Design Pattern Implementation |
| **Authors** | Rameen Zehra |
| **Standard** | Based on IEEE Std 830-1998 (IEEE Recommended Practice for Software Requirements Specifications) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [Design Pattern Implementation](#4-design-pattern-implementation)
5. [System Models](#5-system-models)
6. [Testing Strategy](#6-testing-strategy)
7. [Deployment](#7-deployment)
8. [References](#8-references)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) describes the functional and non-functional requirements for **Qanoon Assist**, a web-based legal services platform that connects Pakistani citizens seeking legal counsel with verified lawyers. The document is prepared primarily as a Software Engineering course artifact demonstrating the application of five classical software design patterns to a real-world Django/DRF codebase. It serves as the authoritative specification for developers, evaluators, and stakeholders reviewing the design and architecture decisions made during refactoring.

### 1.2 Scope

Qanoon Assist provides the following core capabilities:

- **Lawyer discovery** — citizens browse, filter, and contact verified lawyers by city and specialty.
- **Case management** — lawyers and citizens track case requests through a defined lifecycle (pending → accepted → in progress → completed/rejected).
- **Real-time messaging** — in-platform messaging attached to individual cases.
- **Knowledge base** — publicly accessible legal articles organized by category.
- **Notifications and audit logging** — automatic notifications on case status changes; immutable audit trail for all mutations.
- **Fee calculation** — pluggable fee-calculation strategies (hourly, flat, contingency) per lawyer.

The scope of this document extends beyond functional requirements to cover the architectural refactoring that applied five design patterns (Repository, Factory, Observer, Strategy, Singleton) to the codebase, with measured complexity metrics reported as evidence of improvement.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| **API** | Application Programming Interface |
| **CC** | Cyclomatic Complexity — a software metric (McCabe, 1976) counting independent execution paths through a method |
| **CNIC** | Computerised National Identity Card (Pakistan national ID format: XXXXX-XXXXXXX-X) |
| **CORS** | Cross-Origin Resource Sharing |
| **DRF** | Django REST Framework |
| **FK** | Foreign Key |
| **JWT** | JSON Web Token — stateless authentication token standard (RFC 7519) |
| **M2M** | Many-to-Many (database relationship) |
| **N+1** | A database query anti-pattern where a list of N rows triggers N additional queries |
| **ORM** | Object-Relational Mapper |
| **PaaS** | Platform as a Service |
| **radon** | Python static analysis tool measuring Cyclomatic Complexity; grades A (1–5) through F (21+) |
| **SRS** | Software Requirements Specification |
| **TLS** | Transport Layer Security |
| **UML** | Unified Modelling Language |

### 1.4 Overview

Section 2 describes the product in its operating context. Section 3 specifies functional and non-functional requirements. Section 4 — the primary academic contribution — documents the five design patterns applied, the problems each solved, and quantitative before/after complexity metrics measured with radon. Section 5 references the UML diagrams. Sections 6 and 7 cover testing and deployment respectively.

---

## 2. Overall Description

### 2.1 Product Perspective

Qanoon Assist is a standalone web application with a decoupled frontend/backend architecture. It is not a component of a larger existing system. The backend exposes a RESTful JSON API consumed by a React/Next.js single-page application. The platform operates as a three-tier system:

```
[React/Next.js Frontend — Vercel]
          ↕ HTTPS / JWT
[Django REST Framework API — Railway]
          ↕ TLS PostgreSQL connection
[PostgreSQL Database — Supabase]
```

The application was initially developed with all business logic embedded in Django views and serializers. A structured refactoring pass applied five design patterns to separate concerns, eliminate raw SQL, and provide a measurable reduction in cyclomatic complexity. This SRS documents both the original requirements and the architectural decisions made during that refactoring.

### 2.2 Product Functions

The platform provides the following major functional groupings:

**F1 — Authentication and Registration**
Citizens register with personal details (name, CNIC, city). Lawyers register with professional credentials (Bar Council number, experience, fee structure) and await admin verification. All authenticated sessions use JWT access tokens (60-minute lifetime) with refresh tokens (1-day lifetime).

**F2 — Lawyer Discovery**
Verified lawyers are publicly browsable. Citizens may filter by city and legal specialty. Each lawyer profile displays credentials, specialties, city, bio, consultation fee, and fee strategy type (hourly/flat/contingency).

**F3 — Case Request Lifecycle**
Citizens submit case requests to specific lawyers. Requests follow a defined state machine: `pending → accepted → in_progress → completed` or `pending → rejected`. State transitions are gated by user role: only the receiving lawyer may accept or reject; only the assigned lawyer may start progress or mark complete.

**F4 — Active Case Management**
Once in progress, a case supports hearing scheduling and narrative case updates, both authored by the assigned lawyer.

**F5 — In-Platform Messaging**
Citizens and lawyers exchange messages on a per-case basis. Unread counts and per-case message statistics are tracked.

**F6 — Notifications**
Automatic in-platform notifications are dispatched to relevant users on case state transitions: acceptance, rejection, progress start, and completion. Notifications track read/unread state.

**F7 — Audit Logging**
All case state mutations are recorded to an immutable `CaseAuditLog` with the acting user, timestamp, action name, and metadata (new status, case number, etc.).

**F8 — Fee Calculation**
Each lawyer configures a fee strategy type. The system calculates the expected case fee using the appropriate formula: hourly rate × estimated hours; fixed flat fee; or a percentage of claim value.

**F9 — Knowledge Base**
Publicly accessible legal articles are organised by category. Articles support keyword search.

**F10 — Admin Tools**
Administrators review pending lawyer registrations, verify or reject accounts, and have read-only access to all cases, hearings, and case requests.

### 2.3 User Classes and Characteristics

**Citizen**
General public users seeking legal assistance. Expected to have basic digital literacy; no legal expertise assumed. Primary interactions: lawyer discovery, case request submission, progress monitoring, messaging.

**Lawyer**
Verified legal professionals. Required to hold a valid Bar Council number. Primary interactions: case request management, hearing and update authoring, messaging. Accounts are inactive until verified by an administrator.

**Admin**
Platform administrators responsible for lawyer verification and platform oversight. Not a public-facing role; accessed via standard browser session.

### 2.4 Operating Environment

| Component | Technology | Version / Host |
|-----------|-----------|----------------|
| Backend framework | Django + Django REST Framework | 5.2.7 / 3.16.1 |
| Authentication | djangorestframework-simplejwt | 5.5.1 |
| Database | PostgreSQL (Supabase) | 15+ |
| Python runtime | Python | 3.13 |
| Backend hosting | Railway | PaaS |
| Frontend | React / Next.js | — |
| Frontend hosting | Vercel | CDN/PaaS |
| Static files | WhiteNoise | 6.12.0 |
| WSGI server | Gunicorn | 25.3.0 |
| Media storage | Django FileSystemStorage | — |

### 2.5 Constraints

**C1** — All API responses must use JSON; no server-side HTML rendering.  
**C2** — Lawyer accounts must not be accessible to citizens until an admin has set `is_verified = True`.  
**C3** — CNIC values for lawyers must match the format `XXXXX-XXXXXXX-X` and must be unique system-wide.  
**C4** — Database migrations must be backward-compatible; destructive migrations require explicit review.  
**C5** — The `unique_together` constraint on `(CaseRequest.requester, CaseRequest.lawyer, CaseRequest.case_title)` prevents duplicate case submissions.  
**C6** — All media uploads (lawyer profile pictures) use filesystem storage; object storage (S3/R2) is out of scope for this version.

### 2.6 Assumptions and Dependencies

**A1** — Supabase provides a valid `DATABASE_URL` connection string in the production environment.  
**A2** — The frontend application handles JWT refresh token rotation and stores tokens in secure, httpOnly cookies or memory (not localStorage).  
**A3** — Email notification delivery is out of scope; notifications are in-platform only.  
**A4** — The `django-extensions` package is available in both development and production environments; it is listed in `INSTALLED_APPS`.  
**A5** — `python-decouple` reads environment variables from `.env` in development and from the PaaS environment in production; no separate secrets manager is required.

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Management Module (FR-USR)

| ID | Requirement |
|----|-------------|
| FR-USR-01 | The system shall allow unauthenticated users to register as citizens, providing username, email, password, CNIC, city, and address. |
| FR-USR-02 | The system shall allow unauthenticated users to register as lawyers, providing all citizen fields plus Bar Council number, experience years, consultation fee, city, bio, and an optional profile picture. |
| FR-USR-03 | The system shall validate CNIC format (XXXXX-XXXXXXX-X) on lawyer registration and reject duplicate CNICs. |
| FR-USR-04 | The system shall hash all passwords using Django's PBKDF2 algorithm prior to persistence. |
| FR-USR-05 | The system shall return a JWT access token and refresh token upon successful login. |
| FR-USR-06 | JWT access tokens shall expire after 60 minutes; refresh tokens after 24 hours. |
| FR-USR-07 | The system shall expose a `GET /api/users/me/` endpoint returning the authenticated user's profile. |
| FR-USR-08 | Lawyers shall default to `is_verified = False` on registration and shall be excluded from lawyer listings until verified. |
| FR-USR-09 | Admin users shall be able to verify a pending lawyer via `POST /api/users/lawyers/{id}/verify/`. |
| FR-USR-10 | Admin users shall be able to reject and delete a pending lawyer account via `POST /api/users/lawyers/{id}/reject/`. |
| FR-USR-11 | The system shall expose lawyer statistics aggregated by city via `GET /api/users/lawyers/stats/`. |

#### 3.1.2 Case Management Module (FR-CASE)

| ID | Requirement |
|----|-------------|
| FR-CASE-01 | Authenticated citizens shall submit case requests to verified lawyers specifying title, type, description, and urgency level. |
| FR-CASE-02 | The system shall enforce a unique constraint on (citizen, lawyer, case title), returning HTTP 400 on duplicate submission. |
| FR-CASE-03 | Lawyers shall accept pending case requests via `POST /api/cases/requests/{id}/accept/` with an optional response message. |
| FR-CASE-04 | Lawyers shall reject pending case requests via `POST /api/cases/requests/{id}/reject/` with an optional response message. |
| FR-CASE-05 | On acceptance, the system shall transition the request status to `accepted` and record the response date. |
| FR-CASE-06 | Lawyers shall start case progress via `POST /api/cases/requests/{id}/start_progress/`, creating a linked `Case` object. |
| FR-CASE-07 | Lawyers shall mark cases complete via `POST /api/cases/requests/{id}/complete/`. |
| FR-CASE-08 | The system shall auto-generate a unique case number in the format `QA-{YEAR}-{RANDOM}` on `Case` creation. |
| FR-CASE-09 | Lawyers shall schedule hearings (`POST /api/cases/hearings/`) with date, location, notes, and optional next hearing date. |
| FR-CASE-10 | Lawyers shall add case updates (`POST /api/cases/updates/`) with a title and description. |
| FR-CASE-11 | Citizens shall mark a case request as viewed (`POST /api/cases/requests/{id}/mark_viewed/`) to record last-viewed timestamp. |
| FR-CASE-12 | The system shall calculate the case fee on demand via `CaseRepository.calculate_fee(case)` using the lawyer's configured strategy. |

#### 3.1.3 Messaging Module (FR-MSG)

| ID | Requirement |
|----|-------------|
| FR-MSG-01 | Authenticated citizens and lawyers shall exchange messages scoped to a specific `CaseRequest`. |
| FR-MSG-02 | The system shall return messages ordered by creation time ascending. |
| FR-MSG-03 | The system shall provide an unread message count per user via `GET /api/messaging/unread_count/`. |
| FR-MSG-04 | The system shall provide per-user messaging statistics (total sent, total received, unread) via `GET /api/messaging/stats/`. |
| FR-MSG-05 | Messages shall be marked read when the recipient retrieves the message list for a case. |

#### 3.1.4 Knowledge Base Module (FR-KB)

| ID | Requirement |
|----|-------------|
| FR-KB-01 | All users (including unauthenticated) shall browse legal categories via `GET /api/knowledge-base/categories/`. |
| FR-KB-02 | All users shall browse legal articles filtered by category. |
| FR-KB-03 | The system shall support keyword search across article titles and content via `GET /api/knowledge-base/articles/search/?q={term}`. |

#### 3.1.5 Notification Module (FR-NOTIF)

| ID | Requirement |
|----|-------------|
| FR-NOTIF-01 | The system shall create a `Notification` for the case requester when their request is accepted. |
| FR-NOTIF-02 | The system shall create a `Notification` for the case requester when their request is rejected. |
| FR-NOTIF-03 | The system shall create a `Notification` for the case requester when a `Case` object is created from their request. |
| FR-NOTIF-04 | The system shall create a `Notification` for the lawyer when a case is marked closed. |
| FR-NOTIF-05 | All notifications shall default to `is_read = False` and shall be retrievable and markable as read by the owning user. |

#### 3.1.6 Audit Module (FR-AUDIT)

| ID | Requirement |
|----|-------------|
| FR-AUDIT-01 | The system shall create a `CaseAuditLog` entry on every case status transition, recording the action name, acting user, timestamp, and new status in `metadata`. |
| FR-AUDIT-02 | The system shall create a `CaseAuditLog` entry when a `Case` is created from a request, recording the case ID and case number in `metadata`. |
| FR-AUDIT-03 | The system shall create a `CaseAuditLog` entry with action `case_closed` when a case is marked complete. |
| FR-AUDIT-04 | Audit log entries shall be immutable after creation (`auto_now_add=True`; no update endpoints exposed). |

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | List endpoints returning case requests shall issue no more than 5 database queries regardless of list size, achieved via `select_related` and `prefetch_related`. |
| NFR-PERF-02 | The API shall return a response to authenticated list requests in under 500 ms under typical load (≤ 50 concurrent users). |
| NFR-PERF-03 | Database connections shall use persistent connection pooling (`conn_max_age = 600`). |

#### 3.2.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | All production traffic shall be served over HTTPS; the `SECURE_PROXY_SSL_HEADER` setting trusts the PaaS-injected `X-Forwarded-Proto` header. |
| NFR-SEC-02 | `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, and `SECURE_HSTS_SECONDS` (31,536,000) shall be enforced in production. |
| NFR-SEC-03 | `DEBUG` shall be `False` in all production deployments; the production settings module (`qanoon_assist.settings_prod`) enforces this unconditionally. |
| NFR-SEC-04 | All role-based access checks (citizen/lawyer/admin) shall be enforced at the view layer; unverified lawyers shall receive HTTP 403 on protected actions. |
| NFR-SEC-05 | CNIC values are stored in plaintext; no other PII is stored beyond what is necessary for platform operation. |

#### 3.2.3 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MAINT-01 | No method in the codebase shall exceed Cyclomatic Complexity grade B (CC ≤ 10) as measured by radon. |
| NFR-MAINT-02 | View methods shall contain no direct ORM queries; all database access shall be routed through repository classes. |
| NFR-MAINT-03 | Object creation logic shall reside exclusively in factory classes; serializers shall be validation-only. |
| NFR-MAINT-04 | Side-effects triggered by state transitions (notifications, audit logs) shall be implemented as Django signal receivers, not inline view code. |
| NFR-MAINT-05 | Adding a new fee calculation model shall require only the addition of a new concrete `FeeStrategy` subclass with no modification to existing repository or view code. |

---

## 4. Design Pattern Implementation

This section constitutes the primary academic contribution of this project. Five classical GoF and architectural design patterns were applied to the Qanoon Assist codebase. For each pattern, the original problem is described, the implemented structure is documented, and quantitative complexity metrics are provided using radon Cyclomatic Complexity scores measured on the final codebase.

Baseline metrics are sourced from the initial codebase audit. Post-refactor metrics are measured via `radon cc backend/ -a -s` (excluding `venv/`, `migrations/`, `tests/`) against the `main` branch. Full data is in `docs/benchmark/benchmark_report.md`.

**Overall result:** the whole-codebase average cyclomatic complexity after all five patterns measured **A (2.01)** across 215 analysed blocks.

---

### 4.1 Repository Pattern

**Problem Statement**

The original views contained 13 raw `cursor.execute()` SQL blocks and 18 methods with inline ORM calls. Each view method was responsible for both HTTP request/response handling and database access. Representative examples: `MessagingViewSet.stats()` used raw SQL to compute per-user message statistics (CC 10, grade C); `CaseRequestViewSet.accept()` executed a query, updated fields, and fired a side-effect in a single 8-branch method (CC 8, grade B). Any change to a query required editing view code directly.

**Structure**

Three repository classes were introduced in `backend/repositories/`:

- `CaseRepository` — 25 methods covering all case-domain queries, mutations, and fee delegation
- `UserRepository` — 8 methods covering lawyer listing, verification, and deletion
- `MessageRepository` — 7 methods covering messaging queries and statistics

Views instantiate repository objects at module level and delegate all data access through named methods. No ORM import appears in any view file.

**Measured Impact**

| Metric | Before | After | Change |
|--------|:------:|:-----:|:------:|
| Raw SQL `cursor.execute()` blocks | 13 | 0 | −100% |
| View methods with inline ORM | 18 | 0 | −100% |
| `cases/views.py` average CC | 7.8 (B/C) | 2.4 (A) | −69% |
| `CaseRequestViewSet.accept` CC | 8 (B) | 1 (A) | −88% |
| `MessagingViewSet.stats` CC | 10 (C) | 1 (A) | −90% |
| `CaseRepository` average CC | — | 1.5 (A) | — |

**Benefit**

The repository acts as a single seam between the HTTP layer and the database. Queries are named, testable in isolation, and changeable without touching view logic. The pattern also enabled systematic `select_related`/`prefetch_related` application (see Section 4.6).

---

### 4.2 Factory Pattern

**Problem Statement**

User creation logic was distributed across four files: `CitizenRegistrationSerializer.create()` (CC 7, B), `LawyerRegistrationSerializer.create()` (CC 12, C), and two view methods. The serializer `create()` methods each performed `User.objects.create_user()`, profile model creation, and optional M2M specialty assignment in a single method. Critically, no transaction boundary protected these operations: if profile creation failed after `User` was saved, an orphaned `User` row was left in the database with no rollback.

**Structure**

`UserFactory` in `backend/factories/user_factory.py` exposes a single public method `create(role, **data)` that dispatches to one of three private creator methods (`_create_citizen`, `_create_lawyer`, `_create_admin`), each decorated with `@transaction.atomic`. If profile creation raises any exception, the transaction rolls back and the `User` row is removed. Serializers were reduced to validation-only classes with no `create()` methods.

**Measured Impact**

| Metric | Before | After | Change |
|--------|:------:|:-----:|:------:|
| Files containing user-creation logic | 4 | 1 | −75% |
| `LawyerRegistrationSerializer.create` CC | 12 (C) | removed | — |
| `CitizenRegistrationSerializer.create` CC | 7 (B) | removed | — |
| `CitizenRegistrationView.create` CC | 6 (B) | 1 (A) | −83% |
| `LawyerRegistrationView.create` CC | 7 (B) | 1 (A) | −86% |
| Atomicity guarantee on user + profile creation | ✗ | ✓ | added |
| `UserFactory._create_lawyer` CC | — | 3 (A) | — |

**Benefit**

Object creation is centralised, atomic, and tested independently of HTTP concerns. The factory is the exclusive entry point for user instantiation, eliminating the class of bugs caused by partial creation.

---

### 4.3 Observer Pattern

**Problem Statement**

Four view action methods (`accept`, `reject`, `start_progress`, `complete`) each contained direct calls to `Notification.objects.create()` as in-line side-effects. This coupled the view to the notification model, violated the Single Responsibility Principle, and made it impossible to add new side-effects (e.g., audit logging, email delivery) without modifying each of the four views individually. The pattern also made side-effect behaviour difficult to test independently.

**Structure**

Three Django `Signal()` instances were defined in `cases/signals/case_signals.py`:

- `case_status_changed` — fired by `accept_request`, `reject_request`, `mark_in_progress`, `mark_complete`
- `case_assigned` — fired by `create_case_from_request` when a new `Case` is created
- `case_closed` — fired additionally by `mark_complete`

Two observer classes (`NotificationObserver`, `AuditLogObserver`) register static handler methods against each signal using `signal.connect(..., dispatch_uid=...)`. The `dispatch_uid` parameter prevents duplicate connection under Django's module-reload behaviour during test execution. Signals are fired by `CaseRepository` mutation methods, which accept a `performed_by` parameter forwarded from `request.user` in the view.

`NotificationObserver` delegates creation to `NotificationService()` (the Singleton described in Section 4.5). `AuditLogObserver` calls `CaseAuditLog.objects.create()` directly.

**Measured Impact**

| Metric | Before | After | Change |
|--------|:------:|:-----:|:------:|
| View actions with hardcoded `Notification.objects.create()` | 4 | 0 | −100% |
| Observer classes | 0 | 2 | added |
| `CaseRequestViewSet.accept` CC | 8 (B) | 1 (A) | −88% |
| `CaseRequestViewSet.complete` CC | 6 (B) | 1 (A) | −83% |
| `NotificationObserver.on_status_changed` CC | — | 2 (A) | — |
| Adding a new side-effect requires modifying views | yes | no | fixed |

**Benefit**

The Observer pattern decouples event producers (repository) from event consumers (observers). New side-effects (email, SMS, push) can be added by registering an additional receiver without touching any existing code, satisfying the Open/Closed Principle.

---

### 4.4 Strategy Pattern

**Problem Statement**

No fee calculation existed in the original codebase. The natural location — a view method or serializer — would have hardcoded a single fee formula and coupled pricing logic to HTTP handling. Changing the fee model or supporting multiple models per lawyer would have required branching logic inside the view, increasing CC and violating the Single Responsibility Principle.

**Structure**

`FeeStrategy` is an abstract base class (`abc.ABC`) in `backend/strategies/fee_strategy.py` with one abstract method `calculate(case) -> Decimal`. Three concrete subclasses implement the interface:

- `HourlyFeeStrategy` — `hourly_rate × estimated_hours`
- `FlatFeeStrategy` — returns `flat_fee` unchanged
- `ContingencyFeeStrategy` — `(contingency_percentage / 100) × claim_value`

`FeeStrategyFactory.get(strategy_type)` instantiates the correct concrete class or raises `ValueError` for unknown types. `LawyerProfile` carries three new nullable `DecimalField` columns (`hourly_rate`, `flat_fee`, `contingency_percentage`) and a `fee_strategy_type` `CharField` with choices `hourly | flat | contingency`, defaulting to `flat`.

`CaseRepository.calculate_fee(case)` reads `case.case_request.lawyer.fee_strategy_type`, calls `FeeStrategyFactory.get()`, and delegates to `strategy.calculate(case)`. The repository contains no fee formula; it is entirely delegated.

**Measured Impact**

| Metric | Before | After |
|--------|:------:|:-----:|
| Supported fee models | 0 | 3 |
| `CaseRepository.calculate_fee` CC | — | 1 (A) |
| `FeeStrategyFactory.get` CC | — | 3 (A) |
| All strategy `calculate()` methods CC | — | 2–3 (A) |
| Adding a new fee type requires modifying existing code | — | no |

**Benefit**

The Strategy pattern satisfies the Open/Closed Principle completely: adding a `RetainerFeeStrategy` requires one new class and one entry in `FeeStrategyFactory._strategies` — zero changes to the repository, views, or models.

---

### 4.5 Singleton Pattern

**Problem Statement**

Two concerns motivated this pattern. First, `django.conf.settings` was accessed in scattered locations with no central control, making it impossible to cache or validate configuration at startup. Second, `Notification.objects.create()` was called from four different callsites (views and signals) with no shared API, making it difficult to add cross-cutting behaviour (rate limiting, batching, read-state initialisation) later.

**Structure**

Two Singleton classes were implemented in `backend/utils/`, both using Python's `__new__` override with a class-level `threading.Lock()` and double-checked locking to guarantee thread-safe single-instance initialisation:

**`ConfigManager`** loads `DEBUG`, `ALLOWED_HOSTS`, `DB_NAME`, `JWT_ACCESS_MINUTES`, and `JWT_REFRESH_DAYS` from Django settings into a private `_cache` dict during the first instantiation. Subsequent calls to `ConfigManager()` return the same instance, reading from cache. A `reset()` classmethod drops the instance for test isolation.

**`NotificationService`** centralises all `Notification` ORM operations behind three methods: `dispatch(user, message, related_case)`, `get_unread_count(user)`, and `mark_all_read(user)`. `NotificationObserver` calls `NotificationService().dispatch()` rather than accessing the ORM directly.

**Measured Impact**

| Metric | Before | After | Change |
|--------|:------:|:-----:|:------:|
| Direct `Notification.objects.create()` callsites | 4 | 0 | −100% |
| Centralised notification API | no | yes | added |
| Thread-safe singleton guard | — | ✓ (Lock + double-check) | added |
| `NotificationService` all-methods avg CC | — | 1.5 (A) | — |
| `ConfigManager` all-methods avg CC | — | 2.4 (A) | — |

**Benefit**

A single notification dispatch point enables future cross-cutting concerns (delivery throttling, batch queuing, read-receipt initialisation) without touching observer code. `ConfigManager` provides a safe cache against repeated `settings.*` access and a clear contract for which configuration values the application depends on.

---

### 4.6 N+1 Query Elimination

Although not a named GoF pattern, the elimination of N+1 queries was a significant maintainability improvement enabled by the Repository pattern.

The original `CaseRequestSerializer` used three `SerializerMethodField` methods, each issuing one or more database queries per serialized row:

| Method | Queries/row | On 10 rows |
|--------|:-----------:|:----------:|
| `get_unread_messages_count` (raw SQL) | 1 | 10 extra |
| `get_case_id` | 1 | 10 extra |
| `get_has_new_updates` | 2 | 20 extra |
| **Total** | **4** | **~40 extra** |

`CaseRepository.get_requests_for_citizen()` and `get_requests_for_lawyer()` now eagerly load all related objects using `select_related` and `Prefetch`. Serializer methods were rewritten to traverse the prefetch cache in Python, issuing zero additional queries:

| Method | Queries/row (after) | On 10 rows |
|--------|:-------------------:|:----------:|
| `get_unread_messages_count` | 0 | 0 extra |
| `get_case_id` | 0 | 0 extra |
| `get_has_new_updates` | 0 | 0 extra |
| **Total** | **0** | **0 extra** |

Net reduction: ~42 queries per list response → **2** (one base query + one `IN (...)` batch per prefetched relation).

---

## 5. System Models

All UML diagrams are in PlantUML source format under `docs/uml/` and can be rendered via the PlantUML online server or the VS Code PlantUML extension.

### 5.1 Class Diagram — 
(./uml/01_class_diagram.png)

A multi-package class diagram showing all five patterns in a single view. Five colour-coded packages contain:
- **Repository Pattern** — `UserRepository`, `CaseRepository`, `MessageRepository` with full method signatures
- **Factory Pattern** — `UserFactory` with public `create()` and three private creator methods
- **Observer Pattern** — three `Signal` instances, `NotificationObserver`, `AuditLogObserver`, `Notification`, `CaseAuditLog` with signal-to-observer dependency arrows
- **Strategy Pattern** — `FeeStrategy` (abstract), three concrete strategies, `FeeStrategyFactory` with inheritance hierarchy
- **Singleton Pattern** — `ConfigManager` and `NotificationService` with `<<Singleton>>` stereotypes and `__new__` guard notation

Cross-package dependency arrows show `CaseRepository` sending signals and calling `FeeStrategyFactory`; `NotificationObserver` calling `NotificationService`; `NotificationService` creating `Notification` rows.

### 5.2 Sequence Diagram —
(./uml/02_sequence_diagram.png)

Documents the complete case acceptance flow across seven lifelines: HTTP client → `CaseRequestViewSet.accept()` → `CaseRepository.accept_request()` → PostgreSQL UPDATE → `case_status_changed.send()` → `NotificationObserver.on_status_changed()` → `NotificationService.dispatch()` → INSERT notification → `AuditLogObserver.on_status_changed()` → INSERT audit log → HTTP 200 response. The diagram makes the Observer pattern's runtime behaviour explicit, showing that both side-effects are synchronous and independent.

### 5.3 Use Case Diagram — 
(./uml/03_use_case_diagram.png)

Depicts three actors (Citizen, Lawyer, Admin) and their use cases across six functional groupings: Authentication, Lawyer Discovery, Case Requests, Active Cases, Messaging, and Administration. `<<include>>` dependencies show that case submission and lawyer verification require prior authentication. `<<extend>>` relationships show that notifications extend the accept, reject, and complete use cases.

### 5.4 Component Diagram — 
(./uml/04_component_diagram.png)


Shows seven vertical layers of the architecture with annotated dependency arrows:
1. **Client** — React frontend + JWT token
2. **Presentation** — DRF ViewSets and generic views
3. **Factory Layer** — `UserFactory` (with atomicity note)
4. **Repository Layer** — three repositories
5. **Strategy Layer** — `FeeStrategyFactory` and three concrete strategies
6. **Observer/Signal Layer** — three signals, two observer classes
7. **Singleton/Utility Layer** — `NotificationService`, `ConfigManager`
8. **Data Layer** — PostgreSQL via Django ORM

---

## 6. Testing Strategy

### 6.1 Overview

The refactoring introduced 138 automated tests across five test modules, all executed with Django's `TestCase` against a live PostgreSQL test database (`test_qanoon_assist`). Tests are located in `backend/tests/` and are run with:

```
python manage.py test tests --keepdb --verbosity=2
```

All 138 tests pass on the `main` branch.

### 6.2 Test Suite Breakdown

| Test File | Tests | Pattern Tested | Test Categories |
|-----------|------:|---------------|-----------------|
| `test_repositories.py` | 45 | Repository | Query correctness, edge cases, stats, has_new_updates |
| `test_factories.py` | 23 | Factory | Citizen/Lawyer/Admin creation, atomicity, specialty assignment, unknown role |
| `test_signals.py` | 19 | Observer | Signal firing, Notification creation, AuditLog creation, idempotency, performed_by |
| `test_strategies.py` | 24 | Strategy | Per-strategy calculation correctness, edge cases (None/zero), factory dispatch, ValueError |
| `test_singletons.py` | 27 | Singleton | Identity (`is`), get() values, reset() isolation, dispatch(), get_unread_count(), mark_all_read() |
| **Total** | **138** | **All** | |

### 6.3 Test Design Principles

**Isolation** — Each `TestCase` class calls `reset()` on Singleton instances in `tearDown()` to prevent state leakage between test cases. Signal observers use `dispatch_uid` strings, preventing duplicate connection during test suite execution.

**Atomicity testing** — `UserFactoryAtomicityTests` uses `unittest.mock.patch` to force profile creation to raise, then asserts that no orphaned `User` row remains. This directly validates the `@transaction.atomic` guarantee.

**Strategy unit testing** — Strategy tests use `MagicMock` to construct lightweight fake `Case` objects, keeping them independent of ORM and database state. This enables pure unit testing of calculation logic.

**Integration testing** — Repository and signal tests interact with the real PostgreSQL test database, validating that ORM queries produce correct results and that signals actually persist `Notification` and `CaseAuditLog` rows.

**Edge cases** — Each strategy test includes a `None`-value case (e.g., `hourly_rate=None`) to confirm the strategy gracefully returns `Decimal('0')` rather than raising `TypeError`.

### 6.4 Test Coverage by Pattern

**Repository (45 tests):** Verifies that each query method returns only the rows belonging to the requesting user, that stats counts are correct, and that `has_new_updates` returns the right boolean based on hearing/update creation timestamps.

**Factory (23 tests):** Verifies that citizen, lawyer, and admin creation persist both the `User` and the appropriate profile, that passwords are hashed, that `password2` and unknown fields are silently ignored, that specialty IDs are correctly assigned via M2M, and that a mid-creation database error rolls back the user row.

**Signals (19 tests):** Verifies that each repository mutation method fires the expected signal(s) and that the connected observers persist the correct `Notification` and `CaseAuditLog` rows. The idempotency test confirms that calling `create_case_from_request()` twice (when a `Case` already exists) fires `case_assigned` only once.

**Strategies (24 tests):** Verifies arithmetic correctness for all three strategies, factory dispatch, `ValueError` message content for unknown types, and that each factory call returns a distinct instance.

**Singletons (27 tests):** Verifies the `is` identity guarantee (two instantiations return the same object), that `reset()` enables a fresh instance, that `ConfigManager.get()` returns values matching `django.conf.settings`, and that `NotificationService` operations correctly persist and query the database.

---

## 7. Deployment

### 7.1 Architecture

```
Internet → Vercel (Next.js frontend)
                ↕ HTTPS REST / JWT
         Railway (Django API — Gunicorn)
                ↕ TLS PostgreSQL
          Supabase (PostgreSQL 15)
```

### 7.2 Live URLs

| Component | URL |
|-----------|-----|
| Backend API | https://web-production-f54a9.up.railway.app |
| Frontend Application | https://qanoon-assist.vercel.app |

### 7.3 Backend (Railway)

The backend is deployed as a Railway web service. The WSGI entrypoint is `qanoon_assist.wsgi:application`; Gunicorn runs with 2 workers. The production Django settings module (`qanoon_assist.settings_prod`) is selected via `DJANGO_SETTINGS_MODULE` environment variable.

Build steps (executed on each deploy):
1. `pip install -r requirements.txt`
2. `python manage.py collectstatic --noinput`
3. `python manage.py migrate`

Static files are served by WhiteNoise using `CompressedManifestStaticFilesStorage`, eliminating the need for a CDN or separate static host.

**Required environment variables:**

| Variable | Description |
|----------|-------------|
| `DJANGO_SETTINGS_MODULE` | `qanoon_assist.settings_prod` |
| `SECRET_KEY` | Django secret key (auto-generated) |
| `DATABASE_URL` | Supabase PostgreSQL connection URI |
| `ALLOWED_HOSTS` | Comma-separated Railway hostname(s) |
| `CORS_ORIGINS` | Comma-separated Vercel frontend origin(s) |
| `DEBUG` | `False` |
| `DATABASE_SSL_REQUIRE` | `True` |

### 7.4 Database (Supabase)

PostgreSQL 15 is hosted on Supabase. The connection is established via `dj-database-url` parsing the `DATABASE_URL` environment variable. `ssl_require=True` enforces TLS in transit. `conn_max_age=600` maintains persistent connections to reduce connection overhead on Railway's stateless container infrastructure.

Migrations are applied automatically during each deploy; the `cases.0002_caseauditlog_notification` and `users.0002_fee_strategy_fields` migrations added `Notification`, `CaseAuditLog`, and four `LawyerProfile` fee columns.

### 7.5 Frontend (Vercel)

The React/Next.js frontend is deployed on Vercel's global CDN. The API base URL is configured as a build-time environment variable pointing to the Railway backend. JWT tokens are managed client-side and attached to all authenticated API requests as `Authorization: Bearer <token>` headers.

### 7.6 Production Settings Validation

The production settings module was validated locally with:

```
python manage.py check --settings=qanoon_assist.settings_prod
```

Result: **System check identified no issues (0 silenced).**

---

## 8. References

1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*. IEEE, 1998.
2. E. Gamma, R. Helm, R. Johnson, J. Vlissides, *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994.
3. M. T. McCabe, "A Complexity Measure," *IEEE Transactions on Software Engineering*, vol. SE-2, no. 4, pp. 308–320, Dec. 1976.
4. Django Software Foundation, *Django 5.2 Documentation*. [Online]. Available: https://docs.djangoproject.com/en/5.2/
5. Django REST Framework, *DRF Documentation*. [Online]. Available: https://www.django-rest-framework.org/
6. radon, *Radon Documentation — Cyclomatic Complexity*. [Online]. Available: https://radon.readthedocs.io/en/latest/intro.html
7. M. Fowler, *Refactoring: Improving the Design of Existing Code*, 2nd ed. Addison-Wesley, 2018.
8. Qanoon Assist Benchmark Report, `docs/benchmark/benchmark_report.md`, 2026.
9. Qanoon Assist UML Diagrams, `docs/uml/`, 2026.
