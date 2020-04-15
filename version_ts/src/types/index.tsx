export const enum ResponseCode {
    SUCCESS = 800,
    FAIL = 400
}

export interface IClock {
    place: string,
    timezone: number
}

export interface ITimeData {
    [place: string]: {
        timeStamp: number
    }
}