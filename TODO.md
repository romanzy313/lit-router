## High priority

- [ ] Resolver definitions
  - [ ] Pass no, single, or array of resolvers
  - [ ] Pass async, function, or string into render
- [ ] Rearange order so that render is called first
- [ ] Highly improve lit-router element. Use router, outlet, and navigator mixins. Like here https://www.npmjs.com/package/lit-element-router
- [ ] Implement .withDefaultRoutes() which autoinjects default pages. Then user can overrwrite them. The default pages are 404, 403, 400, 500.
  - [ ] pass the error too via error parameter, type them so that numbers have that, but only when they are keys
  - [ ] add sensible default styles
  - [ ] Handle redirects
- [ ] Cache results of routes. default failed routes are not cached. cache enable forces override
- [ ] Unit testing

## Low priority

- [ ] Add wildcards \* and \*\*
- [ ] UMD build globals undefined

## Cool ideas

- [ ] Use middleware stack instead of many promises, will allow external registration
- [ ] Different modes of resolving. In render and resolve functions: exec everything except the first one. If any return error, do not attempt first value resolution. This assumes first values of these resolvers are the heaviest
      If any render returns 403, 404, 302, 302 or 5xx we do not try to resolve and just return the error.

## Now unneeded features (or out of scope)

- [ ] Preload - allow server to give us path and the html
