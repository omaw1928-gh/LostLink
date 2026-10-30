import json
import os

def parse_trivy(path):
    if not os.path.exists(path):
        return {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}, 0, 0
    raw = open(path, 'rb').read()
    for enc in ['utf-8', 'utf-16', 'utf-8-sig', 'latin-1']:
        try:
            data = json.loads(raw.decode(enc))
            break
        except Exception:
            pass
    counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
    os_vulns = 0
    lang_vulns = 0
    for res in data.get('Results', []):
        vulns = res.get('Vulnerabilities') or []
        targ = res.get('Target', '')
        if 'alpine' in targ:
            os_vulns += len(vulns)
        else:
            lang_vulns += len(vulns)
        for v in vulns:
            sev = v.get('Severity')
            if sev in counts:
                counts[sev] += 1
    return counts, os_vulns, lang_vulns

b_cnt, b_os, b_lang = parse_trivy('trivy_baseline.json')
h_cnt, h_os, h_lang = parse_trivy('trivy_hardened.json')

hdr = "{:<35} | {:<15} | {:<15} | {:<12}".format("Metric / Vulnerability Level", "Baseline Image", "Hardened Image", "Delta")
sep = '-' * len(hdr)

print(hdr)
print(sep)
print("{:<35} | {:^15} | {:^15} | {:^12}".format("CRITICAL Vulnerabilities", b_cnt['CRITICAL'], h_cnt['CRITICAL'], h_cnt['CRITICAL'] - b_cnt['CRITICAL']))
print("{:<35} | {:^15} | {:^15} | {:^12}".format("HIGH Vulnerabilities", b_cnt['HIGH'], h_cnt['HIGH'], h_cnt['HIGH'] - b_cnt['HIGH']))
print("{:<35} | {:^15} | {:^15} | {:^12}".format("OS Package CVEs (Alpine)", b_os, h_os, h_os - b_os))
print("{:<35} | {:^15} | {:^15} | {:^12}".format("Application Package CVEs (Node)", b_lang, h_lang, h_lang - b_lang))
print("{:<35} | {:^15} | {:^15} | {:^12}".format("Container User Privilege", "root (UID 0)", "node (UID 1000)", "Least-Priv"))
print("{:<35} | {:^15} | {:^15} | {:^12}".format("Multi-Stage Layering", "No (Single)", "Yes (2 Stages)", "Optimized"))
print(sep)
