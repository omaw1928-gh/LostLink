import json

with open('trivy_baseline.json', encoding='utf-16') as f:
    data = json.load(f)

print("=== TRIVY BASELINE SCAN RESULTS ===")
total_crit = 0
total_high = 0

for res in data.get('Results', []):
    vulns = res.get('Vulnerabilities', [])
    if not vulns:
        continue
    target = res.get('Target')
    pkg_type = res.get('Type')
    crit = [v for v in vulns if v['Severity'] == 'CRITICAL']
    high = [v for v in vulns if v['Severity'] == 'HIGH']
    total_crit += len(crit)
    total_high += len(high)
    print(f"\nTarget: {target} [{pkg_type}] - CRITICAL: {len(crit)}, HIGH: {len(high)}")
    for v in crit:
        print(f"  [CRITICAL] {v.get('PkgName')} {v.get('InstalledVersion')} -> {v.get('VulnerabilityID')}: {v.get('Title', '')[:60]}")
    for v in high[:5]: # Show first 5
        print(f"  [HIGH] {v.get('PkgName')} {v.get('InstalledVersion')} -> {v.get('VulnerabilityID')}: {v.get('Title', '')[:60]}")

print("\n" + "="*40)
print(f"TOTAL CRITICAL: {total_crit}")
print(f"TOTAL HIGH:     {total_high}")
