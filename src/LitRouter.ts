// my own router implementation,
// should not be static but an instance
// need some way to handle errors, 404 and 403
// call to html should be async

import { html, nothing, TemplateResult } from 'lit';
import { WebEventEmitter } from '@romanzy/web-event-emitter';
import { unhandledErrorRoute } from './defaults';
import createMatcher from 'feather-route-matcher';
import {
  RouteDefinitions,
  RouteErrorResult,
  EventMap,
  Path,
  PendingRoute,
  RouteDefinition,
  PendingOkRoute,
  RouteOkResult,
  RouteResult,
  RouteRequest,
  RouteState,
  RouterInterface as MountInterface,
  Matcher,
  PendingErrorRoute,
  ErrorRouteDefinition,
} from './types';
import { NoHook } from './mount/none';
import { Hash } from './mount/hash';

export class LitRouter extends WebEventEmitter<EventMap> {
  private routes: RouteDefinitions = {};

  private routeResult?: RouteResult;
  private _pending = true;
  private placeholder: () => any = () => 'Loading...';
  // FIX check this
  private matcher?: Matcher<RouteDefinition>;
  private mount: MountInterface = new NoHook();

  get status(): RouteState {
    if (!this.routeResult || this._pending) return 'pending';
    if (this.routeResult.failure) return 'error';

    return 'ok';
  }

  get isPending() {
    return this._pending;
  }

  get error(): Error | undefined {
    return this.routeResult?.failure?.error;
  }

  get html(): TemplateResult<1> | undefined {
    return this.routeResult?.html;
  }

  // TODO needs to store full route results in a map, not resolution
  // TODO allow cache to be disabled
  private resolvedResults: Set<string> = new Set();

  constructor() {
    super();
  }

  public register(path: string, definition: RouteDefinition) {
    this.routes[path] = definition;
    return this;
  }

  public withDefaultRoutes() {
    // TODO implement
    return this;
  }

  public withPlaceholder(html: () => TemplateResult) {
    this.placeholder = html;
  }

  public define(definitions: RouteDefinitions) {
    this.routes = { ...this.routes, ...definitions };
    return this;
  }

  public mountTo(mount: new () => MountInterface) {
    this.mount = new mount();
    return this;
  }

  public async start() {
    if (!this.routes || Object.keys(this.routes).length == 0)
      throw new Error('Define routes first!');

    // add catch all last. needed for feather route library
    if (!('*' in this.routes)) this.routes['*'] = unhandledErrorRoute as any;

    this.matcher = createMatcher(this.routes) as any;

    const path = this.mount.currentPath();
    this.routeResult = {
      path: path,
      params: {},
      html: this.placeholder(),
      status: 200,
      failure: null,
    };

    await this.navigateSilent(path);
    this.mount.mount((path: Path) => {
      this.navigateSilent(path);
    });

    return this;
  }

  public stop() {
    // this needs more cleanup?

    this.mount.unmount();
  }

  // navigates to page, without notifying the router
  private async navigateSilent(path: Path): Promise<boolean> {
    // for now does not support cancellin of previous request
    this._pending = true;
    this.emit('loading', path);

    this.routeResult = await this.tryNavigate(path);

    console.log('got route result', this.routeResult);

    if (this.routeResult.failure) this.emit('error', this.routeResult);

    console.warn('emitting route eesults');

    this.emit('route', this.routeResult);

    return this.routeResult.failure ? false : true;
  }

  public async navigate(path: Path): Promise<boolean> {
    this.mount.navigate(path);
    return this.navigateSilent(path);
  }

  private async tryNavigate(path: Path): Promise<RouteResult> {
    return await this.matchRoute(path)
      .then((r) => this.resolveRoute(r))
      .then((r) => this.renderRoute(r))
      .catch((errorResult: RouteErrorResult) => {
        return errorResult;
      });
  }

  public back() {
    this.mount.back();
  }

  public forward() {
    this.mount.forward();
  }

  private async buildFailedPendingRoute(
    where: string,
    withStatus: number,
    error: Error,
    request: RouteRequest
  ): Promise<RouteErrorResult> {
    const errorParams = {
      error,
      request,
      router: this,
    };
    const errorRouteDef =
      (this.routes[withStatus] as unknown as ErrorRouteDefinition) ??
      (this.routes['*'] as unknown as ErrorRouteDefinition);

    console.error('Error on', request.path, 'in', where, 'with status code', withStatus);
    console.error(error);

    const html = await errorRouteDef.render(errorParams);
    return {
      path: withStatus,
      html,
      params: request.params,
      status: withStatus,
      failure: errorParams,
    }; //cause its string but whatevs
  }

