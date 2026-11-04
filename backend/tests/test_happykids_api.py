# HappyKids backend API tests: health, auth (me/logout/session), cloud progress, contact
import os
import time
import subprocess
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    for line in open("/app/frontend/.env"):
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")


def _mongo(js):
    return subprocess.run(["mongosh", "--quiet", "--eval", f"use('test_database'); {js}"], capture_output=True, text=True).stdout.strip()


@pytest.fixture(scope="module")
def session_token():
    ts = str(int(time.time() * 1000))
    uid, tok = f"TEST_user_{ts}", f"TEST_session_{ts}"
    _mongo(f"db.users.insertOne({{user_id:'{uid}',email:'test.user.{ts}@example.com',name:'TEST Parent',picture:'',created_at:new Date()}});"
           f"db.user_sessions.insertOne({{user_id:'{uid}',session_token:'{tok}',expires_at:new Date(Date.now()+7*864e5),created_at:new Date()}});")
    yield tok
    _mongo(f"db.users.deleteOne({{user_id:'{uid}'}}); db.user_sessions.deleteMany({{user_id:'{uid}'}}); db.progress.deleteOne({{user_id:'{uid}'}});")


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


# Health
class TestHealth:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200 and r.json()["message"] == "HappyKids API"


# Auth
class TestAuth:
    def test_me_no_auth(self):
        assert requests.get(f"{BASE_URL}/api/auth/me").status_code == 401

    def test_me_invalid_token(self):
        assert requests.get(f"{BASE_URL}/api/auth/me", headers=H("bogus")).status_code == 401

    def test_me_bearer(self, session_token):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=H(session_token))
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "TEST Parent" and d["email"].startswith("test.user.") and "_id" not in d

    def test_me_cookie(self, session_token):
        r = requests.get(f"{BASE_URL}/api/auth/me", cookies={"session_token": session_token})
        assert r.status_code == 200 and r.json()["user_id"].startswith("TEST_user_")

    def test_session_invalid_id(self):
        r = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid_xyz"})
        assert r.status_code == 401

    def test_session_missing_body(self):
        assert requests.post(f"{BASE_URL}/api/auth/session", json={}).status_code == 422

    def test_expired_session(self):
        ts = str(int(time.time() * 1000)) + "x"
        uid, tok = f"TEST_user_{ts}", f"TEST_session_{ts}"
        _mongo(f"db.users.insertOne({{user_id:'{uid}',email:'exp.{ts}@example.com',name:'X'}});"
               f"db.user_sessions.insertOne({{user_id:'{uid}',session_token:'{tok}',expires_at:new Date(Date.now()-1000)}});")
        try:
            assert requests.get(f"{BASE_URL}/api/auth/me", headers=H(tok)).status_code == 401
        finally:
            _mongo(f"db.users.deleteOne({{user_id:'{uid}'}}); db.user_sessions.deleteMany({{user_id:'{uid}'}});")

    def test_logout_cookie_deletes_session(self):
        ts = str(int(time.time() * 1000)) + "l"
        uid, tok = f"TEST_user_{ts}", f"TEST_session_{ts}"
        _mongo(f"db.users.insertOne({{user_id:'{uid}',email:'lo.{ts}@example.com',name:'L'}});"
               f"db.user_sessions.insertOne({{user_id:'{uid}',session_token:'{tok}',expires_at:new Date(Date.now()+864e5)}});")
        try:
            r = requests.post(f"{BASE_URL}/api/auth/logout", cookies={"session_token": tok})
            assert r.status_code == 200 and r.json()["ok"] is True
            assert requests.get(f"{BASE_URL}/api/auth/me", headers=H(tok)).status_code == 401
        finally:
            _mongo(f"db.users.deleteOne({{user_id:'{uid}'}}); db.user_sessions.deleteMany({{user_id:'{uid}'}});")


# Cloud progress
class TestProgress:
    def test_get_no_auth(self):
        assert requests.get(f"{BASE_URL}/api/progress").status_code == 401

    def test_put_no_auth(self):
        assert requests.put(f"{BASE_URL}/api/progress", json={"state": {}, "updated_at": 1}).status_code == 401

    def test_get_empty_then_put_then_get(self, session_token):
        r = requests.get(f"{BASE_URL}/api/progress", headers=H(session_token))
        assert r.status_code == 200
        state = {"profiles": [{"id": "p1", "name": "TEST_kid"}], "activeId": "p1", "data": {"p1": {"totalStars": 7}}}
        r = requests.put(f"{BASE_URL}/api/progress", headers=H(session_token), json={"state": state, "updated_at": 12345})
        assert r.status_code == 200 and r.json() == {"ok": True, "updated_at": 12345}
        g = requests.get(f"{BASE_URL}/api/progress", headers=H(session_token)).json()
        assert g["state"]["data"]["p1"]["totalStars"] == 7 and g["updated_at"] == 12345 and "_id" not in g

    def test_put_invalid_body(self, session_token):
        r = requests.put(f"{BASE_URL}/api/progress", headers=H(session_token), json={"state": "notadict"})
        assert r.status_code == 422


# Contact
class TestContact:
    def test_contact_ok(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST_name", "email": "test@example.com", "message": "TEST_ hello"})
        assert r.status_code == 200 and r.json()["ok"] is True

    def test_contact_bad_email(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST", "email": "notanemail", "message": "hello"})
        assert r.status_code == 422

    def test_contact_empty_name(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={"name": "", "email": "a@example.com", "message": "hello"})
        assert r.status_code == 422
