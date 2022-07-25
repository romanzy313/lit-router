## High priority

- [ ] Resolver definitions
  - [ ] Pass no, single, or array of resolvers
  - [ ] Pass async, function, or string into render
- [ ] Highly improve lit-router element. Use router, outlet, and navigator mixins. Like here https://www.npmjs.com/package/lit-element-router
- [ ] Implement .withDefaultRoutes() which autoinjects default pages. Then user can overrwrite them. The default pages are 404, 403, 400, 500.
  - [ ] add sensible default styles
  - [ ] Handle redirects
- [ ] Cache html results of routes, not just resolution status. cache:true on route overrides

- [ ] remove lit from the name? as this can be generic

## Low priority

- [ ] Add wildcards \* and \*\*
- [ ] UMD build globals undefined

## Cool ideas

- [ ] Use middleware stack instead of current promise implementation, will allow custom hooks
