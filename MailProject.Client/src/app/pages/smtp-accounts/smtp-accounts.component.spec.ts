import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpAccountsComponent } from './smtp-accounts.component';

describe('SmtpAccountsComponent', () => {
  let component: SmtpAccountsComponent;
  let fixture: ComponentFixture<SmtpAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpAccountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmtpAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
