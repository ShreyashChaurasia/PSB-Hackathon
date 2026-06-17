const BASE_URL = 'http://localhost:8000';

export async function loginUser(username, password, keystrokeProfile, contextData) {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        keystroke_profile: keystrokeProfile,
        context: contextData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = typeof data.detail === 'string' ? data.detail : data.message || `Login failed (${response.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
}

export async function verifyOTP(username, otpCode) {
  try {
    const response = await fetch(`${BASE_URL}/api/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        otp_code: otpCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = typeof data.detail === 'string' ? data.detail : data.message || `OTP verification failed (${response.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
}

export async function getSession(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/session/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = typeof data.detail === 'string' ? data.detail : data.message || `Session fetch failed (${response.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
}

export async function enrollUser(username, password, keystrokeProfile, contextData) {
  try {
    const response = await fetch(`${BASE_URL}/api/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        keystroke_profile: keystrokeProfile,
        context: contextData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = typeof data.detail === 'string' ? data.detail : data.message || `Enrollment failed (${response.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
}
