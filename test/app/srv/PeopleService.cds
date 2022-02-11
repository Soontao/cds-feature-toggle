namespace test.app.people;

using {
  Country,
  managed,
  cuid
} from '@sap/cds/common';


@cds.features.enabled : 'people-service'
service PeopleService {

  entity Peoples : cuid {
    Name : String(255)
  }

}
