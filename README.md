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

  // annotate the entity built-in events
  @cds.features : [
    {
      on       : 'DELETE',
      required : 'feat-student-delete' // generally, maybe we dis-allowed user to delete entry
    }
    // other event will skip feature check
  ]
  entity Students               as projection on training.Student;

  // or simply require feature for all events/action/function under the entity
  @cds.features.required: 'feat-teacher-management'
  entity Teachers  as projection on training.Teacher;

  // enabled by default
  // if 'metricV2' or 'metricV3' is enabled, 
  // will prefer to trigger the redirect action
  @cds.features.redirect.target : [metricV2]
  action metric() returns MetricResponse;

  // enabled when request context has the feature 'feature-metrics-v2'
  @cds.features.required         : 'feature-metrics-v2'
  action metricV2() returns MetricResponse;


}
```

## Setup

> you need to enable the `cds-feature-toggle` by `cds-hyper-app-service` extension config

```bash
npm i -S cds-hyper-app-service cds-feature-toggle
```

```js
{
  "cds": {
    "requires": {
      "app-service": {
        "impl": "cds-hyper-app-service",
        "exts": [
          "builtIn",
          {
            "impl": "cds-feature-toggle",
            "providers": [
              {
                "impl": "CDSRequestProvider",
                "header": "x-cds-features"
              }
            ]
          }
        ]
      }
    }
  }
}
```

## Providers

`cds-feature-toggle` provided a very simple provider which named `CDSRequestProvider`, it will extract http header `x-cds-features` as feature labels.


```ts
export class CDSRequestProvider implements FeatureProvider {
  #headerName = HEADER_X_CDS_FEATURES_NAME;
  /**
   * extract http header as (enabled) feature list for current request
   * 
   * @param options.featureHeaderName default is `x-cds-features`
   */
  constructor(options: { featureHeaderName?: string }) {
    if (typeof options?.featureHeaderName === "string") {
      this.#headerName = options?.featureHeaderName;
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
- [x] support `@cds.features.required` on full entity 
- [x] built-in provider interface
  - [x] cds request header provider
  - [x] dummy provider for test
- [ ] support `cds-nats` KV

## Limitation

* the default no handler behavior for `action`/`function` will be little difference

## [CHANGELOG](./CHANGELOG.md)

## [LICENSE](./LICENSE)
