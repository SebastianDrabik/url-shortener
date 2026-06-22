export function randomString(length: number = 5): string {
    return crypto.getRandomValues(new Uint8Array(length))
        .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
        .slice(0, length);
}