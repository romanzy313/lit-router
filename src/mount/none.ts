import { RouterInterface, Path } from '../types';

//when there is no hook, we always start at the root
//and there is an internal stack to keep track of it
export class NoHook implements RouterInterface {
  onNavigate(cb: (path: string) => void) {
    throw new Error('Method not implemented.');
  }
  currentPath(): Path {
    return '/';
  }
  forward(): void {
    throw new Error('Method not implemented.');
  }
  back(): void {
    throw new Error('Method not implemented.');
  }
  navigate(path: string): void {}
  mount(): void {}
  unmount(): void {}
}
