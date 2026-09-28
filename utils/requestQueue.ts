let queue: Promise<unknown> = Promise.resolve();

const delay = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });

export function queuedRequest<T>(
    request: () => Promise<T>
): Promise<T> {
    const result = queue.then(async () => {
        await delay(1200);

        return request();
    });

    queue = result.catch(() => {});

    return result;
}