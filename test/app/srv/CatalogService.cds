namespace bookshop;

using {
  Country,
  managed,
  cuid
} from '@sap/cds/common';

service CatalogService @(path : '/browse') {

  entity Books {
    key ID     : Integer;
        title  : localized String;
        author : Association to Authors;
        stock  : Integer;
  }

  entity Authors {
    key ID    : Integer;
        name  : String;
        books : Association to many Books
                  on books.author = $self;
  }

  entity Orders @(cds.features : [
    {
      on      : 'READ',
      required : 'feat-order-get'
    },
    {
      on      : 'UPDATE',
      required : 'feat-order-update'
    },
    {
      on      : 'DELETE',
      required : ['feat-order-delete']
    }
  ]) : managed {
    key ID      : UUID;
        book    : Association to Books;
        country : Country;
        amount  : Integer;
  }

}
