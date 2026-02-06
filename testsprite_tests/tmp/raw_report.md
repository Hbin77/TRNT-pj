
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** trnt_pj
- **Date:** 2026-02-07
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 health check endpoint returns server status
- **Test Code:** [TC001_health_check_endpoint_returns_server_status.py](./TC001_health_check_endpoint_returns_server_status.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/7b66cde1-a49d-4fba-8aa4-a4aafdd91a8b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 user registration with email and turnstile verification
- **Test Code:** [TC002_user_registration_with_email_and_turnstile_verification.py](./TC002_user_registration_with_email_and_turnstile_verification.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 51, in <module>
  File "<string>", line 36, in test_user_registration_with_email_and_turnstile_verification
AssertionError: Expected 201, got 500, response: {"error":{"code":"INTERNAL_SERVER_ERROR","message":"서버 내부 오류가 발생했습니다."}}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/fadc895e-cf28-4993-9b68-d10a953039fa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 email verification with 6 digit code and auto login
- **Test Code:** [TC003_email_verification_with_6_digit_code_and_auto_login.py](./TC003_email_verification_with_6_digit_code_and_auto_login.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 90, in <module>
  File "<string>", line 28, in test_email_verification_with_6_digit_code_and_auto_login
AssertionError: Unexpected register status: 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/4ffd43d7-98bc-465b-8746-1b749497f4d3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 user login with email and password returns jwt tokens
- **Test Code:** [TC004_user_login_with_email_and_password_returns_jwt_tokens.py](./TC004_user_login_with_email_and_password_returns_jwt_tokens.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 51, in <module>
  File "<string>", line 24, in test_user_login_with_email_and_password_returns_jwt_tokens
AssertionError: Expected 200, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/73446abf-319e-4867-86cc-f72dccb33f84
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 refresh jwt tokens using refresh token
- **Test Code:** [TC005_refresh_jwt_tokens_using_refresh_token.py](./TC005_refresh_jwt_tokens_using_refresh_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 92, in <module>
  File "<string>", line 30, in test_refresh_jwt_tokens_using_refresh_token
AssertionError: Expected 201 Created, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/14798b9a-5709-461d-8765-2ba67b8ed79a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 get current authenticated user profile
- **Test Code:** [TC006_get_current_authenticated_user_profile.py](./TC006_get_current_authenticated_user_profile.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 20, in test_get_current_authenticated_user_profile
AssertionError: Expected 200 OK, got 500

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 51, in <module>
  File "<string>", line 30, in test_get_current_authenticated_user_profile
AssertionError: Authorized request failed: Expected 200 OK, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/3c585623-c5af-4c2c-a8ca-9ab70b82b6d0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 logout invalidates token via blacklist
- **Test Code:** [TC007_logout_invalidates_token_via_blacklist.py](./TC007_logout_invalidates_token_via_blacklist.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 35, in <module>
  File "<string>", line 18, in test_logout_invalidates_token_via_blacklist
AssertionError: Expected 200 OK, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/1984b7c2-f78c-48dc-b599-34c87c58a623
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 generate ai scenario with rate limiting and master account exemption
- **Test Code:** [TC008_generate_ai_scenario_with_rate_limiting_and_master_account_exemption.py](./TC008_generate_ai_scenario_with_rate_limiting_and_master_account_exemption.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 112, in <module>
  File "<string>", line 55, in test_generate_ai_scenario_rate_limit_and_master_exemption
AssertionError

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/ec0bdf63-4bfd-497d-a6e4-def05473d0db
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 list user scenarios with pagination
- **Test Code:** [TC009_list_user_scenarios_with_pagination.py](./TC009_list_user_scenarios_with_pagination.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 66, in <module>
  File "<string>", line 22, in test_list_user_scenarios_with_pagination
AssertionError: Expected 200 OK, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/f8746d04-5a2a-4f61-bf1a-245e8822b40a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 delete scenario owned by user
- **Test Code:** [TC010_delete_scenario_owned_by_user.py](./TC010_delete_scenario_owned_by_user.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 77, in <module>
  File "<string>", line 50, in test_delete_scenario_owned_by_user
  File "<string>", line 32, in create_scenario
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 500 Server Error: Internal Server Error for url: http://localhost:8002/api/v1/scenarios/generate?save=true

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/65d3df2b-84e6-4c6b-b293-916dc9b8c912/5eadb94f-a9cf-4fd4-9b6b-9010e6db1f61
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **10.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---