  private matchRoute(path: string) {
    console.log('routing to', path);

    return new Promise<PendingOkRoute>((resolve, reject) => {
      //detecting empty value is rather annoying...
      const res = this.matcher!(path);
      const params = res.params ?? {};
      // can attach special key to detect this better, yes!
      // TODO check this
      if (params.path && params.path == path) {
        console.log('route not found on', params);

        return reject(
          this.buildFailedPendingRoute('route', 404, new Error(`${res.url} is not found`), {
            path,
            params,
          })
        );
      }

      return resolve({
        path,
        params,
        status: 200,
        ...res.value,
      });

      //own implementation of the router
      /*
      if (path == '/') {
        // const indexRouteDef = this.routes.find((r) => r.path == '/');
        const indexRouteDef = this.routes['/'];
        if (!indexRouteDef) {
          return reject(
            this.buildFailedPendingRoute(
              {
                path,
                params: {},
              },
              404,
              'index route is not defined'
            )
          );
          // this.getErrorResultWithMessage('404', 'index route is not defined')
        }

        return resolve({
          path,
          params: {},
          status: 200,
          ...indexRouteDef,
        });
      }

      // lets go search, this is not very sophisticated (can do regex I think)
      // but this is easier. First route cannot
      const pathParts = path.substring(1).split('/');

      // console.log('route paths', pathParts);

      need array to object conversion
      // search the first path:
      const foundRoute = this.routes.find(
        // eslint-disable-next-line arrow-body-style
        (r) => {
          return r.path.substring(1).split('/')[0] == pathParts[0];
        }
      );

      if (!foundRoute) {
        console.error('routing', `dynamic route at ${path} not found`);

        return reject(
          this.buildFailedPendingRoute('404', `${path} route is not defined`)
        );
      }
      // else extract the params

      const routeParts = foundRoute.path.substring(1).split('/');

      if (pathParts.length !== routeParts.length) {
        console.error(
          'routing',
          `invalid number of args for path ${path} in dynamic route ${foundRoute.path}`
        );
        return reject(
          this.buildFailedPendingRoute('404', `${path} route is not defined`)
        );
      }

      // just mix and match
      const params: ParsedParams = {};

      // the i starting at 1 is a risky business
      for (let i = 1; i < routeParts.length; i++) {
        const key = routeParts[i].substring(1);
        const value = pathParts[i];
        params[key] = value;
      }

      return resolve({
        ...foundRoute,
        params,
        status: '200',
      });
      search for first param to match, the rest are optional
       */
    });
  }

  private resolveRoute(pendingRoute: PendingOkRoute): Promise<PendingOkRoute> {
    console.log('resolving route', pendingRoute);

    return new Promise<PendingOkRoute>((resolve, reject) => {
      // TODO this actually needs to store it in the map with results
      // which needs to be done after the .next chain
      if (this.resolvedResults.has(pendingRoute.path)) return pendingRoute;

      const resolveArray = pendingRoute.resolve(pendingRoute.params);
      if (resolveArray.length == 0) {
        console.log('resolving route preemptive okay');

        return resolve(pendingRoute);
      }

      Promise.all(resolveArray)
        .then((resolveResult) => {
          console.log('resolving route full okay', resolveResult);

          return resolve(pendingRoute);
        })
        .catch((error) => {
          console.error('resolving route full error', 'pending route', pendingRoute);

          //catch the errors here and assign correct render view

          // TODO here need to add support for error and return code
          // handle standard errors from fetch

          return reject(
            this.buildFailedPendingRoute('resolve', 400, error, {
              path: pendingRoute.path,
              params: pendingRoute.params,
            })
          );
        });
    });
  }

  private renderRoute(pendingRoute: PendingOkRoute): Promise<RouteOkResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<RouteOkResult>(async (resolve, reject) => {
      try {
        const html = await pendingRoute.render(pendingRoute.params);
        return resolve({
          path: pendingRoute.path,
          html,
          params: pendingRoute.params,
          status: pendingRoute.status,
          failure: null,
        });
      } catch (error) {
        return reject(
          this.buildFailedPendingRoute('render', 400, error as Error, {
            path: pendingRoute.path,
            params: pendingRoute.params,
          })
        );
      }
    });
  }
}
