/**
 * httpClient.ts
 * Enterprise-grade HTTP client with retry and circuit breaker
 */

import axios, {
    AxiosInstance,
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { CircuitBreaker, circuitBreakerRegistry } from './circuitBreaker';
import { useErrorStore } from '../store/useErrorStore';

export interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitterFactor: number;
}

export interface TimeoutConfig {
    default: number;
    upload: number;
    download: number;
}

export interface HttpClientConfig {
    baseURL: string;
    timeout: TimeoutConfig;
    retry: RetryConfig;
    circuitBreaker: {
        enabled: boolean;
        failureThreshold: number;
        timeout: number;
    };
}

const defaultConfig: HttpClientConfig = {
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: {
        default: 30000,
        upload: 120000,
        download: 60000,
    },
    retry: {
        maxRetries: 3,
        initialDelay: 500,
        maxDelay: 5000,
        backoffMultiplier: 2,
        jitterFactor: 0.1,
    },
    circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        timeout: 60000,
    },
};

function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
    const jitter = Math.random() * config.jitterFactor * cappedDelay;
    return cappedDelay + jitter;
}

function isRetryableError(error: AxiosError): boolean {
    if (!error.response) return true;
    const status = error.response.status;
    return [408, 429, 500, 502, 503, 504].includes(status);
}

export class HttpClient {
    private client: AxiosInstance;
    private config: HttpClientConfig;
    private circuitBreaker: CircuitBreaker | null;
    private requestCount = 0;
    private errorCount = 0;

    constructor(customConfig?: Partial<HttpClientConfig>) {
        this.config = { ...defaultConfig, ...customConfig };
        this.client = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout.default,
            headers: { 'Content-Type': 'application/json' },
        });

        this.circuitBreaker = this.config.circuitBreaker.enabled
            ? circuitBreakerRegistry.getBreaker('api', {
                failureThreshold: this.config.circuitBreaker.failureThreshold,
                timeout: this.config.circuitBreaker.timeout,
            })
            : null;

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                if (config.url?.includes('upload')) {
                    config.timeout = this.config.timeout.upload;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                this.requestCount++;
                return response;
            },
            (error: AxiosError) => {
                this.errorCount++;
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.requestWithRetry(() => this.client.get<T>(url, config));
    }

    async post<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.requestWithRetry(() => this.client.post<T>(url, data, config));
    }

    async put<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.requestWithRetry(() => this.client.put<T>(url, data, config));
    }

    async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.requestWithRetry(() => this.client.delete<T>(url, config));
    }

    private async requestWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
        if (this.circuitBreaker) {
            return this.circuitBreaker.execute(
                () => this.executeWithRetry(requestFn),
                () => this.getFallbackResponse()
            );
        }
        return this.executeWithRetry(requestFn);
    }

    private async executeWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
        let lastError: AxiosError | null = null;

        for (let attempt = 0; attempt < this.config.retry.maxRetries; attempt++) {
            try {
                const response = await requestFn();
                return response;
            } catch (error) {
                lastError = error as AxiosError;
                if (!isRetryableError(lastError) || attempt === this.config.retry.maxRetries - 1) {
                    throw lastError;
                }
                const delay = calculateBackoffDelay(attempt, this.config.retry);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }

    private async getFallbackResponse<T>(): Promise<AxiosResponse<T>> {
        useErrorStore.getState().setError({
            message: 'Service temporarily unavailable. Please try again later.',
            code: 'SERVICE_UNAVAILABLE',
            severity: 'warning',
        });
        return Promise.reject(new Error('Circuit breaker is open'));
    }

    getMetrics() {
        return {
            totalRequests: this.requestCount,
            totalErrors: this.errorCount,
            errorRate: this.requestCount > 0 
                ? ((this.errorCount / this.requestCount) * 100).toFixed(2) + '%'
                : '0%',
            circuitBreakerState: this.circuitBreaker?.getState() ?? 'disabled',
        };
    }
}

export const httpClient = new HttpClient();
export default httpClient;