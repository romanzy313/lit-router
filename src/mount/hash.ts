import { RouterInterface } from '../types';

export class Hash implements RouterInterface {
  private routerCb!: (path: string) => void;

  private getPathFromURL(url: string) {
    const paths = url.split('#');
    const routeUrl = paths.length == 2 ? paths[1] : '/'; // no need to substring it

    console.log('current hash is', routeUrl);

    return routeUrl;
  }

  private onHashChange = (ev) => {
    const routeUrl = this.getPathFromURL(ev.newURL);
    console.log('hash navigated to', routeUrl);
    //when hash changes, we need to navigate?
    // this.navigate(routeUrl);
    this.routerCb(routeUrl);
  };

  currentPath(): string {
    return this.getPathFromURL(window.location.href);
  }
  forward(): void {
    // throw new Error('Method not implemented.');
    window.history.go(1);
  }
  back(): void {
    window.history.go(-1);
  }
  navigate(path: string): void {
    // throw new Error('Method not implemented.');
    window.location.hash = `#${path}`;
  }
  mount(cb: (path: string) => void): void {
    window.addEventListener('hashchange', this.onHashChange);
    this.routerCb = cb;
  }
  unmount(): void {
    window.removeEventListener('hashchange', this.onHashChange);
  }
}
