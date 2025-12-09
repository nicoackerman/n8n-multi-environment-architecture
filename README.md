# n8n — Multi-enviroment architecture (local / development / production)

## Enviroments Over

### 🖥️ Local Environment (per developer)
* **Infrastructure:**
    * Run via **Docker Compose** to ensure parity with production.
    * **Database:** **PostgreSQL** (configured in Docker Compose). Avoid SQLite to prevent data type compatibility errors during migration.
    * **n8n Version:** Must be **strictly pinned** in the `docker-compose.yml`. All developers must use the same version as Production.
* **Credentials & Data:**
    * Exclusive use of **Test/Sandbox Credentials** via`.env` file. 
    * **Email:** Use personal *Gmail App Passwords* or simulation services.
* **Purpose:** Experimentation, workflow creation, and quick unit testing.

---

### 🧪 Development Environment

* **Deployment:**
    * Workflows are deployed automatically after a Push/Merge to the `develop` branch (or via Pull Request approval).
* **Configuration:**
    * **Environment Variables:** Injected exclusively via server configuration (`.env` files).
    * **Parity:** Must mirror the Production environment in terms of resources (e.g., CPU/RAM) and DB engine (supabase).
* **Purpose:**
    * Webhook validation in a stable environment.
    * Final approval before live deployment.
---

### 🚀 Production Environment

* **State:**
    * **Immutable:** Workflows must not be edited directly in the UI. Any change must come from the CI/CD pipeline.
    * Only validated, stable, and mission-critical workflows are run here.
* **Credentials & Security:**
    * Real Production Credentials (Live Keys, Tokens).
    * **Isolation:** Credentials **must remain within this environment** and must never be accessible by lower environments.
    * **Email:** Use **OAuth2** with dedicated service accounts (not personal ones) to ensure sending limits and security.
* **Deployment:**
    * Automatic deployment (CI/CD) upon `Merge` to the `main` (or `master`) branch.

> **Note:**  
> If using **n8n Enterprise**, Git-based workflow sync is native.  
> In **Community Edition**, sync is done via CLI/API or CI/CD jobs.

## Infrastrcuture

## Repositories
