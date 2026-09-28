export interface HttpError {
    error: true;
    status: number;
    message: string;
}

export type HttpResult<T> = T | HttpError;

export class HttpProvider {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async get<T>(url: string): Promise<HttpResult<T>> {
        const response = await fetch(
            `${this.baseUrl}${url}`
        );

        if (!response.ok) {
            return {
                error: true,
                status: response.status,
                message: response.statusText,
            };
        }

        return response.json();
    }

    async post<T>(
        url: string,
        body: unknown
    ): Promise<HttpResult<T>> {
        const response = await fetch(
            `${this.baseUrl}${url}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            return {
                error: true,
                status: response.status,
                message: response.statusText,
            };
        }

        return response.json();
    }
}