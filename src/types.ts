import { TemplateResult } from 'lit';
import { LitRouter } from './LitRouter';

export type EventMap = {
  loading: (path: Path) => void;
  ready: (router: LitRouter) => void;
  //optional route name
  route: (routeResult: RouteResult) => void;
  error: (routeResult: RouteErrorResult) => void;
};

export type RouteError = {
  where: string; //its a named middlewhere,
  withStatus: number;
  error: Error;
};

export type Context = {
  pendingRoute: PendingRoute;
};

export type RouteState = 'ok' | 'pending' | 'error';
export type MountStrategy = 'none' | 'hash' | 'page';

export type Path = string;
export type Status = number;
export type ParsedParams = Record<string, string>;
// export type StatusCode = string;
export type RouteRequest = {
  path: Path;
  params: ParsedParams;
};

export type FailureData = {
  //original request information
  request: RouteRequest;
  error: Error;
  router: LitRouter;
};

export type ErrorObj = { path: Path; error: Error };

export type AsyncTemplateResult = Promise<TemplateResult<1>> | TemplateResult<1>;
// | string
// | typeof nothing;

export type RouteResult = RouteOkResult | RouteErrorResult;

export type RouteOkResult = {
  path: Path;
  params: ParsedParams;
  html: TemplateResult<1>;
  status: Status; // it is a number, always a number
  failure: null; //set when there was an error in the stack
};

export type RouteErrorResult = {
  path: Status;
  params: ParsedParams;
  html: TemplateResult<1>;
  status: Status;
  failure: FailureData;
};

export type ErrorRouteDefinition = {
  resolve: (params: FailureData) => Promise<any>[];
  render: (params: FailureData) => AsyncTemplateResult;
};

export type RouteDefinition = {
  resolve: (params: ParsedParams) => Promise<any>[];
  render: (params: ParsedParams) => AsyncTemplateResult;
};

export type InternalRouteDefinition = {
  path: Path | Status;
} & RouteDefinition;

export type PendingRoute = PendingOkRoute | PendingErrorRoute;

export type PendingOkRoute = {
  path: Path;
  params: ParsedParams;
  status: 200;
} & RouteDefinition;

export type PendingErrorRoute = {
  path: Status;
  params: FailureData;
  status: Status;
} & ErrorRouteDefinition;

export type RouteDefinitions =
  | {
      [path: Path]: RouteDefinition;
    }
  | {
      [status: Status]: ErrorRouteDefinition;
    };

export interface RouterInterface {
  currentPath(): Path;
  forward(): void;
  back(): void;
  navigate(path: Path): void;
  mount(navigateCb: (path: Path) => void): void;
  unmount(): void;
}

interface Match<T> {
  value: T;
  url: string;
  params: { [key: string]: string } | null;
}

export interface Matcher<T> {
  (path: string): Match<T>;
}
