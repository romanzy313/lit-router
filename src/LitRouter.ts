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
  RouteError,
  Context,
} from './types';
import { NoHook } from './mount/none';
import { Hash } from './mount/hash';
import { ErrorShape, Pipeline2 } from './middleware/pipeline';

export class LitRouter extends WebEventEmitter<EventMap> {
  private routes: RouteDefinitions = {};

  private routeResult?: RouteResult;
  private _pending = true;
  private placeholder: () => any = () => 'Loading...';
  // FIX check this question
  private matcher?: Matcher<RouteDefinition>;
  private mount: MountInterface = new NoHook();
  private pipeline = new Pipeline2();
  // private pipeline = Pipeline<PendingOkRoute>;
  private resolvedResults: Set<string> = new Set();

  constructor() {
    super();
    this.pipeline.push('resolve', this.resolveRoute);
    this.pipeline.push('render', this.renderRoute);
    // this.pipeline.push(this.renderRoute);
  }

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
    //need to first match it
    let pendingRoute = {} as PendingRoute;
    try {
      pendingRoute = await this.matchRoute(path);
      // this.pipeline.execute(context);
      const errorCb: ErrorShape = (code, originalError) => {
        throw {
          code,
          originalError,
        };
      };
      //here execute the middleware
      this.resolveRoute(pendingRoute, errorCb);
    } catch (e) {
      const { where, withStatus, error } = e as RouteError;
      pendingRoute = this.buildFailedPendingRoute(where as any, withStatus as any, error, {
        path,
        params: pendingRoute.params as any,
      });
      //error is irrelevant for now?
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return await this.renderRoute(pendingRoute); //this will never fail
    }

    // return await this.matchRoute(path)
    //   .then((r) => this.resolveRoute(r))
    //   .catch((errorResult: PendingErrorRoute) => {
    //     return errorResult;
    //   })
    //   .then((r) => this.renderRoute(r));
  }

  public back() {
    this.mount.back();
  }

  public forward() {
    this.mount.forward();
  }

  //do not return the result! just make it like a route
  // TODO this should not be async?
  private buildFailedPendingRoute(
    where: string,
    withStatus: number,
    error: Error,
    request: RouteRequest
  ): PendingErrorRoute {
    const errorRouteDef =
      (this.routes[withStatus] as unknown as ErrorRouteDefinition) ??
      (this.routes['*'] as unknown as ErrorRouteDefinition);

    console.error('Error on', request.path, 'in', where, 'with status code', withStatus);
    console.error(error);

    return {
      path: withStatus,
      params: {
        error,
        request,
        router: this,
      },
      status: withStatus,
      ...errorRouteDef,
    }; //cause its string but whatevs
  }

  private matchRoute(path: Path): Promise<PendingOkRoute> {
    console.log('routing to', path);

    return new Promise<PendingOkRoute>((resolve, reject) => {
      const res = this.matcher!(path);
      const params = res.params ?? {};

      // this should work
      if (params.path && params.path == path) {
        console.log('route not found on', params);

        //dont build it in here... we know path and params... just throw
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

  // I can create my own error and throw it

  private resolveRoute(pendingRoute: PendingOkRoute, errorFn: ErrorShape) {
    console.log('resolving route', pendingRoute);

    // TODO this actually needs to store it in the map with results
    // which needs to be done after the .next chain
    if (this.resolvedResults.has(pendingRoute.path)) return;

    const resolveArray = pendingRoute.resolve(pendingRoute.params);
    if (resolveArray.length == 0) {
      console.log('resolving route preemptive okay');
      return;
      // return resolve(pendingRoute);
    }

    Promise.all(resolveArray)
      .then((resolveResult) => {
        console.log('resolving route full okay', resolveResult);

        // return resolve(pendingRoute);
      })
      .catch((error) => {
        console.error('resolving route full error', 'pending route', pendingRoute);

        //catch the errors here and assign correct render view

        // TODO here need to add support for error and return code
        // handle standard errors from fetch

        errorFn(400, error);
        // return reject(
        //   this.buildFailedPendingRoute('resolve', 400, error, {
        //     path: pendingRoute.path,
        //     params: pendingRoute.params,
        //   })
        // );
      });
  }

  //technically its PendingErrorRoute but ts is strict
  private async renderRoute(pendingRoute: PendingRoute): Promise<RouteResult> {
    // if (pendingRoute.status === 200)
    // {
    //   // meaning its okay
    // }

    // eslint-disable-next-line no-async-promise-executor

    let html;
    try {
      html = await pendingRoute.render(pendingRoute.params as any);
    } catch (error) {
      // errorFn(400, error as Error);
      pendingRoute = this.buildFailedPendingRoute(
        'render',
        400,
        error as Error,
        {
          path: pendingRoute.path,
          params: pendingRoute.params,
        } as any
      ) as any;
      html = await pendingRoute.render(pendingRoute.params as any);
    }

    return {
      path: pendingRoute.path,
      html,
      params: pendingRoute.params,
      status: pendingRoute.status,
      failure: pendingRoute.status === 200 ? null : pendingRoute.params,
    } as any;
    //ah this is unique
  }

  // private renderRoute(pendingRoute: PendingRoute): Promise<RouteResult> {
  //   // if (pendingRoute.status === 200)
  //   // {
  //   //   // meaning its okay
  //   // }

  //   // eslint-disable-next-line no-async-promise-executor
  //   return new Promise<RouteResult>(async (resolve, _reject) => {
  //     let html;
  //     try {
  //       html = await pendingRoute.render(pendingRoute.params as any);
  //     } catch (error) {
  //       pendingRoute = this.buildFailedPendingRoute(
  //         'render',
  //         400,
  //         error as Error,
  //         {
  //           path: pendingRoute.path,
  //           params: pendingRoute.params,
  //         } as any
  //       ) as any;
  //       html = await pendingRoute.render(pendingRoute.params as any);
  //     }

  //     return resolve({
  //       path: pendingRoute.path,
  //       html,
  //       params: pendingRoute.params,
  //       status: pendingRoute.status,
  //       failure: pendingRoute.status === 200 ? null : pendingRoute.params,
  //     } as any);
  //   });
  // }
}
