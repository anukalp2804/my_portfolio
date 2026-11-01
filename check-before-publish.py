#!/usr/bin/env python3
"""
Run this before publishing:   python check-before-publish.py
Finds placeholders and missing files that would look broken on the live site.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).parent
PAGES = [ROOT / "index.html", *sorted((ROOT / "Organization").glob("*/index.html"))]
GENERIC_SOCIAL = re.compile(r'href="https?://(www\.)?(github|linkedin|instagram|x|twitter|facebook)\.com/?"')
LOCAL_REF = re.compile(r'(?:src|href|data-file)="([^"#:?]+)"')

problems = []  # (file, line, message)
for page in PAGES:
    rel = page.relative_to(ROOT)
    for n, line in enumerate(page.read_text(encoding="utf-8").splitlines(), 1):
        if re.search(r'(?:href|src)="##"', line):
            problems.append((rel, n, 'Placeholder "##" - replace with the real link or image'))
        if GENERIC_SOCIAL.search(line):
            problems.append((rel, n, "Social link goes to a site homepage - use your own profile URL"))
        if "Authority: xyz" in line:
            problems.append((rel, n, 'Certificate issuer still says "xyz"'))
        if 'name="-----"' in line:
            problems.append((rel, n, 'Web3Forms key field is named "-----" - it must be name="access_key"'))
        key_match = re.search(r'name="access_key"[^>]*value="([^"]*)"', line)
        if key_match and not re.fullmatch(r"[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}", key_match.group(1)):
            problems.append((rel, n, "access_key value does not look like a real Web3Forms key (a UUID such as 1a2b3c4d-1234-5678-9abc-0123456789ab) - paste the key Web3Forms e-mailed you"))
        for m in LOCAL_REF.finditer(line):
            target = m.group(1)
            if target.startswith(("http", "//", "mailto", "tel", "data")):
                continue
            found = (page.parent / target).resolve().exists()
            if not found and 'data-file=' in m.group(0):
                found = (page.parent / '..' / target).resolve().exists()  # org.js also tries the project-root Data folder
            if not found:
                problems.append((rel, n, f"Missing file: {target}"))

# ---------------- Security checks ----------------
SECRET_RE = re.compile(r"(api[_-]?key\s*[:=]|secret\s*[:=]|passw(?:or)?d\s*[:=]|private[_-]?key|BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})", re.I)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
SELF = pathlib.Path(__file__).name
for path in sorted(ROOT.rglob("*")):
    if not path.is_file() or path.suffix not in (".html", ".js", ".css", ".json", ".txt") or "vendor" in path.parts or path.name == SELF:
        continue
    rel = path.relative_to(ROOT)
    for n, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
        if SECRET_RE.search(line):
            problems.append((rel, n, "Looks like a SECRET (key/password/token). Secrets must never be in website files."))
        if EMAIL_RE.search(line) and "example.com" not in line and "schema.org" not in line:
            problems.append((rel, n, "E-mail address in the page source - spam bots harvest these. Use data-email-user / data-email-domain (see README)."))
        if re.search(r"YOUR-[A-Za-z]", line) and path.suffix in (".html", ".js"):
            problems.append((rel, n, "Placeholder text still present (YOUR-...)"))
for page in PAGES:
    rel = page.relative_to(ROOT)
    for n, line in enumerate(page.read_text(encoding="utf-8").splitlines(), 1):
        if re.search(r"\son[a-z]+\s*=\s*[\"']", line):
            problems.append((rel, n, "Inline event handler (onclick=...) - the Content-Security-Policy blocks it"))
        for tag in re.findall(r"<a [^>]*target=\"_blank\"[^>]*>", line):
            if "noopener" not in tag:
                problems.append((rel, n, 'Link with target="_blank" is missing rel="noopener noreferrer"'))
        if re.search(r"(?:href|src)=\"http://", line):
            problems.append((rel, n, "Insecure http:// link - use https://"))

# Visitor counter: remind when it has not been set up yet
analytics = ROOT / "analytics.js"
if analytics.exists():
    for n, line in enumerate(analytics.read_text(encoding="utf-8").splitlines(), 1):
        if "var GOATCOUNTER_CODE" in line and re.search(r"=\s*(\x27\x27|\x22\x22)", line):
            problems.append((analytics.relative_to(ROOT), n, "Visitor counter not set up - put your GoatCounter code in GOATCOUNTER_CODE (see README)"))

if not problems:
    print("All good - nothing to fix. Ready to publish!")
    sys.exit(0)

print(f"Found {len(problems)} thing(s) to fix before publishing:\n")
for rel, n, msg in problems:
    print(f"  {str(rel):38s} line {n:<4d} {msg}")
print("\nFix these, run the script again, and publish when it says 'All good'.")
sys.exit(1)
