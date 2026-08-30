/**
 * circuitBreaker.ts
 * Enterprise Circuit Breaker Pattern Implementation
 */

export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    volumeThreshold: number;
    errorRateThreshold: number;
}

export interface CircuitBreakerMetrics {
    failures: number;
    successes: number;
    requests: number;
    lastFailureTime: number | null;
    lastSuccessTime: number | null;
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private metrics: CircuitBreakerMetrics = {
        failures: 0,
        successes: 0,
        requests: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
    };
    private nextAttemptTime: number = 0;
    private config: CircuitBreakerConfig;
    private name: string;

    constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
        this.name = name;
        this.config = {
            failureThreshold: config.failureThreshold ?? 5,
            successThreshold: config.successThreshold ?? 2,
            timeout: config.timeout ?? 60000,
            volumeThreshold: config.volumeThreshold ?? 5,
            errorRateThreshold: config.errorRateThreshold ?? 50,
        };
    }

    async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttemptTime) {
                if (fallback) {
                    console.warn(`[CircuitBreaker:${this.name}] Circuit OPEN, using fallback`);
                    return fallback();
                }
                const err: any = new Error(`Circuit breaker is OPEN for ${this.name}`);
                err.code = 'CIRCUIT_OPEN';
                throw err;
            }

            console.log(`[CircuitBreaker:${this.name}] Attempting recovery (HALF_OPEN)`);
            this.state = CircuitState.HALF_OPEN;
            this.metrics.successes = 0;
        }

        try {
            this.metrics.requests++;
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error);
            throw error;
        }
    }

    private onSuccess() {
        this.metrics.failures = 0;
        this.metrics.successes++;
        this.metrics.lastSuccessTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN) {
            if (this.metrics.successes >= this.config.successThreshold) {
                console.log(`[CircuitBreaker:${this.name}] Recovery successful, closing circuit`);
                this.state = CircuitState.CLOSED;
                this.metrics.failures = 0;
                this.metrics.successes = 0;
            }
        }
    }

    private onFailure(_error: any) {
        this.metrics.failures++;
        this.metrics.lastFailureTime = Date.now();

        if (this.shouldOpenCircuit()) {
            console.error(
                `[CircuitBreaker:${this.name}] Circuit opened due to excessive failures:`,
                { ...this.metrics, config: this.config }
            );
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = Date.now() + this.config.timeout;
            this.metrics.successes = 0;
        }
    }

    private shouldOpenCircuit(): boolean {
        if (this.metrics.requests < this.config.volumeThreshold) {
            return false;
        }
        if (this.metrics.failures >= this.config.failureThreshold) {
            return true;
        }
        if (this.metrics.requests > 0) {
            const errorRate = (this.metrics.failures / this.metrics.requests) * 100;
            if (errorRate >= this.config.errorRateThreshold) {
                return true;
            }
        }
        return false;
    }

    getState(): CircuitState {
        return this.state;
    }

    getMetrics() {
        return {
            name: this.name,
            state: this.state,
            ...this.metrics,
            errorRate: this.metrics.requests > 0 
                ? ((this.metrics.failures / this.metrics.requests) * 100).toFixed(2) + '%'
                : '0%',
        };
    }

    reset() {
        this.state = CircuitState.CLOSED;
        this.metrics = {
            failures: 0,
            successes: 0,
            requests: 0,
            lastFailureTime: null,
            lastSuccessTime: null,
        };
        this.nextAttemptTime = 0;
    }

    trip() {
        this.state = CircuitState.OPEN;
        this.nextAttemptTime = Date.now() + this.config.timeout;
    }

    close() {
        this.state = CircuitState.CLOSED;
        this.metrics.failures = 0;
        this.metrics.successes = 0;
    }
}

export class CircuitBreakerRegistry {
    private breakers: Map<string, CircuitBreaker> = new Map();
    private defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000,
        volumeThreshold: 5,
        errorRateThreshold: 50,
    };

    getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
        if (!this.breakers.has(name)) {
            const finalConfig = { ...this.defaultConfig, ...config };
            this.breakers.set(name, new CircuitBreaker(name, finalConfig));
        }
        return this.breakers.get(name)!;
    }

    getAllMetrics() {
        return Array.from(this.breakers.values()).map(breaker => breaker.getMetrics());
    }

    resetAll() {
        this.breakers.forEach(breaker => breaker.reset());
    }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
export default CircuitBreaker;