namespace test.app.people;

using {
  Country,
  managed,
  cuid
} from '@sap/cds/common';


type FreeActionResponse {

  service : String;
  name    : String;

}

@cds.features.enabled : 'people-service'
@impl                 : './impl/PeopleService.js'
service PeopleService {

  entity Peoples : cuid {
    Name : String(255)
  }


  action freeAction(name : String) returns FreeActionResponse;

  @cds.features.enabled : [
    'feat-free-action-v2',
    'all-features'
  ]
  action freeActionV2(name : String) returns FreeActionResponse;

}
