import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailTemplateEditorComponent } from './mail-template-editor.component';

describe('MailTemplateEditorComponent', () => {
  let component: MailTemplateEditorComponent;
  let fixture: ComponentFixture<MailTemplateEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailTemplateEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailTemplateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
