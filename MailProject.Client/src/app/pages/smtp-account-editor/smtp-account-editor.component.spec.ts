import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpAccountEditorComponent } from './smtp-account-editor.component';

describe('SmtpAccountEditorComponent', () => {
  let component: SmtpAccountEditorComponent;
  let fixture: ComponentFixture<SmtpAccountEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpAccountEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmtpAccountEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
