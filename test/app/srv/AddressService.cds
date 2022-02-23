using {
  cuid,
  managed
} from '@sap/cds/common';


@path : '/address'
service AddressService {

  @cds.features.required : 'feat-address-management'
  @cds.features          : [{
    on       : 'CREATE',
    required : 'feat-address-management-add-write'
  }]
  entity Address : cuid, managed {
    Country  : String(255);
    Province : String(255);
    Street   : String(255);
    Detail   : String(255);
  }

}
