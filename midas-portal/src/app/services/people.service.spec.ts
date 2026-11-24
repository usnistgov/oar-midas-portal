import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PeopleService } from './people.service';
import { ConfigurationService } from '../../../../lib/dist/oarng';

describe('PeopleService', () => {
  function serviceWith(config: any): { svc: PeopleService, http: HttpTestingController } {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PeopleService,
        { provide: ConfigurationService, useValue: { getConfig: () => config } }
      ]
    });
    return {
      svc: TestBed.inject(PeopleService),
      http: TestBed.inject(HttpTestingController)
    };
  }

  it('builds the NSD endpoints from staffdir.serviceEndpoint', () => {
    const { svc, http } = serviceWith({
      staffdir: { serviceEndpoint: 'https://localhost/midas/nsd/oar1' }
    });

    svc.getNISTPersonnel('SMITH').subscribe();
    http.expectOne('https://localhost/midas/nsd/oar1/people/index?SMITH').flush([]);

    svc.getNISTOrganizations('ITL').subscribe();
    http.expectOne('https://localhost/midas/nsd/oar1/orgs/index?ITL').flush([]);

    svc.getNISTPerson('42').subscribe();
    http.expectOne('https://localhost/midas/nsd/oar1/people/42').flush({});

    http.verify();
  });

  it('tolerates a trailing slash on the endpoint', () => {
    const { svc, http } = serviceWith({
      staffdir: { serviceEndpoint: 'https://localhost/midas/nsd/oar1/' }
    });

    svc.getNISTPersonnel('SMITH').subscribe();
    http.expectOne('https://localhost/midas/nsd/oar1/people/index?SMITH').flush([]);
    http.verify();
  });

  // config servers that predate the staffdir migration still publish the URLs flat
  it('falls back to the legacy flat URL keys', () => {
    const { svc, http } = serviceWith({
      peopleURL: 'https://legacy/nsd/oar1/people/index',
      orgURL: 'https://legacy/nsd/oar1/orgs/index',
      personURL: 'https://legacy/nsd/oar1/people'
    });

    svc.getNISTPersonnel('SMITH').subscribe();
    http.expectOne('https://legacy/nsd/oar1/people/index?SMITH').flush([]);

    svc.getNISTOrganizations('ITL').subscribe();
    http.expectOne('https://legacy/nsd/oar1/orgs/index?ITL').flush([]);

    http.verify();
  });

});
