// import { InternalContext, Matcher, PendingOkRoute, RouteDefinition } from 'src/types';

// function matchRoute(ctx: InternalContext): Promise<PendingOkRoute> {
//   console.log('routing to', path);

//   return new Promise<PendingOkRoute>((resolve, reject) => {
//     const res = ctx.router.matcher!(path);
//     const params = res.params ?? {};

//     // this should work
//     if (params.path && params.path == path) {
//       console.log('route not found on', params);

//       return reject(
//         this.buildFailedPendingRoute('route', 404, new Error(`${res.url} is not found`), {
//           path,
//           params,
//         })
//       );
//     }

//     return resolve({
//       path,
//       params,
//       status: 200,
//       ...res.value,
//     });

//     //own implementation of the router
//     /*
//       if (path == '/') {
//         // const indexRouteDef = this.routes.find((r) => r.path == '/');
//         const indexRouteDef = this.routes['/'];
//         if (!indexRouteDef) {
//           return reject(
//             this.buildFailedPendingRoute(
//               {
//                 path,
//                 params: {},
//               },
//               404,
//               'index route is not defined'
//             )
//           );
//           // this.getErrorResultWithMessage('404', 'index route is not defined')
//         }

//         return resolve({
//           path,
//           params: {},
//           status: 200,
//           ...indexRouteDef,
//         });
//       }

//       // lets go search, this is not very sophisticated (can do regex I think)
//       // but this is easier. First route cannot
//       const pathParts = path.substring(1).split('/');

//       // console.log('route paths', pathParts);

//       need array to object conversion
//       // search the first path:
//       const foundRoute = this.routes.find(
//         // eslint-disable-next-line arrow-body-style
//         (r) => {
//           return r.path.substring(1).split('/')[0] == pathParts[0];
//         }
//       );

//       if (!foundRoute) {
//         console.error('routing', `dynamic route at ${path} not found`);

//         return reject(
//           this.buildFailedPendingRoute('404', `${path} route is not defined`)
//         );
//       }
//       // else extract the params

//       const routeParts = foundRoute.path.substring(1).split('/');

//       if (pathParts.length !== routeParts.length) {
//         console.error(
//           'routing',
//           `invalid number of args for path ${path} in dynamic route ${foundRoute.path}`
//         );
//         return reject(
//           this.buildFailedPendingRoute('404', `${path} route is not defined`)
//         );
//       }

//       // just mix and match
//       const params: ParsedParams = {};

//       // the i starting at 1 is a risky business
//       for (let i = 1; i < routeParts.length; i++) {
//         const key = routeParts[i].substring(1);
//         const value = pathParts[i];
//         params[key] = value;
//       }

//       return resolve({
//         ...foundRoute,
//         params,
//         status: '200',
//       });
//       search for first param to match, the rest are optional
//        */
//   });
// }
