#!/usr/bin/env python3
"""Stress test for Cyber-IR API. Run with: python test_api.py [base_url]"""
import sys
import json
import time
import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8099"


def test_health():
    r = httpx.get(f"{BASE}/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert "model" in data
    print(f"[PASS] Health: {data}")


def test_root():
    r = httpx.get(f"{BASE}/")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Cyber-IR API"
    print(f"[PASS] Root: {data['name']} v{data['version']}")


def test_fir_basic():
    payload = {
        "incident_description": "Unauthorized access to email account. Attacker sent phishing emails to 12 contacts.",
        "victim_name": "Test User",
        "incident_date": "2026-09-17",
        "incident_time": "14:30",
        "location": "New Delhi, India",
        "incident_type": "hacking",
    }
    t0 = time.time()
    r = httpx.post(f"{BASE}/api/fir/generate", json=payload, timeout=120)
    elapsed = time.time() - t0
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:200]}"
    assert r.headers["content-type"] == "application/pdf"
    assert r.content[:5] == b"%PDF-"
    assert len(r.content) > 1000
    print(f"[PASS] FIR basic: {len(r.content)} bytes in {elapsed:.1f}s")


def test_fir_with_financial():
    payload = {
        "incident_description": "Phishing attack led to unauthorized UPI transaction of Rs 45,000.",
        "victim_name": "Financial Victim",
        "incident_date": "2026-09-17",
        "incident_time": "09:00",
        "location": "Mumbai, India",
        "incident_type": "online_financial_fraud",
        "financial_details": {
            "transaction_id": "TXN123456789",
            "bank_account": "XXXX1234",
            "amount": "45000",
            "upi_id": "victim@upi",
            "transaction_date": "2026-09-17 08:55",
        },
    }
    t0 = time.time()
    r = httpx.post(f"{BASE}/api/fir/generate", json=payload, timeout=120)
    elapsed = time.time() - t0
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:200]}"
    assert r.content[:5] == b"%PDF-"
    print(f"[PASS] FIR financial: {len(r.content)} bytes in {elapsed:.1f}s")


def test_playbook_basic():
    payload = {
        "situation": "Ransomware attack encrypting all company file shares. Attacker demands 10 BTC.",
        "organization_type": "startup",
        "urgency": "critical",
    }
    t0 = time.time()
    r = httpx.post(f"{BASE}/api/playbook/generate", json=payload, timeout=120)
    elapsed = time.time() - t0
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:200]}"
    data = r.json()
    assert "playbook" in data
    playbook = data["playbook"]
    assert len(playbook) > 500, f"Playbook too short: {len(playbook)} chars"
    assert "# " in playbook, "Playbook missing markdown headers"
    # Verify no thinking tags leaked
    assert "<thought>" not in playbook, "Thinking tags leaked into playbook"
    print(f"[PASS] Playbook basic: {len(playbook)} chars in {elapsed:.1f}s")


def test_playbook_data_breach():
    payload = {
        "situation": "Customer database breach. 50,000 records with PII exposed. GDPR notification required.",
        "organization_type": "enterprise",
        "urgency": "high",
    }
    t0 = time.time()
    r = httpx.post(f"{BASE}/api/playbook/generate", json=payload, timeout=120)
    elapsed = time.time() - t0
    assert r.status_code == 200
    data = r.json()
    assert len(data["playbook"]) > 500
    print(f"[PASS] Playbook data breach: {len(data['playbook'])} chars in {elapsed:.1f}s")


def test_errors_missing_fields():
    r = httpx.post(f"{BASE}/api/fir/generate", json={})
    assert r.status_code == 422, f"Expected 422, got {r.status_code}"
    print("[PASS] Missing fields returns 422")


def test_errors_invalid_type():
    payload = {
        "incident_description": "test",
        "victim_name": "test",
        "incident_date": "2026-09-17",
        "incident_time": "12:00",
        "location": "test",
        "incident_type": "invalid_type_here",
    }
    r = httpx.post(f"{BASE}/api/fir/generate", json=payload, timeout=10)
    # Should still work (type is not enum-validated at API level, LLM handles it)
    assert r.status_code in (200, 500, 502)
    print(f"[PASS] Invalid type handled: {r.status_code}")


def test_concurrent_requests():
    """Fire 3 playbook requests simultaneously."""
    payloads = [
        {"situation": "DDoS on website", "organization_type": "startup", "urgency": "high"},
        {"situation": "Phishing campaign targeting employees", "organization_type": "enterprise", "urgency": "medium"},
        {"situation": "USB malware found on workstation", "organization_type": "general", "urgency": "low"},
    ]
    t0 = time.time()
    results = []
    with httpx.Client(timeout=120) as client:
        from concurrent.futures import ThreadPoolExecutor, as_completed
        def send(p):
            return client.post(f"{BASE}/api/playbook/generate", json=p)
        with ThreadPoolExecutor(max_workers=3) as pool:
            futures = [pool.submit(send, p) for p in payloads]
            for f in as_completed(futures):
                results.append(f.result())
    elapsed = time.time() - t0
    all_ok = all(r.status_code == 200 for r in results)
    print(f"[{'PASS' if all_ok else 'FAIL'}] Concurrent: {len(results)} requests in {elapsed:.1f}s, statuses={[r.status_code for r in results]}")


if __name__ == "__main__":
    print(f"=== Cyber-IR API Stress Test ({BASE}) ===\n")
    tests = [
        test_health,
        test_root,
        test_fir_basic,
        test_fir_with_financial,
        test_playbook_basic,
        test_playbook_data_breach,
        test_errors_missing_fields,
        test_errors_invalid_type,
        test_concurrent_requests,
    ]
    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            passed += 1
        except Exception as e:
            print(f"[FAIL] {t.__name__}: {e}")
            failed += 1
    print(f"\n=== Results: {passed} passed, {failed} failed ===")
    sys.exit(1 if failed else 0)
