"""Build data product lineage and descriptor JSON files from dbt target/manifest.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def sanitize_statement_name(name: str) -> str:
    """Sanitize statement name according to Confluent Cloud Flink conventions."""
    return name.replace("_", "-").lower()


def build_descriptors(
    manifest_path: Path,
    output_dir: Path,
    dry_run: bool = False,
) -> None:
    if not manifest_path.exists():
        print(f"Manifest not found at {manifest_path}. Run 'dbt compile' first.")
        return

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    nodes = manifest.get("nodes", {})
    sources = manifest.get("sources", {})

    products = ["patient_monitoring", "clinical_alerts", "device_ops"]
    output_dir.mkdir(parents=True, exist_ok=True)

    for product in products:
        product_nodes = []
        product_edges = []
        node_ids = set()

        for unique_id, node in nodes.items():
            if not unique_id.startswith("model.streamhouse_healthcare."):
                continue

            fqn = node.get("fqn", [])
            if len(fqn) < 2 or fqn[1] != product:
                continue

            model_name = node.get("name")
            table_type = node.get("config", {}).get("materialized", "streaming_table")
            compute_pool_id = node.get("config", {}).get("compute_pool_id", "")
            statement_name = sanitize_statement_name(f"dbt-sh-hc-{model_name}")

            is_product = model_name.startswith("fct_")
            node_entry = {
                "id": model_name,
                "label": model_name,
                "type": "statement",
                "statement_name": statement_name,
                "topic": model_name,
                "table_type": table_type,
                "compute_pool_id": compute_pool_id,
                "is_product": is_product,
                "external": False,
                "raw_sql": node.get("raw_code", ""),
            }
            product_nodes.append(node_entry)
            node_ids.add(model_name)

            # Edges from depends_on
            for dep in node.get("depends_on", {}).get("nodes", []):
                dep_name = dep.split(".")[-1]
                product_edges.append({"source": dep_name, "target": model_name})

        # Add source nodes referenced
        for edge in product_edges:
            src = edge["source"]
            if src not in node_ids:
                product_nodes.append({
                    "id": src,
                    "label": src,
                    "type": "source",
                    "statement_name": "",
                    "topic": src,
                    "table_type": "source",
                    "compute_pool_id": "",
                    "is_product": False,
                    "external": True,
                    "raw_sql": "",
                })
                node_ids.add(src)

        descriptor = {
            "product_id": product,
            "name": product.replace("_", " ").title(),
            "nodes": product_nodes,
            "edges": product_edges,
        }

        out_path = output_dir / f"{product}.json"
        if dry_run:
            print(f"[DRY-RUN] Would write {out_path} with {len(product_nodes)} nodes and {len(product_edges)} edges")
        else:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(descriptor, f, indent=2)
            print(f"Wrote descriptor to {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build data product descriptors from dbt manifest")
    parser.add_argument("--manifest", type=Path, default=Path("../pipelines/target/manifest.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("data_products/descriptors"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    build_descriptors(args.manifest, args.output_dir, args.dry_run)


if __name__ == "__main__":
    main()
