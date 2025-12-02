export async function httpGet(url: string) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export async function httpPost(url: string, data: any) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
