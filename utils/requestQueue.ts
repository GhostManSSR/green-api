let queue: Promise<unknown> = Promise.resolve();

const delay = (ms: number) => new Promise<void>((resolve) => {setTimeout(resolve, ms);});

const RATE_LIMITS = {
    getChats: 1100,
    getChatHistory: 1100,
    getContactInfo: 1100,
    getGroupData: 1100,
    getAvatar: 150,
    sendMessage: 50,
    default: 1200,
    checkAccount: 1100
} as const;

export type GreenApiMethod = keyof typeof RATE_LIMITS;

export function queuedRequest<T>(request: () => Promise<T>, method: GreenApiMethod = "default"): Promise<T> {

    const result = queue.then(async () => {
        await delay(RATE_LIMITS[method]);

        return request();
    });

    queue = result.catch(() => {});

    return result;
}