// // source: https://muniftanjim.dev/blog/basic-middleware-pattern-in-javascript/

// type Next = () => Promise<void> | void;
// export type ErrorShape = (code: number, originalError?: Error) => void; //this will require wrapping error function

// export type Middleware<T> = (context: T, next: Next) => Promise<void> | void; //, error: ErrorShape

// type Pipeline<T> = {
//   push: (...middlewares: Middleware<T>[]) => void;
//   execute: (context: T) => Promise<void>;
// };

// // source https://gist.github.com/darrenscerri/5c3b3dcbe4d370435cfa
// export class Pipeline2 {
//   push(name: string, fn) {
//     this.execute = ((stack) => (ctx, next, err) => {
//       const newErr = (code: number, ogErr: ErrorShape) => {
//         throw {
//           code,
//           ogErr,
//         };
//       };
//       return stack(ctx, fn.bind(this, next(ctx).bind(this)), newErr);
//     })(this.execute);
//   }

//   execute = (ctx, next, err) => next(ctx);
// }

// export function Pipeline<T>(...middlewares: Middleware<T>[]): Pipeline<T> {
//   const stack: Middleware<T>[] = middlewares;
//   const push: Pipeline<T>['push'] = (...middlewares) => {
//     // middlewares.forEach((middleware) => {
//     //   const withError = (ctx: T, next: Next, error: ErrorShape) => {};
//     // });
//     stack.push(...middlewares);
//   };

//   const execute: Pipeline<T>['execute'] = async (context) => {
//     let prevIndex = -1;

//     const runner = async (index: number): Promise<void> => {
//       // if (index === prevIndex) {
//       //   throw new Error('next() called multiple times');
//       // }

//       prevIndex = index;

//       const middleware = stack[index];

//       // if (middleware) {
//       await middleware(context, () => {
//         return runner(index + 1);
//       });
//       // }
//     };

//     await runner(0);
//   };

//   return { push, execute };
// }
