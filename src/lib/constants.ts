export const SESSION_COOKIE_NAME = 'auth-session';

export const cars: Car[] = [{
    car1: 2000000,
    car2: 3000000,
    car3: 4000000,
}];

export interface Car {
    [key: string]: number;
}