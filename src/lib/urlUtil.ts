export function getSiteUrl() {
    return window === undefined ? '' : window.location.origin
}