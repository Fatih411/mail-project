import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailReportsComponent } from './mail-reports.component';

describe('MailReportsComponent', () => {
  let component: MailReportsComponent;
  let fixture: ComponentFixture<MailReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
