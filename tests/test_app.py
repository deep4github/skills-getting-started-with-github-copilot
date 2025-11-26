import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_invalid_activity():
    resp = client.post("/activities/NonExistentActivity/signup?email=pytest@example.com")
    assert resp.status_code == 404

def test_signup_missing_email():
    # Get available activities
    activities_resp = client.get("/activities")
    activities = activities_resp.json()
    activity_name = next(iter(activities.keys()))
    resp = client.post(f"/activities/{activity_name}/signup")
    assert resp.status_code == 422
