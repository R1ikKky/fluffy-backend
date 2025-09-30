export type AccountCreated = {
    accountId: string;
    email: string;
    ts: string
};

export type AccountDeleted = {
    accountId: string;
    ts: string;
};

export const AUTH_EXCHANGE = "auth.topic";
export const RK_ACCOUNT_CREATED = "auth.account.created";
export const RK_ACCOUNT_DELETED = "auth.account.deleted";