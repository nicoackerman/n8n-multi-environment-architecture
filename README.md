# n8n — Multi-enviroment architecture (local / development / production)

## Enviroments Overview

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
    * **Environment Variables:** Injected exclusively via server configuration.
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

## 🔄 Deployment Workflow (The Lifecycle)

This project follows a strict GitOps flow. Workflows move from **Local** → **Develop** → **Production** via Git commits and Pull Requests.

### Phase 1: Local Development 💻
*Goal: Create and test workflows safely.*

1.  **Start Environment:**
    ```bash
    npm run start
    ```
2.  **Develop in n8n:**
    *   Open `https://n8n.localhost`.
    *   **Credentials:** Use your local `.env` file for API Keys. For OAuth2 (Gmail, Slack), authenticate manually in your local instance.
3.  **Export Workflows:**
    When finished, export your work to the file system:
    ```bash
    npm run export
    ```
    *This updates the JSON files in `workflows/`.*
4.  **Validate & Commit:**
    ```bash
    npm run validate
    git add .
    git commit -m "feat: add new email processing workflow"
    git push origin feature/my-feature
    ```

### Phase 2: Deploy to Development (Staging) 🧪
*Goal: Integration testing in a server environment.*

1.  **Open Pull Request:**
    *   Create a PR from `feature/my-feature` to `develop`.
2.  **Automated Checks:**
    *   GitHub Actions runs `ci-validate.yml` to check JSON syntax and scan for hardcoded secrets.
3.  **Merge & Deploy:**
    *   When the PR is merged, the **Deploy to Development** action runs.
    *   Workflows are uploaded to the **Development n8n Instance**.
4.  **Verify:**
    *   Log in to the Development instance.
    *   **One-time Setup:** Ensure any new Credentials (especially OAuth2) exist in this environment with the *same ID* or name as referenced in the workflow.

### Phase 3: Deploy to Production 🚀
*Goal: Live release.*

1.  **Promote to Main:**
    *   Create a PR from `develop` to `main`.
2.  **Review:**
    *   Team reviews the changes. This is the final gate.
3.  **Merge & Deploy:**
    *   When merged, the **Deploy to Production** action runs.
    *   Workflows are uploaded to the **Production n8n Instance**.

---

## 🔐 Managing Secrets & Credentials

To ensure workflows run correctly across environments without exposing secrets:

### 1. API Keys & Passwords (The "Env Var" Method)
**Best for:** OpenAI, Stripe, Database passwords.
*   **Do not** save the key in the n8n Credential UI.
*   **Instead:**
    1.  Define the variable in your environment (e.g., `.env` locally, Server Variables in Prod).
    2.  In n8n, use an expression: `{{ $env.MY_API_KEY }}`.

### 2. OAuth2 Credentials (Gmail, Slack, Sheets)
**Best for:** Services requiring token refresh.
*   **Challenge:** OAuth tokens cannot be simple environment variables.
*   **Strategy:**
    1.  Create the credential manually in **Production** *once*.
    2.  Ensure your workflow references this credential.
    3.  *Pro Tip:* Keep credential IDs consistent if possible, or use n8n's Project feature (Enterprise) for automatic mapping. For Community Edition, manual verification in the target environment is required the first time a new credential is added.

## Infrastrcuture

## Repositories
