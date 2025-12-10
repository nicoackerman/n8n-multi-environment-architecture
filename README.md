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

## Expected flow

### 1. Developer commits workflow JSON files:
All workflows are stored as JSON under: `/workflows/*.json`

> **Tip:** Use the helper scripts to manage your local environment and exports.

#### Local Development Workflow
1. **Start Local Environment:**
   ```bash
   npm run start
   ```
   Access n8n at `https://n8n.localhost` (or your configured domain).

2. **Edit Workflows:**
   Make changes in the local n8n UI.

3. **Export Changes:**
   When ready, export your workflows from the Docker container to your local folder:
   ```bash
   npm run export
   ```
   This will update the JSON files in the `workflows/` directory.

4. **Validate:**
   Check if the JSON files are valid:
   ```bash
   npm run validate
   ```

5. **Commit & Push:**
   ```bash
   git add workflows/
   git commit -m "feat: update workflow"
   git push origin feature/my-new-workflow
   ```

### 2. Developer opens a Pull Request: 
A Pull Request (PR) is created to merge the feature branch into `develop`.

### 3. GitHub Actions validates the workflows:
When a PR is opened, CI automatically runs.

### 4. PR is merged → triggers auto-deployment

### When merged into `develop`:
- GitHub Actions runs **deploy-to-development** job.
- All workflows are bundled into a deployment artifact.
- The workflows are automatically imported into the **Staging n8n instance** using the n8n API or CLI.
- Smoke tests may be executed to confirm correct deployment.

### When merged into `main`:
- GitHub Actions runs **deploy-to-production** job.
- The same deployment process runs, but targets the **Production instance**.
- Production jobs may require manual approval (protected environment).

## 5. n8n imports workflows automatically: 
CI uploads each workflow file.

## Infrastrcuture

## Repositories
