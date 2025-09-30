export type BreakDownObject<O, R = void> = {
  [K in keyof O as string]: K extends string
    ? R extends string
      ? ObjectDotNotation<O[K], `${R}.${K}`>
      : ObjectDotNotation<O[K], K>
    : never;
};

export type ObjectDotNotation<O, R = void> = O extends string
  ? R extends string
    ? R
    : never
  : BreakDownObject<O, R>[keyof BreakDownObject<O, R>];

export type BaseCode = {
  success: "success";
  error: "error";
  forbidden: "forbidden";
  auth: {
    unauthorized: "auth.unauthorized";
    invalid_password: "auth.invalid_password";
    no_users: "auth.no_users";
    exists_email: "auth.exists_email";
  };
  database: {
    undefined: "undefined";
    duplicated: "database.duplicated";
    disconnected: "database.disconnected";
  };
};

export type PrefixCode<T> = T extends string ? `server:${T}` : never;

export type BaseResponse<R, M> = {
  code: PrefixCode<ObjectDotNotation<BaseCode>>;
  result: R;
  message?: string;
  metadata: M;
};
