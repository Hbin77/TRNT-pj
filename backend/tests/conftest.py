"""pytest 설정 및 공통 픽스처"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db



# 테스트용 DB URL (SQLite 사용)
TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="function")
def db_session():
    """
    테스트용 DB 세션 (각 테스트마다 롤백)

    Yields:
        Session: 테스트용 데이터베이스 세션
    """
    engine = create_engine(
        TEST_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()


    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    테스트 클라이언트

    Args:
        db_session: 테스트용 DB 세션

    Yields:
        TestClient: FastAPI 테스트 클라이언트
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """테스트 사용자 데이터"""
    return {
        "email": "test@example.com",
        "password": "Test1234!",
        "name": "홍길동",
        "birth_year": 1995,
        "occupation": "개발자",
        "life_background": "테스트 배경 스토리"
    }


@pytest.fixture
def authenticated_client(client, test_user_data):
    """
    인증된 테스트 클라이언트

    Args:
        client: 테스트 클라이언트
        test_user_data: 테스트 사용자 데이터

    Returns:
        tuple: (client, access_token)
    """
    # 회원가입
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 201

    token = response.json()["access_token"]
    return client, token
