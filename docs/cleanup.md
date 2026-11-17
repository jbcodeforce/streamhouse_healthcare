# Resource Teardown & Cleanup

Follow these steps to clean up all local development processes, containers, and Confluent Cloud cloud infrastructure.

---

## 1. Stop Local Development Servers & Containers

```bash
./scripts/stop_dev.sh
```

This stops:
- The FastAPI backend uvicorn server
- The React Vite frontend development server
- The `healthcare-debezium` container
- The `healthcare-postgres` container

---

## 2. Destroy RTCE Terraform Stack

```bash
cd IaC/rtce
terraform destroy -auto-approve
```

---

## 3. Destroy Confluent Cloud Core Stack

```bash
cd IaC/ccloud
terraform destroy -auto-approve
```

---

## 4. Reset Local State

```bash
rm -rf apps/backend/.env
rm -rf IaC/ccloud/terraform.tfstate*
rm -rf IaC/rtce/terraform.tfstate*
```
