# cds feature toggle

> support feature toggle pattern for SAP CAP cds

[![node-test](https://github.com/Soontao/cds-feature-toggle/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Soontao/cds-feature-toggle/actions/workflows/nodejs.yml)
[![npm](https://img.shields.io/npm/v/cds-feature-toggle)](https://www.npmjs.com/package/cds-feature-toggle)
[![codecov](https://codecov.io/gh/Soontao/cds-feature-toggle/branch/main/graph/badge.svg?token=36cAQGIQWC)](https://codecov.io/gh/Soontao/cds-feature-toggle)
[![license](https://img.shields.io/npm/l/cds-feature-toggle)](./LICENSE)

## Quick Overview


```groovy
// all event/entity/action/function require 'class-service' feature
@cds.features.required : ['class-service'] 
service ClassService {

  // annotate the entity events
  entity Students @(cds.features : [
    {
      on       : 'READ', 
      required : 'feat-student-get'
    },
    {
      on       : 'UPDATE',
      required : 'feat-student-update'
    },
    {
      on       : 'DELETE',
      required : 'feat-student-delete'
    }
    // other event will skip feature check
  ])              as projection on training.Student;

  // enabled by default
  // if 'metricV2' or 'metricV3' is enabled, 
  // will prefer to trigger the redirect action
  @cds.features.redirect.target : [metricV2]
  action metric() returns MetricResponse;

  // enabled when request context has the feature 'feature-metrics-v2'
  // if 'feature-metrics-v3' is also enabled, 
  // will prefer to trigger the metricV3
  @cds.features.required         : 'feature-metrics-v2'
  @cds.features.redirect.target : [metricV3]
  action metricV2() returns MetricResponse;

  @cds.features.required : 'feature-metrics-v3'
  action metricV3() returns MetricResponse;

}
```

## Setup

> you need to enable the `cds-feature-toggle` in CAP [`server.js`](https://cap.cloud.sap/docs/node.js/cds-serve#custom-server-js)

```bash
npm i -S cds-feature-toggle
```

```js
// projectRoot/srv/server.js
const cds = require('@sap/cds')
const { features, providers: { CDSRequestProvider } } = require("cds-feature-toggle")


cds.once('bootstrap', app => {
  // whatever thing here
})


features.supportFeatureAnnotate(cds, new CDSRequestProvider())

module.exports = cds.server
```

## Providers

`cds-feature-toggle` provided a very simple provider which named `CDSRequestProvider`, it will extract http header `x-cds-features` as feature labels.


```ts
export class CDSRequestProvider implements FeatureProvider {

  #headerName = "x-cds-features";

  /**
   * extract http header as (enabled) feature list for current request
   * 
   * @param featureHeaderName default is `x-cds-features`
   */
  constructor(featureHeaderName?: string) {
    if (featureHeaderName !== undefined) {
      this.#headerName = featureHeaderName;
    }
  }

  public getFeatures(context: DetermineContext) {
    // TODO: add signature verify
    return Promise.resolve(context?.request?.get?.(this.#headerName)?.split(",") ?? []);
  }

}
```

you can easily implement a feature provider by yourself, read feature from `redis` or `database`, it depends on you. 

## TODO

- [x] support redirect for bounded `action`/`function`
- [ ] support `@cds.features.required` on full entity 
- [ ] support SAP BTP feature toggle service (as feature provider)

## Limitation

* the default no handler behavior for `action`/`function` will be little difference

## [CHANGELOG](./CHANGELOG.md)

## [LICENSE](./LICENSE)
