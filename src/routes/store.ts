import { writable } from 'svelte/store';
export const gameControl = writable({
    restart: false,
});

export const pausedStore = writable(false);