export interface ResType<T> {
  code: 200 | 400 | 401 | 403 | 404 | 500;
  desc: string;
  data: T;
}
